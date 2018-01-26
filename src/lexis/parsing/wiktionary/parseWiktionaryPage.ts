import * as cheerio from 'cheerio'
import * as deepmerge from 'deepmerge'
import {
    Adverbium, Coniunctio, getBaseLexem, getLexicographiamCommunem,
    LexicographiaAdiectivum, LexicographiaLexisCommunis,
    LexicographiaLSubstantivi, LexicographiaVerbi, Lexis,
    NomenAdiectivum,
    NomenSubstantivum, Verbum
} from "../../lexis";
import {LANG} from "../../config";
import {AuxiliaryOutcomeTabulaeVerbi, parseTabluamVerbiWiktionary, TabulaeInformatio} from "./tabulae/wiktionaryVerbTable";
import {flatten} from "../../util";
import {isIP} from "net";
import {parseTabluamSubstantivum} from "./tabulae/wiktionaryNounTable";
import {parseTabluamAdiectivi} from "./tabulae/wiktionaryAdjectiveTable";

const nbsp = '\xa0'

const DETAIL_LOG = false

type ErrorCode = 'no-entry' | 'no-relevant-entry'

type PartsWiktionary = 
    'Verb'
    | 'Noun'
    | 'Proper noun'
    | 'Pronoun'
    | 'Adjective'
    | 'Adverb'
    | 'Conjunction'
    | 'Numeral'
    | 'Determiner'

export function getRedirectedLemma(html: string): string {
    const $ = cheerio.load(html)
    return $('#did-you-mean').text()
}

function getMeanings(node: CheerioElement, $: CheerioStatic): string[] {
    return $(node).children().toArray().map(child => {
        const text = $(child).text()
        const examples = $(child).children().toArray().map(grandchild => {
            if (grandchild.tagName === 'ul' || grandchild.tagName === 'dl') {
                return $(grandchild).text()
            }
            else {
                return ''
            }
        })
        let textWithoutExamples = text
        for (const example of examples) {
            textWithoutExamples = textWithoutExamples.replace(example, '')
        }
        return textWithoutExamples.replace(/\n/g, '')
    }).filter(Boolean)
}

type GeneralSection = 'Etymology' | 'Pronunciation' | 'References' | 'Alternative forms'

type Section = GeneralSection | PartsWiktionary

function getGeneralSection(s: string | null): GeneralSection | null {
    if (s === 'Etymology'
        || s === 'Pronunciation'
        || s === 'References'
    ) {
        return s
    }
    else {
        return null
    }
}

function translateWiktionarySession(s: GeneralSection): keyof LexicographiaLexisCommunis {
    switch (s) {
        case 'Etymology': return 'etymologia'
        case 'Pronunciation': return 'pronunciatio'
        case 'References': return 'references'
        default: {
            throw new Error(`Unexpected general session: ${s}`)
        }
    }
}

function getWiktionaryPart(s: string | null): PartsWiktionary | null {
    if (s === 'Noun'
        || s === 'Verb'
        || s === 'Proper noun'
        || s === 'Pronoun'
        || s === 'Adjective'
        || s === 'Adverb'
        || s === 'Conjunction'
        || s === 'Numeral'
        || s === 'Determiner'
    ) {
        return s
    }
    else {
        return null
    }
}

function translateWiktionaryPart(part: PartsWiktionary): Lexis['pars'] {
    switch (part) {
        case 'Verb': return 'verbum'
        case 'Noun': return 'nomen-substantivum'
        case 'Proper noun': return 'nomen-substantivum'
        case 'Adjective': return 'nomen-adiectivum'
        case 'Adverb': return 'adverbium'
        case 'Conjunction': return 'coniunctio'
        case 'Numeral': return 'nomen-adiectivum'
        case 'Determiner': return 'nomen-adiectivum'
        default: {
            throw new Error(`Unexpected wiktionary part ${part}`)
        }
    }

}

