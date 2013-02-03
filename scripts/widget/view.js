define("widget/view", ["lib/class"], (function(Class) {
	var View = Class({
		_bgColour: "#EEE",
		_container: null,
		_context: null,
		_image: null,
		_zoom: 1,
		init: function(container) {
			var canvas = $("<canvas />")[0]
			this._container = container
			this._context = canvas.getContext("2d")
			this._container.append(canvas)
			$(window).resize($.proxy(this.resize, this))
			this.resize()
		},
		draw: function() {
			this.reset()
			if (this._image === null) {
				return
			}

			this._image.draw(this._context)
		},
		_getPixelIndex: function (event) {
			var canvas = $(this._context.canvas)
			,   x = event.offsetX
			,   y = event.offsetY
			if (x == undefined || y == undefined) {
				x = event.layerX + canvas.offsetParent().offset().left - canvas.offset().left - $(this._container).scrollLeft()
				y = event.layerY + canvas.offsetParent().offset().top - canvas.offset().top - $(this._container).scrollTop()
			}

			if (this._image !== null) {
				x -= Math.ceil((this._context.canvas.width - this._zoom * this._image.width) / 2)
				y -= Math.ceil((this._context.canvas.height - this._zoom * this._image.height) / 2)
				x = Math.ceil(x / this._zoom) - 1
				y = Math.ceil(y / this._zoom) - 1
				if (x >= 0 && y >= 0 && x < this._image.width && y < this._image.height) {
					return {"x": x, "y": y}
				}
			}
			return null
		},
		reset: function() {
			this._context.imageSmoothingEnabled  = false;
			this._context.fillStyle = this._bgColour
			this._context.setTransform(1, 0, 0, 1, 0, 0)
			this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height)
			this._context.fillRect (0, 0, this._context.canvas.width, this._context.canvas.height)
			if (this._image != null) {
				this._context.translate((this._context.canvas.width - this._zoom * this._image.width) / 2,
					(this._context.canvas.height - this._zoom * this._image.height) / 2)
				this._context.scale(this._zoom, this._zoom)
			}
		},
		resize: function() {
			if (this._image != null) {
				this._context.canvas.width = this._image.width * this._zoom
				this._context.canvas.height = this._image.height * this._zoom

				var horizontalMargin = 0
				if (this._container.width() >= this._context.canvas.width) {
					horizontalMargin = Math.floor((this._container.width() - this._context.canvas.width)/2)
				}
				var verticalMargin = 0
				if (this._container.height() >= this._context.canvas.height) {
					verticalMargin = Math.floor((this._container.height() - this._context.canvas.height)/2)
				}
				$(this._context.canvas).css("margin", verticalMargin + "px " + horizontalMargin + "px")
			} else {
				this._context.canvas.width = this._container.width()
				this._context.canvas.height = this._container.height()
			}
			this.draw()
		},
		setImage: function(image) {
			if (this._image !== null) {
				this.reset()
			}
			this._image = image
			this.resize()
			$(this._image).bind("change", $.proxy(this.draw, this))
		},
		setZoom: function(newZoom) {
			if (this._zoom != newZoom) {
				this._zoom = newZoom
				this.resize()
			}
		}
	})

	return View
}))