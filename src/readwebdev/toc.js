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
  
})(window, window.document)