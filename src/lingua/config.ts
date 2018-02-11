import {Lingua} from './lexis'
import * as path from 'path'

export const radixDatorum = './data'
export const radixCache = './cache'

export const radixTokens = path.resolve(radixCache, 'latin_library_tokens')
export const radixLatinLibrary = path.resolve(radixCache, 'latin_text_latin_library')

export const viaInflectionDict = path.resolve(radixCache, 'inflectionDict.json')

export const viaFrequencyTable = path.resolve(radixCache, 'frequencyTable.json')
export const viaLemmata = path.resolve(radixDatorum, 'lemmata.json')
export const viaFailureReport = path.resolve(radixDatorum, 'failures.json')

export const LANG: Lingua = 'Anglica'
