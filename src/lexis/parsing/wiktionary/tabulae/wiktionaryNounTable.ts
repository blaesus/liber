import {Casus, Inflectiones, Numerus, serializeStatum, Status, StatusSubstantivi} from "../../../lexis";

const numeri: Numerus[] = ['singularis', 'pluralis']

function translateEnglishCase(s: string): Casus {
    switch (s) {
        case 'nominative': return 'nominativus'
        case 'genitive': return 'genetivus'
        case 'dative': return 'dativus'
        case 'accusative': return 'accusativus'
        case 'ablative': return 'ablativus'
        case 'vocative': return 'vocativus'
        case 'locative': return 'locativus'
        default: {
            throw new Error(`Unexpected case ${s}`)
        }
    }
}

export function parseTabluamSubstantivum($: CheerioStatic): Inflectiones<StatusSubstantivi> {
    const inflectiones: Inflectiones<StatusSubstantivi> = {}
    for (const row of $('.inflection-table-la tr').toArray()) {
        const cellHead = $(row).find('th')
        const contentCells = $(row).find('td')
        const header = $(cellHead).text()
        if (header.includes('Case')) {
            continue
        }
        const casus = translateEnglishCase(header)

        for (let i = 0; i < contentCells.length; i += 1) {
            const status: StatusSubstantivi = {
                casus,
                numerus: numeri[i],
                persona: 'tertia'
            }
            const clavis = serializeStatum('nomen-substantivum', status)
            inflectiones[clavis] = $(contentCells[i]).text().split(',')
        }
    }
    return inflectiones
}
