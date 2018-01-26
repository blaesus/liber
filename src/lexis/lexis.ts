export type Pars =
    // nomina
    | 'nomen-substantivum'
    | 'nomen-adiectivum'

    // ut adiectvium
    | 'adverbium'

    // pronomina
    | 'pronomen'

    // verba, vel "verba temporalia"
    | 'verbum'

    // verba -> nomina substantiva
    | 'infinitivum'
    | 'gerundium'
    | 'supinum'

    // verba -> nomina adiectiva
    | 'participium'

    // partes immutabiles
    | 'coniunctio'

    | 'ignotus'


export type Numerus = 'singularis' | 'pluralis'

export type Genus = 'masculinum' | 'femininum' | 'neutrum' // "genus nominis"
export type Casus =
    'nominativus'
    | 'genetivus'
    | 'accusativus'
    | 'dativus'
    | 'ablativus'
    | 'locativus'
    | 'vocativus'

export type Modus = 'indicativus' | 'imperativus' | 'coniunctivus'
export type Vox = 'activa' | 'passiva' // "genus verbi"
export type Tempus = 'praesens' | 'praeteritus' | 'futurus'
export type Aspectus = 'imperfectivus' | 'perfectivus'
export type Persona = 'prima' | 'secunda' | 'tertia'

/*  tempus + aspectūs = "tempus"
    praesens + imperfectus = "praesens"
    praesens + perfectus = "perfectus"
    praeteritus + imperfectus = "imperfectum"
    praeteritus + perfectus = "plus-quam-perfectum"
    futurus + imperfectus = "futurum"
    futurus + perfectus = "futurum perfectum" */

export type seriesStatus<Status> = string

export type Inflectiones<S = Status> = {
    [key in seriesStatus<S>]?: string[]
}

export type FrequencyTabula<S = Status> = {
    [key in seriesStatus<S>]?: number
}

export type Lingua = 'Anglica'

interface Exemplum {
    phrasis: string
}

export type Interpretatio = {
    significatio: string
    exempli: Exemplum[]
}

export interface LexicographiaLexisCommunis {
    lemma: string
    radices: string[]
    etymologia: string[]
    pronunciatio: string[],
    references: string[],
    lemmataAlterae: string[],
}

interface LexisCommunis<
    Status,
    Lexicographia extends LexicographiaLexisCommunis = LexicographiaLexisCommunis
> {
    pars: Pars
    inflectiones: Inflectiones<Status>
    lexicographia: Lexicographia
    interpretationes: {
        [lingua in Lingua]?: Interpretatio[]
    }
}

/**
 * Nomina
 */

export interface StatusSubstantivi {
    casus: Casus
    numerus: Numerus
    persona: 'tertia'
}

export interface LexicographiaLSubstantivi extends LexicographiaLexisCommunis {
    thema: 'a' | 'o' | 'consonans' | 'u' | 'e' | 'irregularis' | 'ignota'
    pluralisSolum: boolean
}

export interface NomenSubstantivum extends LexisCommunis<StatusSubstantivi, LexicographiaLSubstantivi> {
    pars: 'nomen-substantivum'
    genera: (Genus | 'ignotum')[]
}

export type Gradus = 'positivus' | 'comparativus' | 'superlativus'

export interface StatusAdiectivi {
    genus: Genus
    casus: Casus
    number: Numerus
    gradus: Gradus
}

export interface LexicographiaAdiectivum extends LexicographiaLexisCommunis {
    thema: 'a' | 'consonans'
}

export interface NomenAdiectivum extends LexisCommunis<StatusAdiectivi, LexicographiaAdiectivum> {
    pars: 'nomen-adiectivum'
}

export type Nomen = NomenSubstantivum | NomenAdiectivum

/**
 * Adverbium
 */

export interface StatusAdverbii {
    gradus: Gradus
}

export interface LexicographiaAdverbii extends LexicographiaLexisCommunis {
    comparabilis: boolean
}

export interface Adverbium extends LexisCommunis<StatusAdverbii, LexicographiaAdverbii> {
    pars: 'adverbium'
}

/**
 * Pronomen
 */

export interface StatusPronominis {
    casus: Casus
    numerus: Numerus
    genus: Genus
}

export interface Pronomen extends LexisCommunis<StatusPronominis> {
    pars: 'pronomen'
}

/**
 * Verba templorale
 */

export interface StatusFinitivi {
    modus: Modus
    vox: Vox
    tempus: Tempus
    aspectus: Aspectus
    numerus: Numerus
    persona: Persona
}

export interface StatusInfinitivi {
    vox: Vox
    tempus: Tempus
}

export interface StatusGerundii {
    casus: Casus
}

export interface StatusSupini {
    casus: Casus
}

