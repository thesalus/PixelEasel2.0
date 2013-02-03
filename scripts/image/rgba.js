/**
	A module representing a colour
	@module image/rgba
 */
define("image/rgba", ["lib/class"], (function(Class) {
	function hex(number) {
		var output = number.toString(16)
		if (number < 0x10) {
			output = "0" + output
		}
		return output
	}

	/**
		@constructor
		@alias module:image/rgba
		@param {Number} r Red value
		@param {Number} g Green value
		@param {Number} b Blue value
		@param {Number} [a] Alpha-index
	 */
	var RGBA = Class({
		r: null,
		g: null,
		b: null,
		a: 255,
		equals: function(other) {
			if (null == other || typeof other != typeof this) {
				return false
			}

			return (this.r == other.r && this.g == other.g && this.b == other.b && this.a == other.a);
		},
		init: function(r, g, b, a) {
			this.r = r
			this.g = g
			this.b = b
			if (null != a && typeof a == 'number') {
				this.a = a
			}
		},

		/**
		 * @function
		 * @name RGBA#hex
		 * @returns The hexadecimal representation of this colour
		 */
		hex: function () {
			return "#" + hex(this.r) + hex(this.g) + hex(this.b)
		},

		blend: function (c2) {
			return new RGBA((c2.a * c2.r + (255 - c2.a) * this.r)/255,
				(c2.a * c2.g + (255 - c2.a) * this.g)/255,
				(c2.a * c2.b + (255 - c2.a) * this.b)/255,
				(c2.a * c2.a + (255 - c2.a) * this.a)/255)
		}
	})

	return RGBA
}))