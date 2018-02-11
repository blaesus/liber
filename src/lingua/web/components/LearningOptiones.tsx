import * as React from 'react'
import { categoriaeFinitivi } from '../../lexis'
import { LearningState } from '../components/Programma'

const LearningOptiones = (props: {
    learning: LearningState
    onEligere(optio: [string, string]): void
}) => (
    <div>
        {
            Object.entries(categoriaeFinitivi)
                  .map((entry: [string, string[]]) => (
                      <div
                          key={entry[0]}
                          style={{
                              lineHeight: 2,
                          }}
                      >
                          <span>
                              {entry[0]}
                          </span>
                          {
                              entry[1].map(res =>
                                  <span
                                      key={res}
                                      style={{
                                          display: 'ineline-block',
                                          margin: '0 0.5em',
                                          padding: '0.2em 0.5em',
                                          background: (props.learning as any)[entry[0]][res] ? '#FA0' : '#ccc'
                                      }}
                                      onClick={() => props.onEligere([entry[0], res])}
                                  >
                                      {res}
                                  </span>
                              )
                          }
                      </div>
                  ))
        }
    </div>

)

export default LearningOptiones
