define(["image/frame"], (function() {
	var currentLayer = 0

	function Frame(layers) {
		this.layers = layers
		// TODO: rename 'commit'
		this.commit = function(sketchpad) {
			this.layers[currentLayer].commit(sketchpad)
		}
		this.draw = function(context, sketchpad) {
			for (var i = 0; i < this.layers.length; i++) {
				this.layers[i].draw(context)
			}
		}
	}

	return Frame
}))