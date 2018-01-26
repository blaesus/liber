import * as React from 'react'
import {
    Aspectus, FrequencyTabula, Modus, Numerus, Persona, seriesStatus, StatusFinitivi, Verbum,
    Vox
} from '../../lexis'
import TabulaFinitivi from './TabulaFinitivi'
import { radixDatorum } from '../../config'
import LearningOptiones from '../components/LearningOptiones'

interface ProgrammaProps {

}

export type LearningState = {
    [categoria in keyof StatusFinitivi]: {
        [clavis in StatusFinitivi[categoria]]: boolean
    }
}

const initialLearning = {
    modus: (quid: boolean) => ({
        indicativus: quid,
        imperativus: quid,
        coniunctivus: quid,
    }),
    vox: (quid: boolean) => ({
        activa: quid,
        passiva: quid,
    }),
    tempus: (quid: boolean) => ({
        praesens: quid,
        praeteritus: quid,
        futurus: quid,
    }),
    aspectus: (quid: boolean) => ({
        perfectivus: quid,
        imperfectivus: quid,
    }),
    numerus: (quid: boolean) => ({
        singularis: quid,
        pluralis: quid,
    }),
    persona: (quid: boolean) => ({
        prima: quid,
        secunda: quid,
        tertia: quid,
    }),
}

export type PosData = FrequencyTabula

interface ProgrammaState {
    verbum: Verbum | null
    posData: PosData | null
    learning: LearningState
}

class Programma extends React.Component<ProgrammaProps, ProgrammaState> {

    constructor(props: ProgrammaProps) {
        super(props)
        this.state = {
            verbum: null,
            posData: null,
            learning: {
                modus: initialLearning.modus(false),
                vox: initialLearning.vox(true),
                tempus: initialLearning.tempus(true),
                aspectus: initialLearning.aspectus(true),
                numerus: initialLearning.numerus(true),
                persona: initialLearning.persona(true),
            },
        }
        this.loadFinitivumData(`amō-verbum`)
        this.loadPOS()
    }

    render() {
        const {verbum} = this.state
        if (verbum) {
            return (
                <div>
                    <TabulaFinitivi
                        verbum={verbum}
                        learning={this.state.learning}
                        posData={this.state.posData}
                    />
                    <LearningOptiones
                        learning={this.state.learning}
                        onEligere={optio => {
                            this.setState(prevState => ({
                                learning: {
                                    ...prevState.learning,
                                    [optio[0]]: {
                                        ...(prevState.learning as any)[optio[0]],
                                        [optio[1]]: !(prevState.learning as any)[optio[0]][optio[1]]
                                    }
                                }
                            }))
                        }}
                    />
                </div>
            )
        }
        else {
            return <div>...</div>
        }
    }

    async loadFinitivumData(nomen: string) {
        const path = `${radixDatorum}/${nomen}.json`
        const verbum = await (await fetch(path)).json()
        this.setState({
            verbum
        })
    }

    async loadPOS() {
        const path = `${radixDatorum}/pos_stat.json`
        const posData = await (await fetch(path)).json()
        this.setState({
            posData
        })
    }
}

export default Programma
