function Canvas(id) {
	this.zoom = 1;
	var self = this;
	var c = document.getElementById(id);
	var context = c.getContext("2d");

	var p = document.getElementById("preview");
	var preview = p.getContext("2d");

	var imageObject;
	var imageData;

	this.draw = function() {
		this.reset();
		if (typeof imageObject === 'undefined') {
			return;
		}
		var newCanvas = $("<canvas>")
			.attr("width", imageData.width)
			.attr("height", imageData.height)[0];

		newCanvas.getContext("2d").putImageData(imageData, 0, 0);
		// interpolation issue: http://code.google.com/p/chromium/issues/detail?id=134040

		context.translate((c.width - this.zoom * imageObject.width) / 2,
			(c.height - this.zoom * imageObject.height) / 2);
		context.scale(this.zoom, this.zoom);
		context.drawImage(newCanvas, 0, 0);
		// TODO: preview (weird distortions)
		preview.drawImage(newCanvas, 0, 0);
	};

	this.reset = function() {
		context.fillStyle = "#EEE";
		context.fillRect (0, 0, c.width, c.height);
		// TODO: set border
		context.setTransform(1, 0, 0, 1, 0, 0);
	};

	this.resize = function() {
		c.width = ($("#application").width() - 250);
		c.height = $("#application").height() - 40;
		self.draw();
	};

	this.setImage = function(image) {
		imageObject = image;
		imageData = context.createImageData(image.width, image.height)
		for (var x = 0; x < image.width; x++) {
			for (var y = 0; y < image.height; y++) {
				index = (x + y * image.width) * 4;
				colour = image.getColourAt(x, y);
				imageData.data[index + 0] = colour.r;
				imageData.data[index + 1] = colour.g;
				imageData.data[index + 2] = colour.b;
				imageData.data[index + 3] = colour.a;
			}
		}
	};

	this.setZoom = function(zoom) {
		if (self.zoom != zoom) {
			self.zoom = zoom;
			self.draw();
		}
	};

	window.onresize = this.resize;
	this.resize();
}