(function(window, document) {
  'use strict'

  const docDom = document.querySelector('.toc')
  const heading2s = document.querySelectorAll('h2')

  let headingContent = ''
  for (let heading of Array.from(heading2s)) {
    heading.id = heading.textContent
    headingContent += `<a href="#${heading.textContent}" class="toc-item">${heading.innerText}</a><br/>`
  }
  docDom.innerHTML = headingContent
})(window, document)