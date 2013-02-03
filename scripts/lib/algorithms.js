define("lib/algorithms", (function() {
	var Algorithms = {}

	Algorithms.generateLines = function (p0, p1) {
		var x0 = p0.x
		,   y0 = p0.y
		,   x1 = p1.x
		,   y1 = p1.y
		,   dx = Math.abs(x1 - x0)
		,   dy = Math.abs(y1 - y0)
		,   sx = (x0 < x1) ? 1 : -1
		,   sy = (y0 < y1) ? 1 : -1
		,   err = dx - dy
		,   e2 = null
		,   points = []

		while (true) {
			points.push({"x": x0, "y": y0})
			if (x0 === x1 && y0 === y1) {
				break
			}
			e2 = 2 * err
			if (e2 > -dy) {
				err -= dy
				x0 += sx
			}
			if (e2 < dx) {
				err += dx
				y0 += sy
			}
		}
		return points
	}

	return Algorithms
}))