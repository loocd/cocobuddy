const bodyTag = document.querySelector("body");
const copyValuesArray = document.querySelectorAll(".copy-color-value");
const hexOutput = document.querySelector("#hex-output");
const rgbOutput = document.querySelector("#rgb-output");
const hslOutput = document.querySelector("#hsl-output");
const cmykOutput = document.querySelector("#cmyk-output");

// "preload" class has been added and styled to avoid transitions on page load
// this js removes that "preload" class from the body tag
window.addEventListener("load", function () {
	bodyTag.classList.remove("preload");
});

randomColor();

for (let i = 0; i < copyValuesArray.length; i++) {
	copyValuesArray[i].addEventListener("click", copyColorValue);
}

function randomColor() {
	let rand = randomHSL();
	let c = myColor(rand);
	changeCSS(c.hue, c.sat, c.lum, c.brightest, c.font, c.line, c.logo, c.input);
	writeOutputValues(
		c.hex,
		c.red,
		c.green,
		c.blue,
		c.hue,
		c.sat,
		c.lum,
		c.cyan,
		c.magenta,
		c.yellow,
		c.black
	);
	changeIcon(c.lum);
	changeGradient(c.hue, c.sat, c.brightest);
	writeThemeColor(c.hue, c.sat, c.lum);
}

function randomHSL() {
	let h, s, l;
	// debugger;
	//get random values for h s and l
	h = Math.floor(Math.random() * 360); // random color between 0 and 359
	s = Math.floor(Math.random() * 101); // random color between 0 and 100
	l = Math.floor(Math.random() * 101); // same
	return `hsl(${h}, ${s}%, ${l}%)`;
}

function myColor(color) {
	// debugger;
	let col,
		c,
		type,
		arrLength,
		cArray = [],
		rgb,
		hue,
		sat;

	col = trim(color.toLowerCase());

	if (col.substr(0, 4) == "cmyk") {
		type = "cmyk";
		c = col.substr(4);
		arrLength = 4;
	} else if (col.substr(0, 1) == "#") {
		type = "hex";
		c = col.substr(1);
	} else {
		type = col.substr(0, 3);
		c = col.substr(3);
		arrLength = 3;
	}
	c = c.replace("(", "");
	c = c.replace(")", "");
	cArray = c.split(",");

	if (type == "rgb") {
		if (arrLength != cArray.length) {
			return emptyObject();
		}
		for (let i = 0; i < arrLength; i++) {
			if (cArray[i].indexOf("%") > -1) {
				cArray[i] = cArray[i].replace("%", "");
				cArray[i] = Math.round((cArray[i] / 100) * 255);
			}
			if (isNaN(cArray[i])) {
				return emptyObject();
			}
			if (cArray[i] > 255) {
				cArray[i] = 255;
			}
		}
		rgb = {
			r: cArray[0],
			g: cArray[1],
			b: cArray[2],
		};
	}
	if (type == "hsl") {
		if (cArray[0] >= 360) {
			cArray[0] = 0;
		}
		if (isNaN(cArray[0])) {
			return emptyObject();
		}
		for (let i = 1; i < arrLength; i++) {
			if (cArray[i].indexOf("%") > -1) {
				cArray[i] = cArray[i].replace("%", "");
			}
			if (isNaN(cArray[i])) {
				return emptyObject();
			}
			if (cArray[i] > 100) {
				cArray[i] = 100;
			}
			if (cArray[i] < 0) {
				cArray[i] = 0;
			}
		}
		rgb = hslToRGB(cArray[0], cArray[1], cArray[2]);
		hue = Number(cArray[0]);
		sat = Number(cArray[1]);
	}
	if (type == "cmyk") {
		for (let i = 0; i < arrLength; i++) {
			if (cArray[i].indexOf("%") > -1) {
				cArray[i] = cArray[i].replace("%", "");
			}
			if (isNaN(cArray[i])) {
				return emptyObject();
			}
			if (cArray[i] > 100) {
				cArray[i] = 100;
			}
			if (cArray[i] < 0) {
				cArray[i] = 0;
			}
		}
		rgb = cmykToRGB(cArray[0], cArray[1], cArray[2], cArray[3]);
	}
	if (type == "hex") {
		let cHEX = cArray[0];
		if (cHEX.length < 3) {
			return emptyObject();
		}
		if (cHEX.length == 3) {
			cHEX =
				c.substr(0, 1) +
				c.substr(0, 1) +
				c.substr(1, 1) +
				c.substr(1, 1) +
				c.substr(2, 1) +
				c.substr(2, 1);
		}
		if (cHEX.length == 4) {
			cHEX =
				c.substr(0, 1) + c.substr(1, 1) + "0" + c.substr(2, 1) + c.substr(3, 1);
		}
		rgb = hexToRGB(cHEX);
		if (rgb.valid == false) {
			return emptyObject();
		}
	}
	return colorObject(rgb, hue, sat);
}

