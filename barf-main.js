requirejs.config({
  timeout: 0,
});

require([
  'domReady!'
],
function(
  domReady
) {

  'use strict';
  
  function getTemplate(query) {
    var node = document.querySelector('#templates > ' + query);
    if (!node) return null;
    node = node.cloneNode(true);
    return node;
  }
  
  const content = document.getElementById('content');
  const dropzone = getTemplate('.dropzone');
  
  content.appendChild(dropzone);

});
