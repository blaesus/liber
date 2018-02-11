import {database, PageRecord, ParseResult} from '../database'
import {parseWiktionaryHtml} from './htmlParsers/parseWiktionaryHtml'
import {getWiktionaryPage} from '../A-WiktionaryToPage/fetchPage'

export async function parsePage(page: PageRecord): Promise<ParseResult> {
    try {
        const {main, auxiliary} = parseWiktionaryHtml(page.html)
        const lexes = [...main, ...auxiliary]
        return database.upsertParse({
            success: true,
            entry: page.entry,
            pageUrl: page.remoteUrl,
            lexes,
        })
    }
    catch (error) {
        return database.upsertParse({
            success: false,
            entry: page.entry,
            pageUrl: page.remoteUrl,
            error: error.message,
        })
    }
}

export async function getParseByEntry(
    entry: string,
    options: {
        forceReparse?: boolean
        forceRefetch?: boolean
    } = {}
): Promise<ParseResult> {
    const {forceReparse, forceRefetch} = options
    const existingParse = await database.getParseByEntry(entry)
    if (existingParse && !forceReparse) {
        return existingParse
    }
    else {
        const page = await getWiktionaryPage(entry, forceRefetch)
        return parsePage(page)
    }
}

export async function main() {
    await database.connect()
    const entry = process.argv[2]
    const parse = await getParseByEntry(entry, {forceReparse: true, forceRefetch: true})
    console.info(JSON.stringify(parse, null, 4))
    process.exit()
}

if (require.main === module) {
    main()
}