function getSection(s: string): Section | null {
    s = s.replace(/(\d)/g, '').trim()
    const generalSection = getGeneralSection(s)
    const partsSection = getWiktionaryPart(s)
    if (generalSection) {
        return generalSection
    }
    else if (partsSection) {
        return partsSection
    }
    else {
        if (DETAIL_LOG) console.warn(`Unexpected section: '${s}'`)
        return null
    }
}

const loggingProxy = <T extends {}>(obj: T, name: string) => new Proxy(obj, {
    set(target: T, key: keyof T, value: any) {
        target[key] = value
        if (DETAIL_LOG) console.info(`${name}.${key} = ${JSON.stringify(value)}`)
        return true
    },
})

function translateVerbalThemeVowel(s: string, lemma: string): LexicographiaVerbi['thema'] {
    switch (s) {
        case 'first': return 'ā'
        case 'second': return 'ē'
        case 'third': return lemma.endsWith('iō') ? 'e' : 'consonans'
        case 'fourth': return 'ī'
        case 'irregular': return 'irregularis'
        default: {
            throw new Error(`Unexpected verbal theme ${s}`)
        }
    }
}

function translateNominalThemeVowel(s: string): LexicographiaLSubstantivi['thema'] {
    switch (s) {
        case 'first': return 'a'
        case 'second': return 'o'
        case 'third': return 'consonans'
        case 'fourth': return 'u'
        case 'fifth': return 'e'
        case 'irregular': return 'irregularis'
        case '': return 'ignota'
        default: {
            throw new Error(`Unexpected nominal theme ${s}`)
        }
    }
}

type BriefParser<T extends Lexis> = (node: CheerioElement, $: CheerioStatic) => BriefInformatio<T>

const parseVerbBrief: BriefParser<Verbum> = (node, $) => {
    const s = $(node).text()
    const deponens = s.includes('deponent')
    const semiDeponens = s.includes('semi-deponent')
    const noPassive = s.includes('no passive')
    const noPerfect = s.includes('no perfect')
    let regex: RegExp
    let verbComponents: number
    if (deponens || noPassive) {
        regex = /(.*) \(present infinitive (.*), perfect active (.*)\); (.*) conjugation/
        verbComponents = 3
    }
    else if (noPerfect) {
        regex = /(.*) \(present infinitive (.*)\); (.*) conjugation, no perfect/
        verbComponents = 2
    }
    else {
        regex = /(.*) \(present infinitive (.*), perfect active (.*), supine (.*)\); (\w*) conjugation/
        verbComponents = 4
    }
    const match = regex.exec(s)
    if (match) {
        const radices = match.slice(1, verbComponents+1)
        const lemma = radices[0]
        const thema = translateVerbalThemeVowel(match[verbComponents+1], radices[0])
        return {
            lexis: {

            },
            lexicographia: {
                lemma,
                thema,
                radices,
                numquamPerfectum: noPerfect,
                deponens: semiDeponens ? 'semi-deponens' : deponens ? 'deponens' : 'non-deponens',
            }
        }
    }
    else if (!s.includes(nbsp)) {
        return {
            lexis: {},
            lexicographia: {
                lemma: s,
                thema: "ignotum",
                radices: [s],
                numquamPerfectum: noPerfect,
                deponens: semiDeponens ? 'semi-deponens' : deponens ? 'deponens' : 'non-deponens',
            }
        }
    }
    else {
        throw new Error(`Cannot parse verbal brief ${s}`)
    }
}

