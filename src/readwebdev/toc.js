(function(window, document) {
  'use strict'
  const headings = document.querySelectorAll('h2, h3, h4')
  for (let heading of [].slice.apply(headings)) {
    heading.addEventListener('click', (event) => {
      let sibiling = heading.nextElementSibling
      while (sibiling) {
        sibiling.classList.toggle('display')
        sibiling = sibiling.nextElementSibling
      }
    })
  }
})(window, window.document)