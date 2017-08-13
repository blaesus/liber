function SvgElement(type='', attributes={}, styles={}) {
    const obj = document.createElementNS("http://www.w3.org/2000/svg", type)
    for (let key in attributes) {
        obj.setAttribute(key, attributes[key])
    }
    for (let key in styles) {
        obj.style[key] = styles[key]
    }
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
        }
    )
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

    let dragTarget = null

    svg.onmousedown = event => {
        if (event.target.tagName === 'circle') {
            dragTarget = event.target
        }
        else {
            dragTarget = null
        }
    }

    svg.onmousemove = event => {
        if (dragTarget) {
            const x = event.clientX - svgRef[0]
            const y = event.clientY - svgRef[1]
            dragTarget.setAttribute('cx', x)
            dragTarget.setAttribute('cy', y)
        }
    }

    svg.onmouseup = () => dragTarget = null

    return {
        addVector(label, fill) {
            svg.appendChild(new Circle(label, center, fill))
        }
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