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
    $conversationStrings: 'prg[1]:$0020-$1C00',
    $locationTitleStringIDs: 'prg[1]:$1CBB-$1CDE',
    $shopConvos: 'prg[2]:$1F46-$21D2',
    $miscStrings: 'prg[3]:$3200-$3E00',
    $shopSubmenuStrings: 'prg[2]:$2351-$23E2',
    
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
      return buf.join('');
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
    
    readStrings: function(data) {
      let bank = data.bank;
      let pos = data.bankOffset;
      var dv = new DataView(bank.buffer, bank.byteOffset, bank.byteLength);
      let firstOffset = data.bankOffset + data.byteLength;
      let list = [];
      do {
        let offset = dv.getUint16(pos, true);
        const highBit = offset & 0x8000;
        if (highBit) {
          offset ^= 0x8000;
          firstOffset = Math.min(firstOffset, offset);
          var endOffset = offset;
          while (bank[endOffset] !== 5) endOffset++;
          list.push(this.decodeText(bank.subarray(offset, endOffset)));
        }
        else {
          list.push(offset);
        }
        pos += 2;
      } while (pos < firstOffset);
      return list;
    },
    
    load: function(nesRom) {
      this.npcNames = this.readStrings(nesRom.get(this.$npcNames));
      this.conversationStrings = this.readStrings(nesRom.get(this.$conversationStrings));
      this.shopConversationStrings = this.readStrings(nesRom.get(this.$shopConvos));
      this.miscStrings = this.readStrings(nesRom.get(this.$miscStrings));
      this.shopSubmenuStrings = this.readStrings(nesRom.get(this.$shopSubmenuStrings));
    },
    
  };
  
  return RCRData;

});
