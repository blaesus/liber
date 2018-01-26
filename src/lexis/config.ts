import {Lingua} from './lexis'
import * as path from 'path'

export const radixDatorum = './data'

export const viaLemmata = path.resolve(radixDatorum, 'lemmata.json')

export function encodeLemma(lemma: string): string {
    return lemma.split('')
        .map(char => +char.charCodeAt(0))
        .map(n => n.toString(36))
        .map(s => s.length < 2 ? `0s` : s)
        .join('')
}

export function decodeLemma(filename: string): string {
    return (filename.match(/.{2}/g) || [])
        .map(chars => parseInt(chars, 36))
        .map(n => String.fromCharCode(n))
        .join('')
}

export const LANG: Lingua = 'Anglica'
