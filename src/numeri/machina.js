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
    numerusDOM.innerHTML = quidquidIntegerNumerus(1, 100)
}

function verbumAbNumero(numerus, data) {
    if (numerus <= 10) {
        // ut 8
        return [data['1'][numerus - 1]]
    }
    else if (numerus <= 20) {
        // ut 18
        return [data['10+'][numerus - 1 - 10]]
    }
    else if (numerus % 10 === 0 && numerus < 100) {
        // ut 70
        return [data['*10'][numerus / 10 - 1]]
    }
    else if (numerus % 10 === 8 && numerus < 100 - 2) {
        // ut 88, non 98
        return ['duodē' + verbumAbNumero(numerus + 2, data)]
    }
    else if (numerus % 10 === 9 && numerus < 100 - 1) {
        // ut 39, non 99
        return ['ūndē' + verbumAbNumero(numerus + 1, data)]
    }
    else if (numerus % 100 === 0 && numerus <= 1000) {
        // ut 700
        return [data['*100'][numerus / 100 - 1]]
    }
    else {
        // Numerus compostus
    }
}

function aequine(numerus, verba, configuratio) {
    return verbumAbNumero(numerus, exercitia.data).indexOf(verba) > -1
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