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
      const prg = new Array(this.bytes[4]);
      var offset = 0x10;
      for (var i = 0; i < prg.length; i++) {
        prg[i] = this.bytes.subarray(offset, offset + 0x4000);
        offset += 0x4000;
      }
      Object.freeze(prg);
      Object.defineProperty(this, 'prg', {value:prg});
      return prg;
    },
    get chr() {
      const chr = new Array(this.bytes[5]);
      var offset = 0x10 + 0x4000 * this.bytes[4];
      for (var i = 0; i < chr.length; i++) {
        chr[i] = this.bytes.subarray(offset, offset + 0x2000);
        offset += 0x2000;
      }
      Object.freeze(chr);
      Object.defineProperty(this, 'chr', {value:chr});
      return chr;
    },
    // TODO: support PlayChoice
    get title() {
      const offset = 0x10 + this.bytes[4]*0x4000 + this.bytes[5]*0x2000;
      const title = String.fromCharCode.apply(null, this.bytes.subarray(offset))
        .replace(/\0[\s\S]*| +$/, '');
      return (title.length > 0) ? title : null;
    },
    get: function(addr) {
      const match = addr.match(/^(prg|chr)\[(\d+)\]:\$([a-fA-F0-9]+)-\$([a-fA-F0-9]+)$/);
      if (!match) throw new Error('invalid rom content address');
      return this[match[1]][+match[2]].subarray(parseInt(match[3], 16), parseInt(match[4], 16));
    },
  };
  
  return NesRom;
  
});
