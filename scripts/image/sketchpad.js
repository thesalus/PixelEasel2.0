define("image/sketchpad", ["image/layer", "image/rgba", "lib/class"], (function(Layer, RGBA, Class) {
function SketchpadWrapper(layer) {
	var baseLayer = null
	,   clear = new RGBA(0, 0, 0, 0)
	// The "Active Box" optimizes our layer blending commit
	,   top = 0
	,   bottom = 0
	,   left = 0
	,   right = 0

	var Sketchpad = Class({
		base: Layer,
		clearActiveBox: function() {
			top = this.height
			bottom = 0
			left = this.width
			right = 0
		},
		commit: function() {
			if (top <= bottom && left <= right) {
				for (var x = left; x <= right; x++) {
					for (var y = top; y <= bottom; y++) {
						var colour1 = this.getPixel(x, y)
						,   colour2 = baseLayer.getPixel(x, y)
						baseLayer.setPixel(colour2.blend(colour1), x, y)
						this.setPixel(clear, x, y)
					}
				}
			}
			this.clearActiveBox()
			this.isClean = true
		},
		getUnderlyingPixel: function(x, y) {
			return baseLayer.getPixel(x, y)
		},
		init: function(layer) {
			baseLayer = layer
			this.base.init.apply(this, [layer.width, layer.height]) // super(...)
			baseLayer.registerSketchpad(this)
			// TODO: the baseLayer should unregister this sketchpad when appropriate (e.g., changing layers)
			this.clearActiveBox()
		},
		setPixel: function(colour, x, y) {
			this.base.setPixel.apply(this, [colour, x, y])
			if (x < top) {
				top = x
			}
			if (x > bottom) {
				bottom = x
			}
			if (y < left) {
				left = y
			}
			if (y > right) {
				right = y
			}
		}
	})

	return new Sketchpad(layer)
}

return SketchpadWrapper
}))