define("image/image", ["lib/class"], (function(Class) {
	var Image = Class({
		frames: null,
		height: null,
		width: null,
		clearSketchpad: function() {
			this._onChange()
		},
		commitSketchpad: function() {
			this._onChange()
		},
		init: function() {
			this.frames = []
		},
		draw: function(context) {
			for (var i = 0; i < this.frames.length; i++) {
				this.frames[i].draw(context)
			}
		},
		modifyFrame: function(callback) {
			// TODO: figure out a nice way to fit this in
			callback(this.frames[0])
		},
		_onChange: function() {
			$(this).trigger("change", [])
		}
	})

	return Image
}))