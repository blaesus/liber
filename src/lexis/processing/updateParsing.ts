import {radixDatorum} from "../config"
import * as path from 'path'
import {parseWiktionaryPage} from "../parsing/wiktionary/parseWiktionaryPage"
import {Lexis} from "../lexis"
import {spawnConcurrent, writeFileAsync} from "../nodeUtils"
import {getWiktionaryData} from "../fetching/fetchWiktionary"
import {flatten} from "../util"
import {database} from "../fetching/database"

interface CompilerState {
    lemmata: string[]
    data: {
        [key in string]: Lexis[]
    }
    failures: {
        [lemma in string]: string
    }
}

async function compile(): Promise<CompilerState> {
    const totalT0 = Date.now()
    const CONCURRENT_TRANSFORMERS = 16

    const state: CompilerState = {
        lemmata: await database.getLemmata(),
        data: {},
        failures: {},
    }
    state.lemmata = state.lemmata.slice(0, +process.argv[2] || Infinity)

    const metrics = {
        totalTime: 0,
        N: state.lemmata.length
    }

    async function transform(task: string): Promise<void> {
        let lemma: string = ''
        if (state.lemmata.length) {
            lemma = state.lemmata[0]
            state.lemmata =state.lemmata.slice(1)
            if (state.lemmata.length % 100 === 0) {
                console.info(`transformer ${task}: handling lemma ${lemma} (${state.lemmata.length} remaining)`)
            }
        }
        else {
            return
        }
        try {
            const record = await getWiktionaryData(lemma)
            const {main: lexes} = parseWiktionaryPage(record.html)
            await database.updatePage({
                ...record,
                lexes,
            })
            state.data[lemma] = lexes
        }
        catch (error) {
            state.failures[lemma] = error.message
        }
        return transform(task)
    }

    await spawnConcurrent(transform, CONCURRENT_TRANSFORMERS)

    const lexes = Object.values(state.data)
                        .reduce(flatten, [])
                        .sort((lexisA, lexisB) =>
                            lexisA.lexicographia.lemma > lexisB.lexicographia.lemma ? 1 : -1
                        )

    await writeFileAsync(path.join(radixDatorum, 'failures.json'), JSON.stringify(state.failures, null, 4))
    metrics.totalTime = Date.now() - totalT0
    console.info(metrics)
    console.info(`average ${Math.round(metrics.totalTime * 100 / metrics.N)/100}ms/entry`)
    return state
}

compile()
