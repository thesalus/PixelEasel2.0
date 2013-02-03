define("tool/pencil", ["lib/class", "lib/algorithms", "image/rgba", "tool/tool"], (function(Class, Algorithm, RGB, Tool) {
	// TODO: grab the colour from somewhere
	var colour = new RGB(0, 0, 0)

	var PencilTool = Class({
		base: Tool,
		onModify: function(layer, positions) {
			var currentPosition = positions[positions.length - 1]
			,   previousPosition = positions[positions.length - 2] || currentPosition
			$.each(Algorithm.generateLines(previousPosition, currentPosition), function(index, point) {
				layer.setPixel(colour, point.x, point.y)
			})
		}
	})

	return PencilTool
}))