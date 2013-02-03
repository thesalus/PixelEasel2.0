define("tool/tool", ["lib/class"], (function(Class) {
	var isDown = false
	,   positions = []
	,   lastPosition = null

	var Tool = Class({
		cancel: function() {
			isDown = false
			$(this).trigger("clear")
			positions.length = 0
		},
		down: function(position) {
			isDown = true
			this._change(position)
		},
		move: function(position) {
			if (!isDown) {
				return
			}
			if (lastPosition.x == position.x && lastPosition.y == position.y) {
				return
			}
			this._change(position)
		},
		up: function(position) {
			isDown = false
			$(this).trigger("commit")
			// TODO: add an event to the canvas history
			positions.length = 0
		},
		_change: function(position) {
			lastPosition = position
			positions.push(position)

			var self = this
			$(this).trigger("change", [(function(layer) {
				if (positions.length > 0) {
					self.onModify(layer, positions)
				}
			})]);
		},
		onModify: function(sketchpad, lastPosition, currentPosition) {}
	})

	return Tool
}))