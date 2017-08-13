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


function Canvas(svg) {
    const svgRef = [
        svg.getBoundingClientRect().left,
        svg.getBoundingClientRect().top,
    ]
    const width = svg.width.baseVal.value
    const height = svg.height.baseVal.value
    const center = [
        width / 2,
        height / 2,
    ]

    let dragTargetLabel = ''
    const objects = {}

    function drawAxes(svg) {
        svg.appendChild(new Line(
            [0,     height/2],
            [width, height/2],
        ))
        svg.appendChild(new Line(
            [width/2, 0     ],
            [width/2, height],
        ))
    }

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

    svg.onmouseup = () => dragTargetLabel = ''

    drawAxes(svg)

    return {
        addVector(label, fill, endPointRatio=[0, 0]) {
            const endPoint = [
                (width + width * endPointRatio[0]) / 2,
                (height + height * endPointRatio[1]) / 2,
            ]
            const circle = new Circle(label, endPoint, fill)
            const line = new Line(
                [center[0], center[1]],
                [endPoint[0], endPoint[1]],
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
    canvas.addVector('me', 'blue', [0.5, -0.1])
    canvas.addVector('you', 'red', [-0.5, -0.5])
    canvas.addVector('action', 'black', [0.1, -0.8])
}

function main() {
    initialize()
}

main()