export interface StatusParticipii {
    vox: Vox
    genus: Genus
    casus: Casus
    numerus: Numerus
    tempus: Tempus
}

// Omnibus

export interface StatusImmutabilis {
}

export type Status =
    StatusSubstantivi
    | StatusPronominis
    | StatusAdiectivi
    | StatusFinitivi
    | StatusInfinitivi
    | StatusGerundii
    | StatusSupini
    | StatusParticipii
    | StatusImmutabilis

export interface LexicographiaVerbi extends LexicographiaLexisCommunis {
    thema: 'ā' | 'ē' | 'e' | 'consonans' | 'ī' | 'irregularis' | 'ignotum'
    deponens: 'deponens' | 'semi-deponens' | 'non-deponens'
    numquamPerfectum: boolean
}

export interface Verbum extends LexisCommunis<StatusFinitivi, LexicographiaVerbi> {
    pars: 'verbum'
    lemmataAlii: {
        supinum: string | null
        gerundium: string | null
        participium: string | null
        infinitivum: string | null
    }
}

export interface Infinitivum extends LexisCommunis<StatusInfinitivi> {
    pars: 'infinitivum'
}

export interface Gerundium extends LexisCommunis<StatusGerundii> {
    pars: 'gerundium'
}

export interface Supinum extends LexisCommunis<StatusSupini> {
    pars: 'supinum'
}

export interface Participium extends LexisCommunis<StatusParticipii> {
    pars: 'participium'
}

export interface Coniunctio extends LexisCommunis<{}> {
    pars: 'coniunctio'
}

export interface LexisIgnotus extends LexisCommunis<{}> {
    pars: 'ignotus'
}

export type Lexis =
    Nomen
    | Pronomen
    | Adverbium
    | Verbum
    | Infinitivum
    | Gerundium
    | Supinum
    | Participium
    | Coniunctio
    | LexisIgnotus

export type Lexicographia =
    LexicographiaVerbi
    | LexicographiaLSubstantivi
    | LexicographiaAdiectivum

/**
 * Participium
 */

const skippedStatus: string[] = [
    'indicativus',
    'activa',
    'praesens',
    'imperfectivus',
    'singularis',
]

export function representStatus(status: Status): string {
    return Object.values(status).filter(value => !skippedStatus.includes(value)).join(' ')
}

type StatusOmnibus =
    StatusSubstantivi
    & StatusAdiectivi
    & StatusFinitivi
    & StatusInfinitivi
    & StatusGerundii
    & StatusSupini
    & StatusParticipii

type Linea = [Pars, Numerus, Persona, Genus, Casus, Gradus, Modus, Vox, Tempus, Aspectus]

const seperator = '|'
const placeholder = '–'

export function serializeStatum<T extends Status>(pars: Pars, status: T): seriesStatus<T> {
    const statusOmnibush = status as StatusOmnibus
    const {numerus, persona, genus, casus, gradus, modus, vox, tempus, aspectus} = statusOmnibush
    const linea: Linea = [pars, numerus, persona, genus, casus, gradus, modus, vox, tempus, aspectus]
    return linea.map(node => node === undefined ? placeholder : node).join(seperator)
}

export function parseSeriemStatus<S extends StatusOmnibus>(series: seriesStatus<S>): S {
    const [pars, numerus, persona, genus, casus, gradus, modus, vox, tempus, aspectus] = series.split(seperator)
    const result = {
        numerus, genus, casus, gradus, modus, vox, tempus, aspectus, persona
    } as S
    return result
}

export const numerus: Numerus[] = ['singularis', 'pluralis']
export const modus: Modus[] = ['indicativus', 'coniunctivus', 'imperativus']
export const vox: Vox[] = ['activa', 'passiva']
export const tempus: Tempus[] = ['praesens', 'praeteritus', 'futurus']
export const aspectus: Aspectus[] = ['imperfectivus', 'perfectivus']
export const persona: Persona[] = ['prima', 'secunda', 'tertia']

export const categoriaeFinitivi: {[clavis in keyof StatusFinitivi]: StatusFinitivi[clavis][]} = {
    modus,
    numerus,
    vox,
    tempus,
    aspectus,
    persona,
}

export const getLexicographiamCommunem = (): LexicographiaLexisCommunis => ({
    lemma: '',
    radices: [],
    etymologia: [],
    pronunciatio: [],
    references: [],
    lemmataAlterae: [],
})

export const getBaseLexem = (lang: Lingua): Pick<Lexis, 'inflectiones' | 'interpretationes' | 'lexicographia'> => ({
    inflectiones: {},
    interpretationes: {
        [lang]: [],
    },
    lexicographia: {
        ...getLexicographiamCommunem(),
    },
})
