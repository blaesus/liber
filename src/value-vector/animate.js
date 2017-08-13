function SvgElement(
    type='',
    attributes={},
    styles={},
    moveTo=()=>{}
) {
    const obj = document.createElementNS("http://www.w3.org/2000/svg", type)
    for (let key in attributes) {
        obj.setAttribute(key, attributes[key])
    }
    for (let key in styles) {
        obj.style[key] = styles[key]
    }
    obj.moveTo = moveTo
    return obj
}

function Circle(label, center, fill) {
    return new SvgElement(
        'circle',
        {
            cx: center[0],
            cy: center[1],
            r: 20,
            class: label
        },
        {
            fill: fill
        },
        function(x, y) {
            this.setAttribute('cx', x)
            this.setAttribute('cy', y)
        }
    )
}

function Line(pointA, pointB, styles={stroke: 'black'}) {
    return new SvgElement(
        'path',
        {
            d: `M ${pointA[0]} ${pointA[1]} L ${pointB[0]} ${pointB[1]}`
        },
        styles,
        function(x, y) {
            this.setAttribute('d', `M ${pointA[0]} ${pointA[1]} L ${x} ${y}`)
        }
    )
}

function drawAxes(svg) {
    const width = svg.width.baseVal.value
    const height = svg.height.baseVal.value
    svg.appendChild(new Line(
        [0,     height/2],
        [width, height/2],
    ))
    svg.appendChild(new Line(
        [width/2, 0     ],
        [width/2, height],
    ))
}

function Canvas(svg) {
    const svgRef = [
        svg.getBoundingClientRect().left,
        svg.getBoundingClientRect().top,
    ]
    const center = [
        svg.width.baseVal.value / 2,
        svg.height.baseVal.value / 2,
    ]

    let dragTargetLabel = ''
    const objects = {}

    drawAxes(svg)

    svg.onmousedown = event => {
        if (event.target.tagName === 'circle') {
            dragTargetLabel = event.target.className.baseVal
        }
        else {
            dragTargetLabel = ''
        }
    }

    svg.onmousemove = event => {
        if (dragTargetLabel) {
            const x = event.clientX - svgRef[0]
            const y = event.clientY - svgRef[1]
            objects[dragTargetLabel].circle.moveTo(x, y)
            objects[dragTargetLabel].line.moveTo(x, y)
        }
    }

    svg.onmouseup = () => dragTargetLabel = null

    return {
        addVector(label, fill) {
            const circle = new Circle(label, center, fill)
            const line = new Line(
                [center[0], center[1]],
                [center[0], center[1]],
                {
                    stroke: 'black',
                    strokeWidth: '2',
                }
            )
            svg.appendChild(line)
            svg.appendChild(circle)

            objects[label] = {
                circle,
                line,
            }
        },
    }
}

function initialize() {
    const canvas = new Canvas(document.querySelector('.main'))
    canvas.addVector('me', 'blue')
    canvas.addVector('you', 'red')
}

function main() {
    initialize()
}

main()