function componentToHex(c) {
  var hex = c.toString(16).toUpperCase();
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbArrayToHex(arrar) {
  return rgbToHex(arrar[0], arrar[1], arrar[2]);
}

export function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function colorStringToRgbNums(str: string): number[] {
  var sColor = str.toLowerCase();
  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      var sColorNew = "#";
      for (var i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    var sColorChange = [];
    for (var i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
    }
    return sColorChange;
  }
  return [];
};