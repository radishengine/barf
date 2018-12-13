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
    
    load: function(nesRom) {
      let npcNameData = nesRom.get(this.$npcNames);
      let bank = npcNameData.bank;
      let pos = npcNameData.bankOffset;
      var dv = new DataView(bank.buffer, bank.byteOffset, bank.byteLength);
      let firstOffset = bank.byteLength;
      this.npcNames = [];
      do {
        let offset = dv.getUint16(pos, true);
        const highBit = offset & 0x8000;
        if (highBit) {
          offset ^= 0x8000;
          firstOffset = Math.min(firstOffset, offset);
          var endOffset = offset;
          while (bank[endOffset] !== 5) endOffset++;
          this.npcNames.push(this.decodeText(bank.subarray(offset, endOffset)));
        }
        else {
          // first two: $0672, $0677
          this.npcNames.push(offset);
        }
        pos += 2;
      } while (pos < firstOffset);
      
      let convoData = nesRom.get(this.$conversationStrings);
      bank = convoData.bank;
      pos = convoData.bankOffset;
      dv = new DataView(bank.buffer, bank.byteOffset, bank.byteLength);
      firstOffset = bank.byteLength;
      this.conversationStrings = [];
      do {
        let offset = dv.getUint16(pos, true);
        const highBit = offset & 0x8000;
        if (highBit) {
          offset ^= 0x8000;
          firstOffset = Math.min(firstOffset, offset);
          var endOffset = offset;
          while (bank[endOffset] !== 5) endOffset++;
          this.conversationStrings.push(this.decodeText(bank.subarray(offset, endOffset)));
        }
        else {
          this.conversationStrings.push(offset);
        }
        pos += 2;
      } while (pos < firstOffset);
      
      let shopConvoData = nesRom.get(this.$shopConvos);
      bank = shopConvoData.bank;
      pos = shopConvoData.bankOffset;
      dv = new DataView(bank.buffer, bank.byteOffset, bank.byteLength);
      firstOffset = bank.byteLength;
      this.shopConversationStrings = [];
      do {
        let offset = dv.getUint16(pos, true);
        const highBit = offset & 0x8000;
        if (highBit) {
          offset ^= 0x8000;
          firstOffset = Math.min(firstOffset, offset);
          var endOffset = offset;
          while (bank[endOffset] !== 5) endOffset++;
          this.shopConversationStrings.push(this.decodeText(bank.subarray(offset, endOffset)));
        }
        else {
          this.shopConversationStrings.push(offset);
        }
        pos += 2;
      } while (pos < firstOffset);
    },
    
  };
  
  return RCRData;

});