function colorObject(rgb, hue, sat) {
	let hsl, cmyk, hex, brightest, contrastColors, inputBackground, color;

	if (!rgb) {
		return emptyObject();
	}
	hsl = rgbToHSL(rgb.r, rgb.g, rgb.b);
	cmyk = rgbToCMYK(rgb.r, rgb.g, rgb.b);
	hex = rgbToHEX(rgb.r, rgb.g, rgb.b);
	brightest = getBrightest(hsl.l);
	contrastColors = getContrastColors(hsl.l);
	inputBackground = getInputBackground(hsl.l);

	color = {
		red: rgb.r,
		green: rgb.g,
		blue: rgb.b,
		hue: hue || hsl.h,
		sat: sat || hsl.s,
		lum: hsl.l,
		brightest: brightest,
		cyan: cmyk.c,
		magenta: cmyk.m,
		yellow: cmyk.y,
		black: cmyk.k,
		hex: hex,
		font: contrastColors.font,
		line: contrastColors.line,
		logo: contrastColors.logo,
		input: inputBackground,
		valid: true,
	};

	color = roundDecimals(color);

	return color;
}

function emptyObject() {
	return {
		red: 0,
		green: 0,
		blue: 0,
		hue: 0,
		sat: 0,
		lum: 0,
		brightest: 0,
		cyan: 0,
		magenta: 0,
		yellow: 0,
		black: 0,
		hex: 0,
		font: 0,
		line: 0,
		logo: 0,
		input: 0,
		valid: false,
	};
}

function trim(x) {
	return x.replace(/^\s+|\s+$/g, "");
}

function roundDecimals(c) {
	// debugger;
	c.red = Math.round(c.red);
	c.green = Math.round(c.green);
	c.blue = Math.round(c.blue);
	c.hue = Math.round(c.hue);
	c.sat = Math.round(c.sat);
	c.lum = Math.round(c.lum);
	c.brightest = Math.round(c.brightest);
	c.cyan = Math.round(c.cyan);
	c.magenta = Math.round(c.magenta);
	c.yellow = Math.round(c.yellow);
	c.black = Math.round(c.black);

	return c;
}

function isHex(x) {
	// debugger;
	return "0123456789ABCDEFabcdef".indexOf(x) > -1;
}