function translateNominalGender(s: string): {
    genera: NomenSubstantivum['genera'],
    pluralisSolum: boolean
} {
    const [genera, pluralis] = s.split(nbsp)
    const pluralisSolum = pluralis === 'pl'
    switch (genera) {
        case 'm': return {
            genera: ['masculinum'],
            pluralisSolum,
        }
        case 'f': return {
            genera: ['femininum'],
            pluralisSolum,
        }
        case 'n': return {
            genera: ['neutrum'],
            pluralisSolum,
        }
        case 'm, f': return {
            genera: ['masculinum', 'femininum'],
            pluralisSolum,
        }
        case 'f, m': return {
            genera: ['femininum', 'masculinum'],
            pluralisSolum,
        }
        case '?': {
            return {
                genera: ['ignotum'],
                pluralisSolum,
            }
        }
        case '': {
            return {
                genera: ['ignotum'],
                pluralisSolum,
            }
        }
        default: {
            throw new Error(`Cannot parse gender ${s}`)
        }
    }
}

const parseNounBrief:  BriefParser<NomenSubstantivum> = (node, $) => {
    const lemma = $(node).find('.headword').text()
    const regexAltra = /\(genitive (.*)\)/
    const match = regexAltra.exec($(node).text())
    let formaAltra = match && match[1]
    const radices = formaAltra ? [lemma, formaAltra] : [lemma]

    const generaEtNumerus = $(node).find('.gender').text()
    const {genera, pluralisSolum} = translateNominalGender(generaEtNumerus)
    const declension = $(node).find('[title*=declension]').text().split(' ')[0]
    const thema = translateNominalThemeVowel(declension)
    return {
        lexis: {
            genera,
        },
        lexicographia: {
            lemma,
            radices,
            thema,
            pluralisSolum,
        }
    }
    // throw new Error(`Cannot parse nominal brief ${s}`)
}

function translateAdjectivalThema(s: string): LexicographiaAdiectivum['thema'] {
    switch (s) {
        case 'firstsecond': return 'a'
        case 'third': return 'consonans'
        default: {
            throw new Error(`Unexpected adjectival theme ${s}`)
        }
    }
}

const parseAdjectiveBrief: BriefParser<NomenAdiectivum> = (node, $) => {
    const declension = $(node).find('[title*=declension]').text().split(' ')[0]
    const thema = translateAdjectivalThema(declension)
    const lemma = $(node).find('.headword').text()
    const formaeAltrae = $(node).find('b[lang=la]').toArray().map(b => $(b).text())
    return {
        lexis: { },
        lexicographia: {
            lemma,
            radices: [lemma, ...formaeAltrae],
            thema,
        }
    }
}

const parseAdverbBrief: BriefParser<Adverbium> = (node, $) => {
    const s = $(node).text()
    const lemma = $(node).find('.headword').text()
    const formaeAltrae = $(node).find('b[lang=la]').toArray().map(b => $(b).text())
    const radices = [lemma, ...formaeAltrae]
    const comparabilis: boolean = s.includes('not comparable')
    return {
        lexis: {},
        lexicographia: {
            lemma,
            radices,
            comparabilis,
        }
    }
}

const parseConjunctionBrief: BriefParser<Coniunctio> = (node, $) => {
    const s = $(node).text()
    const litterae = s.split(' (')[0] || s
    return {
        lexis: {},
        lexicographia: {
            lemma: litterae,
            radices: [litterae],
        }
    }
}

interface LexemeGroupParserState {
    section: Section | null
    multiEtymologies: boolean
    incomingBrief: boolean
    parsingResult: Lexis
    auxiliaryParsingResults: Lexis[]
}

type BriefInformatio<LexisT extends Lexis> = {
    lexis: Partial<LexisT>
    lexicographia: Partial<LexisT['lexicographia']>
}

const briefParsers: {[part in Section]?: (node: CheerioElement, $: CheerioStatic) => BriefInformatio<Lexis>} = {
    Noun: parseNounBrief,
    'Proper noun': parseNounBrief,
    Verb: parseVerbBrief,
    Adjective: parseAdjectiveBrief,
    Adverb: parseAdverbBrief,
    Determiner: parseAdjectiveBrief,
    Numeral: parseAdjectiveBrief,
    Conjunction: parseConjunctionBrief,
}

