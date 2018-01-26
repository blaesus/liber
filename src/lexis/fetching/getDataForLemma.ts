import {getWiktionaryData} from "./fetchWiktionary"
import {getRedirectedLemma, parseWiktionaryPage} from "../parsing/wiktionary/parseWiktionaryPage"
import {Lexis} from "../lexis";

export async function getBestDataForLemma(lemma: string, noRedirection?: boolean): Promise<[Lexis[], string]> {
    const html = await getWiktionaryData(lemma)
    let results: Lexis[] = []
    try {
        results = parseWiktionaryPage(html).main
    }
    catch (error) {
        if (!noRedirection) {
            if (error.message === 'no-entry') {
                // Misplaced deponent
                if (lemma.endsWith('o')) {
                    lemma = `${lemma}r`
                    ;[results] = await getBestDataForLemma(lemma, true)
                }
                else {
                    // 'Did you mean ...?'
                    const alterLemma = getRedirectedLemma(html)
                    if (alterLemma) {
                        lemma = alterLemma
                        ;[results] = await getBestDataForLemma(alterLemma, true)
                    }
                    else {
                        throw error
                    }
                }
            }
            else {
                throw error
            }
        }
        else {
            throw error
        }
    }
    return [results, lemma]
}

