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
  
  function loadBytes(bytes) {
    console.log(bytes);
  }
  
  function getTemplate(query) {
    var node = document.querySelector('#templates > ' + query);
    if (!node) return null;
    node = node.cloneNode(true);
    return node;
  }
  
  const content = document.getElementById('content');
  const dropzone = Object.assign(getTemplate('.dropzone'), {
    dragCount: 0,
    ondragenter: function(e) {
      if (++this.dragCount === 1) {
        this.classList.add('dropping');
      }
      e.preventDefault();
    },
    ondragleave: function(e) {
      if (--this.dragCount === 0) {
        this.classList.remove('dropping');
      }
      e.preventDefault();
    },
    ondrop: function(e) {
      this.dragCount = 0;
      e.preventDefault();
      const files = e.dataTransfer && e.dataTransfer.files;
      if (files && files[0]) {
        Object.assign(new FileReader, {
          onload: function(e) {
            loadBytes(new Uint8Array(this.result));
          },
        }).readAsArrayBuffer(files[0]);
      }
    },
  });
  
  content.appendChild(dropzone);

});
