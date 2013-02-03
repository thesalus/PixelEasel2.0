define("image/gifimage", ["lib/class", "lib/gif", "image/frame", "image/image", "image/layer", "image/sketchpad"],
		(function(Class, GIF, Frame, Image, Layer, Sketchpad) {
	function GIFImageWrapper(file) {
		var gif = new GIF(file)
		/* The number of rows that exist before the pass that the index belongs to. */
		,   interlacePassOffsets = function() {
			var a = Math.floor((gif.height + 7)/8)
			,	b = Math.floor((gif.height + 3)/8) + a
			,	c = Math.floor((gif.height + 1)/4) + b
			return [0,c,b,c,a,c,b,c] }()
		/* The offset within its group. */
		,   interlaceGroupOffset = [0,0,0,1,0,2,1,3]
		/* The number of rows in a given group. */
		,   interlaceGroupSize = [1,4,2,4,1,4,2,4]
		,   currentFrame = 0
		,   sketchpad = null

		function getColourAt(frame, x, y) {
			var index = getIndex(frame, x, y), colour
			if (gif.images[frame].hasLocalColourTable) {
				colour = gif.images[frame].colourTable[index]
			} else {
				colour = gif.globalColourTable[index]
			}
			return colour
		}

		function getIndex(frame, x, y) {
			var newY = y
			if (gif.images[frame].isInterlaced) {
				newY = Math.floor(y / 8) * interlaceGroupSize[y % 8]
					+ interlacePassOffsets[y % 8] + interlaceGroupOffset[y % 8]
			}
			return gif.images[frame].indexes[gif.width * newY + x]
		}

		var GIFImage = Class({
			base: Image,
			init: function(gif) {
				this.base.init.call(this)
				this.height = gif.height
				this.width = gif.width

				// TODO: multiple frames
				var layer = new Layer(gif.width, gif.height)
				for (var x = 0; x < gif.width; x++) {
					for (var y = 0; y < gif.height; y++) {
						colour = getColourAt(0, x, y)
						layer.setPixel(colour, x, y)
					}
				}
				this.frames.push(new Frame([layer]))
				sketchpad = new Sketchpad(layer)
			},
			clearSketchpad: function() {
				sketchpad.clear()
				this.base.clearSketchpad.call(this)
			},
			commitSketchpad: function() {
				sketchpad.commit()
				this.base.commitSketchpad.call(this)
			},
			draw: function(context) {
				this.frames[currentFrame].draw(context)
			},
			generateFile: function() {
				var content = "GIF89a"
				var uriContent = "data:application/octet-stream," + encodeURIComponent(content)
				newWindow=window.open(uriContent, 'neuesDokument')
				document.write('<a href="data:image/gif;base64,'+encodeURIComponent(content)+'">foo</a>')
			},
			modifySketchpad: function(cb) {
				cb(sketchpad)
			}
		})

		return new GIFImage(gif)
	}

	return GIFImageWrapper
}))