function parsePartBrief(section: Section, node: CheerioElement, $: CheerioStatic): BriefInformatio<Lexis> {
    const parser = briefParsers[section]
    if (!parser) {
        throw new Error(`Section without parser: ${section}`)
    }
    const result: BriefInformatio<Lexis> = parser(node, $)
    if (!result.lexicographia.lemma) {
        throw new Error(`Parser output empty lemma for ${$(node).text()}`)
    }
    return result
}

function getInitLexis(pars: Lexis['pars'] | 'init'): Lexis {
    switch (pars) {
        case 'nomen-substantivum': {
            return {
                ...getBaseLexem(LANG),
                pars: 'nomen-substantivum',
                genera: [],
                lexicographia: {
                    ...getLexicographiamCommunem(),
                    thema: 'a',
                    pluralisSolum: false,
                },
            }
        }
        case 'nomen-adiectivum': {
            return {
                ...getBaseLexem(LANG),
                pars: 'nomen-adiectivum',
                lexicographia: {
                    ...getLexicographiamCommunem(),
                    thema: 'a',
                },
            }
        }
        case 'pronomen': {
            return {
                ...getBaseLexem(LANG),
                pars: 'pronomen',
            }
        }
        case 'verbum': {
            return {
                ...getBaseLexem(LANG),
                pars: 'verbum',
                lemmataAlii: {
                    supinum: null,
                    gerundium: null,
                    participium: null,
                    infinitivum: null,
                },
                lexicographia: {
                    ...getLexicographiamCommunem(),
                    thema: 'ā',
                    deponens: 'non-deponens',
                    numquamPerfectum: false,
                },
            }
        }
        case 'gerundium': {
            return {
                ...getBaseLexem(LANG),
                pars: 'gerundium',
            }
        }
        case 'supinum': {
            return {
                ...getBaseLexem(LANG),
                pars: 'supinum',
            }
        }
        case 'participium': {
            return {
                ...getBaseLexem(LANG),
                pars: 'participium',
            }
        }
        case 'adverbium': {
            return {
                ...getBaseLexem(LANG),
                pars: 'adverbium',
                lexicographia: {
                    ...getLexicographiamCommunem(),
                    comparabilis: false,
                },
            }
        }
        case 'coniunctio': {
            return {
                ...getBaseLexem(LANG),
                pars: 'coniunctio',
            }
        }
        case 'ignotus': {
            return {
                ...getBaseLexem(LANG),
                pars: 'ignotus',
            }
        }
        default: {
            throw new Error(`Unexpected pars ${pars}`)
        }
    }
}

function error(code: ErrorCode): void {
    throw new Error(code)
}

interface WiktionaryPageData {
    main: Lexis[]
    auxiliary: Lexis[]
}

const NODE_SELECTOR = 'div.mw-parser-output > *'

export function removeIrrelevantNodes(
    $: CheerioStatic,
    languageId: string
): void {
    const allNodes = $(NODE_SELECTOR).toArray()

    // Remove other languages
    let isLanguageWanted = false
    for (const node of allNodes) {
        if (node.tagName === 'h2') {
            const firstChild = $(node).children()[0]
            isLanguageWanted = !!firstChild && $(firstChild).attr('id') === languageId
        }
        if (!isLanguageWanted) {
            $(node).remove()
        }
    }
}

