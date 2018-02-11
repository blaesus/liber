import * as React from 'react'
import {
    categoriaeFinitivi, Modus, Verbum, serializeStatum, StatusFinitivi, Status, Aspectus, Tempus, Vox, Numerus, Persona,
    SeriesStatus
} from '../../lexis'
import { LearningState } from '../components/Programma'
import {PosData} from "./Programma";
import {flatten} from "../../util";

function getEnabledFields<K extends string, T extends Boolean>(data: {[key in K]: T}): K[] {
    return Object.entries(data).filter(entry => entry[1]).map(entry => entry[0] as K)
}

function enumerate(learning: LearningState): Partial<StatusFinitivi>[] {

    const result: StatusFinitivi[] = []
    for (const modus of getEnabledFields(learning.modus)) {
        for (const vox of getEnabledFields(learning.vox)) {
            for (const tempus of getEnabledFields(learning.tempus)) {
                for (const aspectus of getEnabledFields(learning.aspectus)) {
                    for (const numerus of getEnabledFields(learning.numerus)) {
                        for (const persona of getEnabledFields(learning.persona)) {
                            result.push({
                                modus,
                                vox,
                                tempus,
                                aspectus,
                                numerus,
                                persona,
                            })
                        }
                    }
                }
            }
        }
    }
    return result
}


