var verbaDOM = document.querySelector('.verba')
var numerusDOM = document.querySelector('.numerus')
var bullaVerumne = document.querySelector('.bulla.verumne')
var indicium = document.querySelector('.indicium')

function quidquidIntegerNumerus(initium, finis) {
    return Math.floor(Math.random() * (finis - initium + 1)) + initium;
}

function novamExercitiaFacere() {
    verbaDOM.value = ''
    indicium.innerHTML = ''
    numerusDOM.innerHTML = quidquidIntegerNumerus(10, 20)
}

function verbumAbNumero(numerus, data) {
    if (numerus <= 10) {
        return data['1'][numerus - 1]
    }
    else if (numerus <= 20) {
        return data['10+'][numerus - 1 - 10]
    }
    else if (numerus % 10 === 0 && numerus < 100) {
        return data['*10'][numerus / 10 - 1]
    }
    else if (numerus % 100 === 0 && numerus <= 1000) {
        return data['*100'][numerus / 100 - 1]
    }
}

function aequine(numerus, verba, configuratio) {
    return verbumAbNumero(numerus, exercitia.data) === verba
}

bullaVerumne.onclick = function() {
    var numerus = parseInt(numerusDOM.innerHTML, 10)
    if (aequine(numerus, verbaDOM.value)) {
        indicium.innerHTML = 'Vērum!'
    }
    else {
        indicium.innerHTML = 'Nōn vērum est. Cōnāre iterum?'
    }
}

novamExercitiaFacere()