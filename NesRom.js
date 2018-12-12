define(function() {
  
  'use strict';
  
  function NesRom(buffer, byteOffset, byteLength) {
    this.buffer = buffer;
    this.byteOffset = byteOffset;
    this.byteLength = byteLength;
  }
  NesRom.prototype = {
    get bytes() {
      const bytes = new Uint8Array(this.buffer, this.byteOffset, this.byteLength);
      Object.defineProperty(this, 'bytes', {value:bytes});
      return bytes;
    },
    get signature() {
      return String.fromCharCode.apply(null, this.bytes.subarray(0, 4));
    },
    get hasValidSignature() {
      return this.signature === 'NES\x1A';
    },
    get prg() {
      const prg = new Array(this.bytes[3]);
      var offset = 0x10;
      for (var i = 0; i < prg.length; i++) {
        prg[i] = this.subarray(offset, offset + 0x4000);
        offset += 0x4000;
      }
      Object.freeze(prg);
      Object.defineProperty(this, 'prg', {value:prg});
      return prg;
    },
    get chr() {
      const chr = new Array(this.bytes[4]);
      var offset = 0x10 + 0x4000 * this.bytes[3];
      for (var i = 0; i < chr.length; i++) {
        chr[i] = this.subarray(offset, offset + 0x2000);
        offset += 0x2000;
      }
      Object.freeze(chr);
      Object.defineProperty(this, 'chr', {value:chr});
      return chr;
    },
    // TODO: support PlayChoice
    get title() {
      const offset = 0x10 + this.bytes[3]*0x4000 + this.bytes[4]*0x2000;
      const title = String.fromCharCode.apply(null, this.bytes.subarray(offset))
        .replace(/\0[\s\S]*/, '')
        .replace(/ +$/, '');
      return title.length > 0 ? title : null;
    },
  };
  
  return NesRom;
  
});
