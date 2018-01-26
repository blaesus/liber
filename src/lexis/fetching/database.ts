import {connect, Db} from 'mongodb'
import * as shortid from 'shortid'
import {Lexis} from "../lexis";
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_')

export type Source = 'wiktionary'

export interface DownloadRecordInput {
    lemma: string
    source: Source
    remoteUrl: string
    html: string
    lexes: Lexis[]
}

export interface DownloadRecord extends DownloadRecordInput {
    id: string
    time: number
}

const url = 'mongodb://localhost:27017/lexes'

const PAGE = 'pagina'

let db: Db

export const database = {
    async connect() {
        if (!db) {
            db = await connect(url)
        }
    },
    async getLemmata(): Promise<string[]> {
        await this.connect()
        return db.collection(PAGE).find({}).map((record: DownloadRecord) => record.lemma).toArray()
    },
    async savePage(recordInput: DownloadRecordInput): Promise<DownloadRecord> {
        await this.connect()
        const record: DownloadRecord = {
            ...recordInput,
            id: shortid.generate(),
            time: Date.now(),
        }
        await db.collection(PAGE).insertOne(record)
        return record
    },
    async findPages(lemma: string): Promise<DownloadRecord[]> {
        await this.connect()
        return db.collection(PAGE).find({lemma}).toArray()
    },
    async updatePage(record: DownloadRecord) {
        await this.connect()
        return db.collection(PAGE).updateOne({id: record.id}, record)
    },
}
