var verba = document.querySelector('.verba')
var numerus = document.querySelector('.numerus')

function quidquidIntegerNumerus(initium, finis) {
    return Math.floor(Math.random() * (finis - initium + 1)) + initium;
}

function novamExercitiaFacere() {
    verba.value = ''
    numerus.innerHTML = quidquidIntegerNumerus(1, 1000)
}

novamExercitiaFacere()