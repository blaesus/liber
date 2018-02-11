import {getBestDataForLemma} from "../lexis/C-ParseToLexis/getDataForLemma";
import {Lexis, Nomen, NomenSubstantivum} from "../lexis";
import {readFileAsync, writeFileAsync} from "../nodeUtils";
import {demacron} from '../util'
import {database} from '../lexis/database'
import {randomBytes} from 'crypto'


function cleanMeaning(s: string): string {
    return s.replace(/I /g, '').replace(/\n/g, ' ')
}

async function getNewLemmata(n = 3000): Promise<string[]> {
    const text = (await readFileAsync('../data/parsingResults.txt')).toString()
    const lineae = text.split('\n')
    for (let i = 0; i < lineae.length; i += 1) {
        const linea = lineae[i]
        if (linea === 'knowns') {
            const lineaKnowns = lineae[i+1]
            const entries = lineaKnowns.split(' ')
            const lemmata = entries.map(entry => entry.split(',')[0])
            return lemmata.slice(0, n)
        }
    }
    return []
}

async function update() {
    // let [id, lemma, partes, anglice, genus, ante, tags] = linea.split('\t')
    await database.connect()

    const newLemmata = await getNewLemmata()
    const lineae = (await readFileAsync('lexes.txt')).toString().split('\n')
    const lineaeNovae = [...lineae]
    for (const lemma of newLemmata) {
        if (lineae.every(linea => !linea.includes(lemma))) {
            console.info(newLemmata.indexOf(lemma), newLemmata.length, lemma)
            try {
                const data = await database.getLexesByLemma(lemma)
                const lexis = data[0]
                if (
                    lexis.pars === 'participium'
                    || lexis.pars === 'infinitivum'
                    || lexis.pars === 'supinum'
                    || lexis.pars === 'gerundium'
                ) continue
                const partes = lexis.lexicographia.radices.join(', ')
                let anglice = lemma
                const anglica = lexis.interpretationes['Anglica']
                if (anglica) {
                    anglice = anglica.map(interpretio => interpretio.significatio).map(s => cleanMeaning(s))[0]
                }
                const genera = (lexis as NomenSubstantivum).genera
                const genus = genera ? genera.map(genus => genus.charAt(0)).join('') : ''
                const ante = ''
                const tags = ''
                const id = randomBytes(8).toString('hex')
                const linea = [id, lemma, partes, anglice, genus, ante, tags].join('\t')
                lineaeNovae.push(linea)
            }
            catch (error) {
                console.warn(error.message)
            }
        }
    }
    await writeFileAsync('lexes-novi.txt', lineaeNovae.join('\n'))
    process.exit()
}

update()
