import {getBestDataForLemma} from "../fetching/getDataForLemma";
import {Lexis} from "../lexis";
import {readFileAsync, writeFileAsync} from "../nodeUtils";

function cleanLemma(s: string): string {
    return s.replace(/ā/g, 'a').replace(/ō/g, 'o').replace(/ī/g, 'i').replace(/ū/g, 'u').replace(/ē/g, 'e')
}

function cleanMeaning(s: string): string {
    return s.replace(/I /g, '')
}

async function update() {
    const lineae = (await readFileAsync('lexes.txt')).toString().split('\n')
    const lineaeNovae = []
    for (const linea of lineae) {
        let [id, lemma, partes, anglice, genus, ante, tags] = linea.split('\t')
        let results: Lexis[] = []
        if (!partes) {
            try {
                [results, lemma] = await getBestDataForLemma(lemma)
                if (results && results.length) {
                    const chiefData = results[0]
                    lemma = chiefData.lexicographia.lemma || lemma
                    partes = chiefData.lexicographia.radices.join(', ') || lemma
                    anglice =
                        chiefData.interpretationes.Anglica
                            ? chiefData.interpretationes.Anglica.map(
                                interpretatio => cleanMeaning(interpretatio.significatio[0])
                            ).join('.<br>')
                            : ''
                }
                else {
                    console.warn('Cannot parse', lemma)
                }
            }
            catch (error) {
                console.error(error.message, lemma)
                continue
            }
        }
        lineaeNovae.push([id, lemma, partes, anglice, genus, ante, tags].join('\t'))
    }
    await writeFileAsync('lexes-novi.txt', lineaeNovae.join('\n'))
}

update()