function hslToRGB(hue, saturation, luminance) {
	// debugger;
	let h = hue / 360;
	let s = saturation / 100;
	let l = luminance / 100;
	let temp1, temp2;
	let r, g, b;

	if (s == 0) {
		r = g = b = l; //at 0 saturation, r, g, and b are all equal to the luminance
	} else {
		let checks = (temp1, temp2, temp3) => {
			// debugger;
			if (temp3 < 0) temp3 += 1;
			if (temp3 > 1) temp3 -= 1;
			if (temp3 < 1 / 6) return temp2 + (temp1 - temp2) * 6 * temp3;
			if (temp3 < 1 / 2) return temp1;
			if (temp3 < 2 / 3) return temp2 + (temp1 - temp2) * (2 / 3 - temp3) * 6;
			return temp2;
		};

		temp1 = l < 0.5 ? l * (1 + s) : l + s - l * s;
		temp2 = 2 * l - temp1;
		r = checks(temp1, temp2, h + 1 / 3);
		g = checks(temp1, temp2, h);
		b = checks(temp1, temp2, h - 1 / 3);
	}
	return {
		r: r * 255,
		g: g * 255,
		b: b * 255,
	};
}
function cmykToRGB(c, m, y, k) {
	c /= 100;
	m /= 100;
	y /= 100;
	k /= 100;

	let r = (1 - c) * (1 - k);
	let g = (1 - m) * (1 - k);
	let b = (1 - y) * (1 - k);

	return {
		r: r * 255,
		g: g * 255,
		b: b * 255,
	};
}
function hexToRGB(hex) {
	// debugger;
	let hexArray = [];

	for (let i = 0; i < hex.length; i++) {
		if (!isHex(hex.substr(i, 1))) {
			return emptyObject();
		}
	}
	hexArray[0] = parseInt(hex.substr(0, 2), 16);
	hexArray[1] = parseInt(hex.substr(2, 2), 16);
	hexArray[2] = parseInt(hex.substr(4, 2), 16);
	for (let i = 0; i < hexArray.length; i++) {
		if (isNaN(hexArray[i])) {
			return emptyObject();
		}
	}
	return {
		r: hexArray[0],
		g: hexArray[1],
		b: hexArray[2],
	};
}
function rgbToHSL(r, g, b) {
	// debugger;
	let max, min, h, s, l, temp;

	r /= 255;
	g /= 255;
	b /= 255;

	max = Math.max(r, g, b);
	min = Math.min(r, g, b);

	l = (max + min) / 2;

	if (min === max) {
		h = s = 0;
	} else {
		temp = max - min;
		s = l > 0.5 ? temp / (2 - max - min) : temp / (max + min);

		switch (max) {
			case r:
				h = (g - b) / temp + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / temp + 2;
				break;
			case b:
				h = (r - g) / temp + 4;
				break;
		}
	}
	return {
		h: h * 60,
		s: s * 100,
		l: l * 100,
	};

	//https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
	//https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
	// return [0, 0, 100]; //Konversation fehlt noch - Platzhalter weiss
}
function rgbToCMYK(r, g, b) {
	// debugger;
	let temp_r = r / 255;
	let temp_g = g / 255;
	let temp_b = b / 255;

	let k = 1 - Math.max(temp_r, temp_g, temp_b);
	let c = k == 1 ? 0 : (1 - temp_r - k) / (1 - k);
	let m = k == 1 ? 0 : (1 - temp_g - k) / (1 - k);
	let y = k == 1 ? 0 : (1 - temp_b - k) / (1 - k);

	return {
		c: 100 * c,
		m: 100 * m,
		y: 100 * y,
		k: 100 * k,
	};
}
function rgbToHEX(r, g, b) {
	// debugger;
	r = Math.round(r);
	g = Math.round(g);
	b = Math.round(b);

	let redHex = ("0" + r.toString(16)).slice(-2);
	let greenHex = ("0" + g.toString(16)).slice(-2);
	let blueHex = ("0" + b.toString(16)).slice(-2);
	let hex = "" + redHex + greenHex + blueHex;

	return hex.toUpperCase();
}
function getBrightest(baseValue) {
	if (baseValue === 0) {
		return (baseValue = 90);
	}
	while (baseValue <= 90) {
		baseValue = baseValue + 10;
	}
	return baseValue;
}
function getContrastColors(l) {
	let fontColor, lineColor, logoColor;
	if (l > 50) {
		fontColor = "hsla(0, 0%, 0%, 0.8)";
		lineColor = "hsla(0, 0%, 0%, 0.5)";
		logoColor = "black";
	} else {
		fontColor = "hsla(0, 0%, 100%, 0.8)";
		lineColor = "hsla(0, 0%, 100%, 0.5)";
		logoColor = "white";
	}
	return {
		font: fontColor,
		line: lineColor,
		logo: logoColor,
	};
}

