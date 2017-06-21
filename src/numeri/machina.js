const dom = {
    verba: document.querySelector('.verba'),
    numerus: document.querySelector('.numerus'),
    bullaVerumne: document.querySelector('.bulla.verumne'),
    bullaNescio: document.querySelector('.bulla.nescio'),
    bullaNovumNumerum: document.querySelector('.bulla.novum-numerum'),
    indicium: document.querySelector('.indicium'),
}

const status = {
    // arabicus litterae romanicus
    ab: 'arabicus',
    ad: 'litterae',
}

const KEY_ENTER = 13
const KEY_ESC = 27

function quidquidIntegerNumerus(initium, finis) {
    return Math.floor(Math.random() * (finis - initium + 1)) + initium;
}

// partem(12345, 1)    ===  40
// partem(12345, 1, 2) === 340
function partem(numerus, minimum, maximum) {
    if (typeof maximum === 'undefined') {
        maximum = minimum + 1
    }
    return (numerus % Math.pow(10, maximum)) - (numerus % Math.pow(10, minimum))
}

function verbumAbNumero(numerus, data) {
    if (numerus <= 20) {
        // ut 8 aut 14
        return data['1'][numerus - 1]
    }
    else if (numerus % 10 === 0 && numerus < 100) {
        // ut 70
        return data['10'][numerus / 10 - 1]
    }
    else if (numerus % 10 === 8 && numerus < 100 - 2) {
        // ut 88, non 88
        return 'duodē' + verbumAbNumero(numerus + 2, data)
    }
    else if (numerus % 10 === 9 && numerus < 100 - 1) {
        // ut 39, non 99
        return 'ūndē' + verbumAbNumero(numerus + 1, data)
    }
    else if (numerus % 100 === 0 && numerus <= 1000) {
        // ut 700
        return data['100'][numerus / 100 - 1]
    }
    else if (numerus < 2000) {
        // Numerus compostus
        const digiti = String(numerus).length
        return [
            verbumAbNumero(partem(numerus, digiti - 1), data),
            verbumAbNumero(partem(numerus, 0, digiti - 1), data),
        ].join(' ')
    }
}

function aequine(numerus, verba, configuratio) {
    return verbumAbNumero(numerus, exercitia.data) === verba
}

// DOM

function verificare() {
    var numerus = parseInt(dom.numerus.innerHTML, 10)
    if (aequine(numerus, dom.verba.innerText)) {
        dom.indicium.innerHTML = 'Vērum!'
    }
    else {
        dom.indicium.innerHTML = 'Nōn vērum est. Cōnāre iterum?'
    }
}

dom.bullaVerumne.onclick = verificare
dom.verba.onkeypress = (event) => {
    if (event.charCode === KEY_ENTER) {
        event.preventDefault()
        verificare()
    }
}

function nescio() {
    var numerus = parseInt(numerusDOM.innerHTML, 10)
    dom.indicium.innerHTML = verbumAbNumero(numerus, exercitia.data)
    dom.bullaNovumNumerum.style.display = 'inline-block'
}

dom.bullaNescio.onclick = nescio
document.body.onkeydown = (event) => {
    if (event.keyCode === KEY_ESC) {
        nescio()
    }
}

function modosPingere() {
    ;[].slice.apply(document.querySelectorAll(`.arca-modi span`))
    .map(node => node.classList.remove('illustrans', 'invalidus'))

    document.querySelector(`.ab span.${status.ab}`).classList.add('illustrans')
    document.querySelector(`.ad span.${status.ad}`).classList.add('illustrans')
    document.querySelector(`.ab span.${status.ad}`).classList.add('invalidus')
    document.querySelector(`.ad span.${status.ab}`).classList.add('invalidus')
}

function novumExercitiumFacere() {
    dom.verba.innerHTML = ''
    dom.indicium.innerHTML = ''
    dom.bullaNovumNumerum.style.display = 'none'
    dom.numerus.innerHTML = quidquidIntegerNumerus(1, 1000)

    modosPingere()
}

function formam(className) {
    const regex = className.match(/arabicus|litterae|romanicus/)
    return regex ? regex[0] : regex
}

function modum(className) {
    const regex = className.match(/ab|ad/)
    return regex ? regex[0] : regex
}

function contra(directio) {
    if (directio === 'ad') {
        return 'ab'
    }
    else {
        return 'ad'
    }
}

function validine(modus, forma) {
    return modus && forma
        && status[modus] !== forma
        && status[contra(modus)] !== forma
}

for (let node of document.querySelectorAll('.arca-modi')) {
    node.onclick = (event) => {
        const modus = modum(event.currentTarget.className)
        const forma = formam(event.target.className)
        if (validine(modus, forma)) {
            status[modus] = forma
            modosPingere()
        }
    }
}

dom.bullaNovumNumerum.onclick = novumExercitiumFacere

novumExercitiumFacere()
dom.verba.focus()