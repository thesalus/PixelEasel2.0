define("tool/fill", ["lib/class", "lib/algorithms", "lib/queue", "image/rgba", "tool/tool"],
(function(Class, Algorithm, Queue, RGBA, Tool) {
var clearColour = new RGBA(0, 0, 0, 0)

function FillToolWrapper() {
	// TODO: grab the colour from somewhere
	var colour = new RGBA(0, 0, 0)
	,   lastBaseColour = null
	,   needsReplacing = function(sketchpad, x, y) {
			return !sketchpad.getPixel(x, y).equals(colour) &&
					sketchpad.getUnderlyingPixel(x, y).equals(lastBaseColour)
		}

	var FillTool = Class({
		base: Tool,
		onModify: function(sketchpad, positions) {
			var currentPosition = positions[positions.length - 1]
			,   queue = new Queue()
			if (sketchpad.getUnderlyingPixel(currentPosition.x, currentPosition.y).equals(colour)) {
				return
			}
			queue.push(currentPosition)
			lastBaseColour = sketchpad.getUnderlyingPixel(currentPosition.x, currentPosition.y)
			while (!queue.isEmpty()) {
				point = queue.pop()
				if (!needsReplacing(sketchpad, point.x, point.y)) {
					continue
				}
				var w = point.x
				,   e = point.x
				while (w > 0 && needsReplacing(sketchpad, w - 1, point.y)) {
					w -= 1
				}
				while (e + 1 < sketchpad.width && needsReplacing(sketchpad, e + 1, point.y)) {
					e += 1
				}
				for (var x = w; x <= e; x++) {
					sketchpad.setPixel(colour, x, point.y)
					if (point.y - 1 >= 0) {
						queue.push({"x": x, "y": point.y - 1})
					}
					if (point.y + 1 < sketchpad.height) {
						queue.push({"x": x, "y": point.y + 1})
					}
				}
			}
		}
	})

	return new FillTool()
}

return FillToolWrapper
}))