export function parseWiktionaryLexemeGroup(nodes: CheerioElement[], $: CheerioStatic): WiktionaryPageData {
    if (nodes.length === 0) {
        error('no-relevant-entry')
    }
    const state: LexemeGroupParserState = loggingProxy({
        section: null,
        incomingBrief: false,
        multiEtymologies: false,
        parsingResult: getInitLexis('ignotus'),
        auxiliaryParsingResults: [],
    }, 'state')

    for (const node of nodes) {
        switch (node.tagName) {
            case 'h3': {
                const header = $($(node).children()[0]).text().trim()
                state.section = getSection(header)

                const multiEtymologyRegex = /Etymology\s(\d)/
                const match = multiEtymologyRegex.exec(header)
                if (match) {
                    state.section = 'Etymology'
                    state.multiEtymologies = true
                    state.incomingBrief = false
                }
                else if (header === 'Etymology') {
                    state.section = 'Etymology'
                }

                const part = getWiktionaryPart(state.section)
                if (part) {
                    state.parsingResult = deepmerge(
                        state.parsingResult,
                        getInitLexis(translateWiktionaryPart(part)),
                    )
                    state.incomingBrief = true
                }
                break
            }
            case 'h4': {
                if (state.multiEtymologies) {
                    const header = $($(node).children()[0]).text().trim()
                    state.section = getSection(header)
                    const part = getWiktionaryPart(state.section)
                    if (part) {
                        state.parsingResult = deepmerge(
                            state.parsingResult,
                            getInitLexis(translateWiktionaryPart(part)),
                        )
                        state.incomingBrief = true
                    }
                }
                break
            }
            case 'p': {
                const text = $(node).text()
                const generalSection = getGeneralSection(state.section)
                if (generalSection) {
                    const field = translateWiktionarySession(generalSection)
                    const lexis = state.parsingResult
                    if (lexis.lexicographia) {
                        lexis.lexicographia[field] = [
                            ...lexis.lexicographia[field],
                            text
                        ]
                    }
                }
                const partsSection = getWiktionaryPart(state.section)
                if (partsSection) {
                    // Brief
                    if (state.incomingBrief) {
                        const informatio = parsePartBrief(partsSection, node, $)
                        state.parsingResult = {
                            ...state.parsingResult,
                            ...(informatio.lexis as any),
                            lexicographia: {
                                ...state.parsingResult.lexicographia,
                                ...informatio.lexicographia,
                            } as any // TODO: Check better typing
                        }
                        state.incomingBrief = false
                    }
                }
                break
            }
            case 'ol': {
                const meanings = getMeanings(node, $)
                if (state.section) {
                    const partsSection = getWiktionaryPart(state.section)
                    if (partsSection) {
                        state.parsingResult = {
                            ...state.parsingResult,
                            interpretationes: {
                                ...state.parsingResult.interpretationes,
                                [LANG]: meanings.map(meaning => ({
                                    significatio: meaning,
                                    exempli: []
                                }))
                            },
                        }
                    }
                }
                break
            }
            case 'table': {
                switch (state.section) {
                    case 'Proper noun': {
                        const inflectiones = parseTabluamSubstantivum($)
                        const target = state.parsingResult as NomenSubstantivum
                        target.inflectiones = inflectiones
                        break
                    }
                    case 'Noun': {
                        const inflectiones = parseTabluamSubstantivum($)
                        const target = state.parsingResult as NomenSubstantivum
                        target.inflectiones = inflectiones
                        break
                    }
                    case 'Verb': {
                        const {verbum, infinitivum, participium, gerundium, supinum} = parseTabluamVerbiWiktionary($)
                        const target = state.parsingResult as Verbum
                        target.inflectiones = verbum.inflectiones

                        function inflateLemma(
                            data: TabulaeInformatio<AuxiliaryOutcomeTabulaeVerbi>
                        ): AuxiliaryOutcomeTabulaeVerbi {
                            return ({
                                ...getBaseLexem(LANG),
                                pars: data.pars as any,
                                inflectiones: data.inflectiones,
                                lexicographia: {
                                    ...getLexicographiamCommunem(),
                                    lemma: data.lemma,
                                }
                            })

                        }

                        if (supinum) {
                            state.auxiliaryParsingResults.push(inflateLemma(supinum))
                        }
                        if (infinitivum) {
                            state.auxiliaryParsingResults.push(inflateLemma(infinitivum))
                        }
                        if (gerundium) {
                            state.auxiliaryParsingResults.push(inflateLemma(gerundium))
                        }
                        if (participium) {
                            state.auxiliaryParsingResults.push(inflateLemma(participium))
                        }
                        target.lemmataAlii = {
                            supinum: supinum ? supinum.lemma : null,
                            gerundium: gerundium ? gerundium.lemma : null,
                            participium: participium ? participium.lemma : null,
                            infinitivum: infinitivum ? infinitivum.lemma : null,
                        }
                        break
                    }
                    case 'Adjective': {
                        const inflectiones = parseTabluamAdiectivi($)
                        const target = state.parsingResult as NomenAdiectivum
                        target.inflectiones = inflectiones
                        break
                    }
                }
                break
            }
            default: { }
        }
    }

    if (state.parsingResult.pars === 'ignotus') {
        throw new Error('Unkonwn pars unprocessed')
    }

    return {
        main: [state.parsingResult],
        auxiliary: state.auxiliaryParsingResults,
    }
}

