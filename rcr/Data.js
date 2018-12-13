define([
  './charmap_en'
],
function(
  charmap
) {

  const charLookup = Object.create(null);
  for (var k of Object.keys(charmap)) {
    charLookup[charmap[k]] = k;
  }

  function RCRData() {
  }
  RCRData.prototype = {
  
    $wideBackgrounds: 'prg[0]:$0000-$39B0',
    $npcNames: 'prg[0]:$3D20-$4000',
    
    charmap: charmap,
    charLookup: charLookup,
    
    decodeText: function(bytes) {
      var buf = new Array(bytes.length);
      for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] in this.charLookup) {
          buf[i] = this.charLookup[bytes[i]];
        }
        else {
          buf[i] = String.fromCharCode(0xF700 | bytes[i]);
        }
      }
      return buf.join();
    },
    encodeText: function(str) {
      var bytes = new Uint8Array(str.length);
      for (var i = 0; i < str.length; i++) {
        if (this.charmap.hasOwnProperty(str[i])) {
          bytes[i] = this.charmap[str[i]];
        }
        else {
          bytes[i] = str.charCodeAt(i);
        }
      }
      return bytes;
    },
    
    load: function(nesRom) {
      const npcNameBytes = nesRom.get(this.$npcNames);
      const npcNameDV = new DataView(npcNameBytes.buffer, npcNameBytes.byteOffset, npcNameBytes.byteLength);
      let pos = 0;
      let firstOffset = npcNameBytes.length;
      let offsets = [];
      do {
        let offset = npcNameDV.getUint16(pos, true);
        const highBit = offset & 0x8000;
        if (highBit) {
          offset ^= 0x8000;
          firstOffset = Math.min(firstOffset, offset);
          offsets.push('prg[0]:$'+offset.toString(16));
        }
        else {
          // first two: $0672, $0677
          offsets.push('???:$'+offset.toString(16));
        }
        pos += 2;
      } while (pos < firstOffset);
      console.log(offsets);
    },
    
  };
  
  return RCRData;

});