const LineaeModi = (props: {
    verbum: Verbum
    modus: Modus
    focus: Partial<StatusFinitivi>
    learning: LearningState
    posData: PosData | null
    onHover(focus: Partial<StatusFinitivi>): void
}) => {
    
    const cellStyle = (
        match: (spec: Partial<StatusFinitivi>) => boolean
   ): React.CSSProperties => {

        const colorModi: {[key in Modus]: number} = {
            indicativus: 200,
            coniunctivus: 100,
            imperativus: 50,
        }
        
        const focus = match(props.focus)
        const learning = enumerate(props.learning).some(match)
        const background: {h: number, s: number, l: number} = {
            h: colorModi[props.modus], s: 50, l: 90
        }
        if (learning) {
            background.h *= 0.9
            background.s *= 0.5
            background.l *= 0.8
        }
        if (focus) {
            background.s *= 1.1
            background.l *= 0.9
        }
        return {
            background: `hsl(${background.h}, ${background.s}%, ${background.l}%)`,
            border: `1px solid ${learning ? '#333' : '#ccc'}`,
        }
    }
    const {modus} = props
    
    return <>
        <tr>
            <th
                colSpan={3}
                rowSpan={2}
                style={{
                    ...cellStyle(spec => spec.modus === modus),
                }}
            >
                {modus}
            </th>
            {
                categoriaeFinitivi.persona.map(persona =>
                    <th
                        key={persona+modus}
                        colSpan={2}
                        style={cellStyle(spec =>
                            spec.modus === modus
                            && spec.persona === persona
                        )}
                    >
                        {persona}
                    </th>
                )
            }
        </tr>
    
        <tr>
            {
                categoriaeFinitivi.persona.map(persona =>
                    categoriaeFinitivi.numerus.map(numerus => (
                        <th
                            key={persona+numerus}
                            style={cellStyle(spec =>
                                spec.modus === modus
                                && spec.persona === persona
                                && spec.numerus === numerus
                            )}
                        >
                            {numerus}
                        </th>
                    ))
                )
            }
        </tr>
        
        {
            categoriaeFinitivi.vox.map(vox =>
                categoriaeFinitivi.aspectus.map(aspectus => (
                    categoriaeFinitivi.tempus.map(tempus => {
                        type DatumLineae = {
                            forma: (string | undefined)
                            status: StatusFinitivi
                            series: SeriesStatus<StatusFinitivi>
                        }
                        const data: DatumLineae[] =
                            categoriaeFinitivi.persona.map(persona => (
                                categoriaeFinitivi.numerus.map(numerus => {
                                    const status: StatusFinitivi = {
                                        modus: modus,
                                        vox,
                                        tempus,
                                        aspectus,
                                        numerus,
                                        persona,
                                    }
                                    const series = serializeStatum('verbum', status)
                                    const formae = props.verbum.inflectiones[series]
                                    return {
                                        forma: formae && formae.join(', '),
                                        status,
                                        series,
                                    }
                                })
                            )).reduce(flatten, [])
                        
                        if (data.some(datum => !!datum.forma)) {
                            return (
                                <tr key={tempus}>
                                    {
                                        aspectus === categoriaeFinitivi.aspectus[0]
                                        && tempus === categoriaeFinitivi.tempus[0]
                                        && (
                                            <th
                                                rowSpan={categoriaeFinitivi.aspectus.length * categoriaeFinitivi.tempus.length}
                                                style={cellStyle(spec =>
                                                    spec.modus === modus
                                                    && spec.vox === vox
                                                )}
                                            >
                                                {vox}
                                            </th>
                                        )
                                    }
                                    {
                                        tempus === categoriaeFinitivi.tempus[0]
                                        &&
                                        <th
                                            style={cellStyle(spec =>
                                                spec.modus === modus
                                                && spec.vox === vox
                                                && spec.aspectus === aspectus
                                            )}
                                            rowSpan={categoriaeFinitivi.tempus.length}
                                        >
                                            {aspectus}
                                        </th>
                                    }
                                    <th style={cellStyle(spec =>
                                        spec.modus === modus
                                        && spec.vox === vox
                                        && spec.aspectus === aspectus
                                        && spec.tempus === tempus
                                    )}>
                                        {tempus}
                                    </th>
                                    {
                                        data.map((datum, index) => {
                                            const titulus = `${datum.forma}[${props.verbum.lexicographia.lemma}]: ${Object.values(datum.status).join(' ')}`
                                            const p = props.posData ? props.posData[datum.series] || 0 : 0
                                            return (
                                                <td
                                                    key={String(datum) + index}
                                                    style={cellStyle(spec =>
                                                        spec.modus === modus
                                                        && spec.vox === vox
                                                        && spec.aspectus === aspectus
                                                        && spec.tempus === tempus
                                                        && spec.persona === datum.status.persona
                                                        && spec.numerus === datum.status.numerus
                                                    )}
                                                    title={datum.forma && titulus}
                                                    onMouseEnter={() => props.onHover(datum.status)}
                                                    onMouseLeave={() => props.onHover({})}
                                                >
                                                    {datum.forma || '–'}
                                                    <span style={{
                                                        float: 'right',
                                                        width: '5em',
                                                        height: '20px',
                                                        background: `hsla(${30 + p * 600}, 90%, ${60 + p * 100}%, 0.6)`
                                                    }}>
                                                        {Math.round(p * 10000) / 100}%
                                                    </span>
                                                </td>
                                            )}
                                        )
                                    }
                                </tr>
                            )
                        }
                        else {
                            return <tr key={tempus} />
                        }
                    })
                ))
            )
        }
    </>
}

interface TabulaFinitiviProps {
    verbum: Verbum
    learning: LearningState
    posData: PosData | null
}

interface TabulaFinitiviState {
    focus: Partial<StatusFinitivi>
}

class TabulaFinitivi extends React.Component<TabulaFinitiviProps, TabulaFinitiviState> {
    
    constructor(props: TabulaFinitiviProps) {
        super(props)
        this.state = {
            focus: { },
        }
    }
    
    render() {
        return (
            <div>
                <table
                    style={{
                        textAlign: 'center',
                        borderCollapse: 'collapse',
                        border: '1px solid #ccc',
                    }}
                >
                    <tbody>
                    {
                        categoriaeFinitivi.modus.map(modus => (
                            <LineaeModi
                                key={modus}
                                verbum={this.props.verbum}
                                modus={modus}
                                focus={this.state.focus}
                                learning={this.props.learning}
                                posData={this.props.posData}
                                onHover={focus => this.setState({focus})}
                            />
                        ))
                    }
                    </tbody>
                </table>
            </div>
        )
    }
}

export default TabulaFinitivi