function separateIntoLexemeGroups(nodes: CheerioElement[], $: CheerioStatic): CheerioElement[][] {

    interface SeparatorState {
        groups: CheerioElement[][]
        currentGroup: CheerioElement[]
        skippedGroups: number
        skipCurrentGroup: boolean
        contentNodeFound: boolean
        hasEtymology: boolean
    }

    const state: SeparatorState = loggingProxy({
        groups: [],
        currentGroup: loggingProxy([], 'separator.currentGroup'),
        skippedGroups: 0,
        skipCurrentGroup: false,
        contentNodeFound: false,
        hasEtymology: $('body').find('h3').text().includes('Etymology')
    }, 'separator')

    function detectGroupStart(node: CheerioElement): boolean {
        if (state.hasEtymology) {
            return $(node).text().startsWith('Etymology')
        }
        else {
            return !!getWiktionaryPart($(node).text())
        }
    }

    for (const node of nodes) {
        const newGroupStarts = detectGroupStart(node)
        if (newGroupStarts) {
            if (!state.skipCurrentGroup && state.currentGroup.length > 0) {
                state.groups.push(state.currentGroup)
            }
            state.skipCurrentGroup = false
            state.currentGroup = []
            state.contentNodeFound = true
        }
        if (!state.contentNodeFound) {
            continue
        }
        state.currentGroup.push(node)

        // Detect inflected form
        if (node && node.tagName === 'ol') {
            const listItems = $(node).find('li').toArray()
            if (listItems.every(li => {
                const definition = $(li).find('.form-of-definition')
                const definitionText = definition.text()
                const isRedirection = definition && definitionText && !definitionText.includes('Alternative form of')
                return !!isRedirection
            })) {
                state.skipCurrentGroup = true
            }
        }
    }

    if (!state.skipCurrentGroup && state.currentGroup.length > 0) {
        state.groups.push(state.currentGroup)
    }
    else {
        state.skippedGroups += 1
    }

    if (state.groups.length === 0) {
        if (state.skippedGroups) {
            throw new Error(`Only skipped groups(${state.skippedGroups}) for ${$('title').text()}`)
        }
        else {
            throw new Error(`Cannot extract groups for ${$('title').text()}`)
        }
    }

    return state.groups
}

export function parseWiktionaryPage(html: string): WiktionaryPageData {
    if (html.includes('Wiktionary does not yet have an entry')) {
        error('no-entry')
    }
    const $ = cheerio.load(html)
    removeIrrelevantNodes($, 'Latin')
    const nodes = $(NODE_SELECTOR).toArray()
    const lexemeGroups = separateIntoLexemeGroups(nodes, $)
    const data = lexemeGroups.map(nodes => parseWiktionaryLexemeGroup(nodes, $))

    return {
        main: data.map(node => node.main).reduce(flatten, []),
        auxiliary: data.map(node => node.auxiliary).reduce(flatten, []),
    }
}
