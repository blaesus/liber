const verbaDOM = document.querySelector('.verba')
const numerusDOM = document.querySelector('.numerus')
const bullaVerumne = document.querySelector('.bulla.verumne')
const bullaNescio = document.querySelector('.bulla.nescio')
const bullaNovumNumerum = document.querySelector('.bulla.novum-numerum')
const indicium = document.querySelector('.indicium')

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
    if (numerus <= 10) {
        // ut 8
        return data['1'][numerus - 1]
    }
    else if (numerus <= 20) {
        // ut 18
        return data['10+'][numerus - 1 - 10]
    }
    else if (numerus % 10 === 0 && numerus < 100) {
        // ut 70
        return data['*10'][numerus / 10 - 1]
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
        return data['*100'][numerus / 100 - 1]
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
    var numerus = parseInt(numerusDOM.innerHTML, 10)
    if (aequine(numerus, verbaDOM.value)) {
        indicium.innerHTML = 'Vērum!'
    }
    else {
        indicium.innerHTML = 'Nōn vērum est. Cōnāre iterum?'
    }
}

bullaVerumne.onclick = verificare
verbaDOM.onkeypress = (event) => {
    if (event.charCode === KEY_ENTER) {
        verificare()
    }
}

function nescio() {
    var numerus = parseInt(numerusDOM.innerHTML, 10)
    indicium.innerHTML = `Vēro: ${verbumAbNumero(numerus, exercitia.data)}`
    bullaNovumNumerum.style.display = 'inline-block'
}

bullaNescio.onclick = nescio
document.body.onkeydown = (event) => {
    if (event.keyCode === KEY_ESC) {
        nescio()
    }
}

function novumExercitiumFacere() {
    verbaDOM.value = ''
    indicium.innerHTML = ''
    bullaNovumNumerum.style.display = 'none'
    numerusDOM.innerHTML = quidquidIntegerNumerus(1, 1000)
}

bullaNovumNumerum.onclick = novumExercitiumFacere

novumExercitiumFacere()