import {join} from 'path'
import * as readline from 'readline'
import { radixDatorum } from '../config'
import {
    Verbum, StatusFinitivi, representStatus, serializeStatum,
} from '../lexis'
import {readFileAsync} from "../nodeUtils";

const colors = {
    bright: "\x1b[1m",
    green: '\x1b[32m',
    reset: '\x1b[0m',
    red: "\x1b[31m",
}

function bright(s: string): string {
    return `${colors.bright}${s}${colors.reset}`
}

function green(s: string): string {
    return `${colors.green}${s}${colors.reset}`
}

function red(s: string): string {
    return `${colors.red}${s}${colors.reset}`
}

const lineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function randomChoice<T>(options: T[]): T {
    return options[Math.floor(options.length * Math.random())]
}

function weightedRandomChoice<T extends string>(options: Row<T>[]): T {
    const flattenedOptions: T[] = options.map(row => Array(row[1]).fill(row[0]))
                                         .reduce((accumulated, next) => accumulated.concat(next), [])
    return randomChoice(flattenedOptions)
}

type Row<T extends string> = [T, number]

const modi: Row<StatusFinitivi['modus']>[] = [
    ['indicativus', 3],
    ['imperativus', 0],
    ['coniunctivus', 0],
]

const voces: Row<StatusFinitivi['vox']>[] = [
    ['activa', 3],
    ['passiva', 0],
]

const personae: Row<StatusFinitivi['persona']>[] = [
    ['tertia', 1],
    ['secunda', 1],
    ['prima', 1],
]


const aspectūs: Row<StatusFinitivi['aspectus']>[] = [
    ['imperfectivus', 1],
    ['perfectivus', 9],
]

const tempora: Row<StatusFinitivi['tempus']>[] = [
    ['praesens', 1],
    ['praeteritus', 0],
    ['futurus', 0],
]

const numeri: Row<StatusFinitivi['numerus']>[] = [
    ['singularis', 1],
    ['pluralis', 1],
]

function getRandomStatus() {
    return {
        modus: weightedRandomChoice(modi),
        vox: weightedRandomChoice(voces),
        tempus: weightedRandomChoice(tempora),
        aspectus: weightedRandomChoice(aspectūs),
        numerus: weightedRandomChoice(numeri),
        persona: weightedRandomChoice(personae),
    }
}

function nextTest(verbum: Verbum) {
    let inflectio: [StatusFinitivi, string] = [{} as any, '']
    while (!inflectio[1]) {
        const randomStatus = getRandomStatus()
        const key = serializeStatum('verbum', randomStatus)
        const formae = verbum.inflectiones[key]
        if (formae) {
            inflectio = [randomStatus, formae[0]]
        }
    }
    const question = bright(verbum.lexicographia.lemma) + ' ' + representStatus(inflectio[0])
    lineInterface.question('\n'+question+'\n', answer => {
        if (answer === 'x') {
            lineInterface.close()
        }
        else if (inflectio) {
            console.info((answer === inflectio[1] ? green : red)(inflectio[1] || '~'))
            nextTest(verbum)
        }
    })
}

async function main() {
    const path = join(radixDatorum, 'sum-verbum.json')
    const verba: Verbum = JSON.parse((await readFileAsync(path)).toString())
    nextTest(verba)
}

main()
