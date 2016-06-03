
// 
// getClosestColor is a simple, dependancy free function that,
// given any color hex code and a palette (in the form of 
// an array of colors hex codes) will return the hex code of 
// the most visually similar color in the palette
// 
// Usage: getClosestColor(yourColor, myPalette);
// 



function getClosestColor(inputColor, palette) {

    "use strict";

    //
    // input normalizaion
    //

    palette = normalizedPalette(palette);
    inputColor = normalizedColor(inputColor);

    if (!inputColor) {
        throw "error: invalid input color";
    }

    if (!palette) {
        throw "error: invalid input palette";
    }

    function isValidColor(color) {

        if (typeof color !== "string") {
            return false;
        }

        if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
            return false;
        }

        return true;
    }

    function normalizedColor(color) {

        if (isValidColor(color) && color.length !== 7) {
            // convert short color format to full length color format 
            color = color[0] + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
        }

        return color.toUpperCase();
    }

    function isValidPalette(palette) {

        if ( !(typeof palette === "object") || !(palette instanceof Array)) {
            return false;
        }

        if (palette.length === 0) {
            return false;
        }

        for (var i = 0; i < palette.length; i++) {

            if (!isValidColor(palette[i])) {
                return false;
            } 

            palette[i] = normalizedColor(palette[i]);
            
        }

        return true;
    }

    function normalizedPalette(palette) {

        if (isValidPalette(palette)) {
            for (var i = 0; i < palette.length; i++) {
                palette[i] = normalizedColor(palette[i]);
            }
        }

        return palette;
    }

    function hex2dec(hex) {
        return parseInt(hex, 16);
    }

    function getComponents(color) {

        var r = hex2dec(color.substr(1, 2));
        var g = hex2dec(color.substr(3, 2));
        var b = hex2dec(color.substr(5, 2));

        function rgbToXyz(r, g, b) {

            // from https://software.intel.com/en-us/html5/hub/blogs/exploring-color-matching-in-javascript

            var _r = (r / 255);
            var _g = (g / 255);
            var _b = (b / 255);

            if (_r > 0.04045) {
                _r = Math.pow(((_r + 0.055) / 1.055), 2.4);
            } else {
                _r = _r / 12.92;
            }

            if (_g > 0.04045) {
                _g = Math.pow(((_g + 0.055) / 1.055), 2.4);
            } else {
                _g = _g / 12.92;
            }

            if (_b > 0.04045) {
                _b = Math.pow(((_b + 0.055) / 1.055), 2.4);
            } else {
                _b = _b / 12.92;
            }

            _r = _r * 100;
            _g = _g * 100;
            _b = _b * 100;

            var X = _r * 0.4124 + _g * 0.3576 + _b * 0.1805;
            var Y = _r * 0.2126 + _g * 0.7152 + _b * 0.0722;
            var Z = _r * 0.0193 + _g * 0.1192 + _b * 0.9505;

            return [X, Y, Z];
        }

        function xyzToLab(x, y, z) {

            // from https://software.intel.com/en-us/html5/hub/blogs/exploring-color-matching-in-javascript

            var ref_X = 95.047;
            var ref_Y = 100.000;
            var ref_Z = 108.883;

            var _X = x / ref_X;
            var _Y = y / ref_Y;
            var _Z = z / ref_Z;

            if (_X > 0.008856) {
                _X = Math.pow(_X, (1 / 3));
            } else {
                _X = (7.787 * _X) + (16 / 116);
            }

            if (_Y > 0.008856) {
                _Y = Math.pow(_Y, (1 / 3));
            } else {
                _Y = (7.787 * _Y) + (16 / 116);
            }

            if (_Z > 0.008856) {
                _Z = Math.pow(_Z, (1 / 3));
            } else {
                _Z = (7.787 * _Z) + (16 / 116);
            }

            var CIE_L = (116 * _Y) - 16;
            var CIE_a = 500 * (_X - _Y);
            var CIE_b = 200 * (_Y - _Z);

            return [CIE_L, CIE_a, CIE_b];
        }

        function rgbToLab(r, g, b) {

            var xyz = rgbToXyz(r, g, b);
            var lab = xyzToLab(xyz[0], xyz[1], xyz[2]);

            return lab;
        }

        return {
            hex: color,
            rgb: [r, g, b],
            lab: rgbToLab(r, g, b)
        };
    }

    function colorDifference(color1, color2) {

        var lab1 = getComponents(color1).lab;
        var lab2 = getComponents(color2).lab;

        var deltaE = Math.sqrt(
            Math.pow(lab2[0] - lab1[0], 2) +
            Math.pow(lab2[1] - lab1[1], 2) +
            Math.pow(lab2[2] - lab1[2], 2)
        );

        return deltaE;
    }   


    // 
    // loop the palette to choose the closest color 
    // 

    var closestColor = palette[0];

    for (var i = 0; i < palette.length; i++) {

        if (colorDifference(inputColor, palette[i]) < colorDifference(inputColor, closestColor)) {
            closestColor = palette[i];
        }

    }

    return closestColor; 

}