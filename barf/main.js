
requirejs.config({
  waitSeconds: 0,
  baseUrl: '.',
});

require([
  'domReady!'
  ,'nes/Rom'
  ,'rcr/Data'
],
function(
  domReady
  ,NesRom
  ,RCRData
) {

  'use strict';
  
  function loadBytes(bytes) {
    var rom = new NesRom(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var rcr = new RCRData;
    rcr.load(rom);
    console.log(rcr);
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
    ondragover: function(e) {
      e.preventDefault();
    },
    ondrop: function(e) {
      this.dragCount = 0;
      this.classList.remove('dropping');
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
