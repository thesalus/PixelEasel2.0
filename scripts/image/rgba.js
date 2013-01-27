function hex(number) {
	var output = number.toString(16);
	if (number < 0x10) {
		output = "0" + output;
	}
	return output;
}

RGB = function (r, g, b) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = 255;
};

RGB.prototype.hex = function () {
	return "#" + hex(this.r) + hex(this.g) + hex(this.b);
};

RGBA = function (r, g, b, a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
};

RGBA.prototype.hex = RGB.prototype.hex;