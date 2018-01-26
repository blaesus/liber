import * as fs from 'fs'
import {join} from 'path'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import {getWiktionaryData} from "./fetchWiktionary"
import {spawnConcurrent} from "../nodeUtils"
import {radixDatorum, viaLemmata} from "../config";

async function main() {

    const CONCURRENT_DOWNLOADERS = 8
    const initialIndexPage = `https://en.wiktionary.org/wiki/Category:Latin_lemmas`
    const wiktionaryRoot = `https://en.wiktionary.org/`

    const state = {
        entries: [] as string[],
        allEntries: [] as string[],
        awaitIndex: true
    }

    function extractEntries($: CheerioStatic): string[] {
        return $('#mw-pages li>a').toArray().map(node => $(node).text())
    }

    function extractNextIndexUrl($: CheerioStatic): string | undefined {
        return $('#mw-pages a:contains(next page)').attr('href')
    }

    async function addEntries(pageUrl: string) {
        const html = await (await fetch(pageUrl)).text()
        const $ = cheerio.load(html)
        const newEntries = extractEntries($)
        state.entries = [
            ...state.entries,
            ...newEntries,
        ]
        state.allEntries = [
            ...state.allEntries,
            ...newEntries,
        ]
        console.info(`adding ${newEntries.length} entries`)
        const nextIndex = extractNextIndexUrl($)
        if (nextIndex) {
            const path = `${wiktionaryRoot}${nextIndex}`
            addEntries(path)
        }
        else {
            state.awaitIndex = false
            fs.writeFileSync(viaLemmata, JSON.stringify(state.allEntries))
        }
    }

    async function fetchEntry() {
        const nextEntry = state.entries[0]
        state.entries = state.entries.filter(entry => entry !== nextEntry)
        if (nextEntry) {
            try {
                await getWiktionaryData(nextEntry)
            }
            catch (error) {
                console.error(error.message)
            }
            fetchEntry()
        }
        else if (state.awaitIndex) {
            setTimeout(fetchEntry, 2000)
        }
    }

    await addEntries(initialIndexPage)
    await spawnConcurrent(fetchEntry, CONCURRENT_DOWNLOADERS)
    process.exit()
}

main()