function getInputBackground(l) {
	if (l >= 95) {
		return "hsl(0, 0%, 90%)";
	}
	return "hsl(0, 0%, 100%)";
}

function changeCSS(
	hue,
	saturation,
	luminance,
	brightest,
	fontColor,
	lineColor,
	logoColor,
	inputBackground
) {
	let stylesheet = document.querySelector("link[href='main.css']").sheet;
	// document.getElementById("main-css");
	stylesheet.insertRule(
		`:root {
			--selected-color: hsl(${hue}, ${saturation}%, ${luminance}%);
			--hsl-h: ${hue};
			--hsl-s: ${saturation}%;
			--hsl-l: ${luminance}%;
			--hsl-l-brightest: ${brightest}%;
			--font-color: ${fontColor};
			--line-color: ${lineColor};
			--logo-color: ${logoColor};
			--input-background: ${inputBackground};
		}`,
		1
	);
	stylesheet.deleteRule(2);
}
function writeOutputValues(
	hex,
	red,
	green,
	blue,
	hue,
	sat,
	lum,
	cyan,
	magenta,
	yellow,
	black
) {
	hexOutput.innerHTML = `#${hex}`;
	rgbOutput.innerHTML = `rgb(${red}, ${green}, ${blue})`;
	hslOutput.innerHTML = `hsl(${hue}, ${sat}%, ${lum}%)`;
	cmykOutput.innerHTML = `cmyk(${cyan}%, ${magenta}%, ${yellow}%, ${black}%)`;
}
function changeIcon(l) {
	let iconsArray = document.querySelectorAll(".output__color-copy");
	if (l > 50) {
		for (let i = 0; i < iconsArray.length; i++) {
			iconsArray[i].src = "resources/copy_dark.svg";
		}
	} else {
		for (let i = 0; i < iconsArray.length; i++) {
			iconsArray[i].src = "resources/copy_light.svg";
		}
	}
}
function changeGradient(h, s, l) {
	let rgb,
		hex,
		gradientArray = [];
	while (l >= 0) {
		rgb = hslToRGB(h, s, l);
		hex = rgbToHEX(rgb.r, rgb.g, rgb.b);
		gradientArray.push(hex);
		l -= 10;
	}

	let htmlArray = document.querySelectorAll(".gradient__hex");
	htmlArray[0].innerHTML = "#" + gradientArray[0];
	htmlArray[1].innerHTML = "#" + gradientArray[1];
	htmlArray[2].innerHTML = "#" + gradientArray[2];
	htmlArray[3].innerHTML = "#" + gradientArray[3];
	htmlArray[4].innerHTML = "#" + gradientArray[4];
	htmlArray[5].innerHTML = "#" + gradientArray[5];
	htmlArray[6].innerHTML = "#" + gradientArray[6];
	htmlArray[7].innerHTML = "#" + gradientArray[7];
	htmlArray[8].innerHTML = "#" + gradientArray[8];
	htmlArray[9].innerHTML = "#" + gradientArray[9];
}

function writeThemeColor(h, s, l) {
	if (l < 10) {
		//do nothing
	} else if (l < 20) {
		l -= 10;
	} else {
		l -= 20;
	}
	let rgb = hslToRGB(h, s, l);
	let hex = rgbToHEX(rgb.r, rgb.g, rgb.b);

	let el = document.getElementById("theme-color");

	el.content = `#${hex}`;
}
function copyColorValue() {
	let elCopied = document.getElementById("copied");
	elCopied.classList.add("copied--show");

	let text = this.previousElementSibling.innerText;
	let elem = document.createElement("textarea");
	elem.setAttribute("id", "temporary-for-copy");
	document.body.appendChild(elem);
	elem.value = text;
	elem.select();
	document.execCommand("copy");
	document.body.removeChild(elem);

	elCopied.addEventListener("animationend", () => {
		elCopied.classList.remove("copied--show");
	});
}
