import fetch from 'node-fetch'
import {database, DownloadRecord} from "./database";

export function cleanLemma(s: string): string {
    return s.replace(/ā/g, 'a').replace(/ō/g, 'o').replace(/ī/g, 'i').replace(/ū/g, 'u').replace(/ē/g, 'e')
}

export async function getWiktionaryData(lemma: string): Promise<DownloadRecord> {
    const pages = await database.findPages(lemma)
    if (pages.length - 1 >= 0) {
        return pages[pages.length - 1]
    }
    else {
        return fetchWiktionary(lemma)
    }
}

export async function fetchWiktionary(lemma: string): Promise<DownloadRecord> {
    const wiktionaryUrl = `https://en.wiktionary.org/w/index.php?title=${encodeURIComponent(lemma)}&printable=yes`
    console.info(wiktionaryUrl)
    const response = await fetch(wiktionaryUrl)
    const html = await response.text()
    const record = await database.savePage({
        lemma,
        remoteUrl: wiktionaryUrl,
        source: 'wiktionary',
        html,
        lexes: [],
    })
    return record
}

if (require.main === module) {
    (async () => {
        const query = process.argv[2] + ''
        console.info(await fetchWiktionary(query))
        process.exit()
    })()
}
