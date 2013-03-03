define("tool/line", ["lib/class", "lib/algorithms", "image/rgba", "tool/tool"], (function(Class, Algorithm, RGBA, Tool) {
	// TODO: grab the colour from somewhere
	var colour = new RGBA(0, 0, 0)

	var LineTool = Class({
		base: Tool,
		onModify: function(layer, positions) {
			var currentPosition = positions[positions.length - 1]
			,   previousPosition = positions[positions.length - 2] || currentPosition
			,   firstPosition = positions[0]
			,   clear = new RGBA(0, 0, 0, 0)
			layer.clearActiveBox()
			$.each(Algorithm.generateLines(firstPosition, previousPosition), function(index, point) {
				layer.setPixel(clear, point.x, point.y)
			})
			$.each(Algorithm.generateLines(firstPosition, currentPosition), function(index, point) {
				layer.setPixel(colour, point.x, point.y)
			})
		}
	})

	return LineTool
}))