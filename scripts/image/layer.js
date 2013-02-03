define("image/layer", ["image/rgba", "lib/class"], (function(RGBA, Class) {
	var Layer = Class({
		canvas: null,
		height: null,
		imageData: null,
		isClean: false,
		palette: null,
		sketchpad: null,
		width: null,
		clear: function() {
			// TODO: is -1 valid?
			var clear = new RGBA(0, 0, 0, 0)
			for (var i = 0; i < this.width * this.height; i++) {
				this.imageData.data[i*4 + 3] = 0
			}
			this.isClean = true
		},
		draw: function(context) {
			if (!this.isClean) {
				this.canvas.getContext("2d").putImageData(this.imageData, 0, 0)
				this.isClean = true
			}
			// interpolation issue: http://code.google.com/p/chromium/issues/detail?id=134040
			context.drawImage(this.canvas, 0, 0)
			if (null !== this.sketchpad) {
				this.sketchpad.draw(context)
			}
		},
		getPixel: function(x, y) {
			var index = (x + y * this.width) * 4
			var rgba = new RGBA(this.imageData.data[index + 0],
				this.imageData.data[index + 1],
				this.imageData.data[index + 2],
				this.imageData.data[index + 3])
			return rgba
		},
		init: function(width, height) {
			this.height = height
			this.width = width
			this.canvas = $("<canvas>")
				.attr("width", this.width)
				.attr("height", this.height)[0]
			this.imageData = this.canvas.getContext("2d").createImageData(width, height)
		},
		registerSketchpad: function(sketchpad) {
			this.sketchpad = sketchpad
		},
		setPixel: function(colour, x, y) {
			this.isClean = false
			var index = (x + y * this.width) * 4
			this.imageData.data[index + 0] = colour.r
			this.imageData.data[index + 1] = colour.g
			this.imageData.data[index + 2] = colour.b
			this.imageData.data[index + 3] = colour.a
		}
	})

	return Layer;
}))