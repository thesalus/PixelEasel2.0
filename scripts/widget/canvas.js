define("widget/canvas", ["image/rgba", "lib/class", "widget/view"], (function(RGB, Class, View) {
	var Canvas = Class({
		_activeTool: null,
		base: View,
		init: function(container) {
			this.base.init.call(this, container)
			this._context.canvas.addEventListener("mousedown", $.proxy(this._onMouseDown, this), false)
			this._context.canvas.addEventListener("mousemove", $.proxy(this._onMouseMove, this), false)
			this._context.canvas.addEventListener("mouseup", $.proxy(this._onMouseUp, this), false)
			// TODO: when the mouse moves outside of the canvas, it should cancel()
		},
		draw: function() {
			this.base.draw.call(this)
			if (this._zoom > 2) {
				this.drawGrid()
			}
		},
		drawGrid: function() {
			this._context.strokeStyle = this._bgColour

			this._context.scale(1/this._zoom, 1/this._zoom)
			var BATCH_SIZE = 25
			,   batchCount = 0
			this._context.beginPath()
			for (var i = 1; i < this._image.height; i++) {
				this._context.moveTo(0, i * this._zoom)
				this._context.lineTo(this._image.width * this._zoom, i * this._zoom)
				batchCount++
				if (batchCount >= BATCH_SIZE) {
					this._context.stroke();
					batchCount = 0
					this._context.beginPath()
				}
			}
			for (var i = 1; i < this._image.width; i++) {
				this._context.moveTo(i * this._zoom, 0)
				this._context.lineTo(i * this._zoom, this._image.height * this._zoom)
				batchCount++
				if (batchCount >= BATCH_SIZE) {
					this._context.stroke();
					batchCount = 0
					this._context.beginPath()
				}
			}
			this._context.stroke();
		},
		setTool: function(tool) {
			if (null !== this._activeTool) {
				$(this._activeTool).unbind("change")
			}
			this._activeTool = tool
			$(this._activeTool).bind("change", $.proxy(function(event, callback) {
				this._image.modifySketchpad(callback)
				this.draw()
			}, this))
			$(this._activeTool).bind("clear", $.proxy(function(event) {
				this._image.clearSketchpad()
			}, this))
			$(this._activeTool).bind("commit", $.proxy(function(event) {
				this._image.commitSketchpad()
			}, this))
		},
		_onMouseDown: function(event) {
			var position = this._getPixelIndex(event)
			if (null === position) {
				return
			}
			if(event.buttons === 2) {
				this._activeTool.cancel()
			}
			this._activeTool.down(position)
		},
		_onMouseMove: function(event) {
			var position = this._getPixelIndex(event)
			if (null === position) {
				return
			}
			this._activeTool.move(position)
		},
		_onMouseUp: function(event) {
			var position = this._getPixelIndex(event)
			if (null === position) {
				return
			}
			this._activeTool.up(position)
		}
	})

	return Canvas
}))