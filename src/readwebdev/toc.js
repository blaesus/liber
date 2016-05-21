(function(window, document) {
  function activate(event) {
    if (event.target.nodeName.toLowerCase() === 'h4') {
      let sibiling = event.target.nextElementSibling
      event.target.parentNode.classList.toggle('active')
      while (sibiling) {
        sibiling.classList.toggle('display')
        sibiling = sibiling.nextElementSibling
      }
    }
  }
  document.body.addEventListener('click', activate)

  // Everything should open in new tab
  const anchors = [].slice.apply(document.querySelectorAll('main a[href]'))
  anchors.forEach(node => node.target = '_blank')

})(window, window.document)