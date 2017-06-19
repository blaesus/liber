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
    numerusDOM.innerHTML = quidquidIntegerNumerus(1, 1000)
}

function aequine(numerus, verba, configuratio) {
    return false
}

bullaVerumne.onclick = function() {
    if (aequine(numerusDOM.innerHTML, verbaDOM.value)) {
        indicium.innerHTML = 'Vērum!'
    }
    else {
        indicium.innerHTML = 'Nōn vērum est. Cōnāre iterum?'
    }
}

verbaDOM.oninput = function() {
    console.info('hi')
}

novamExercitiaFacere()