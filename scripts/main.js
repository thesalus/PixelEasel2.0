require(["widget/canvas", "widget/toolbar", "widget/view", "widget/zoom", "image/gifimage",
		"tool/fill", "tool/line", "tool/pencil", "lib/queue"],
		function(Canvas, Toolbar, View, ZoomWidget, GIFImage, FloodFill, Line, Pencil, Queue) {
	var canvas = new Canvas($("#content .wrapper"))
	,   preview = new View($("#preview"))
	,   zoom = new ZoomWidget($("#zoomer"))
	,   toolbar = new Toolbar($("#toolbar"))
	,   loadButton = $("#open-image")
	,   saveButton = $("#save-image")

	function loadImage(file) {
		gif = new GIFImage(file)
		canvas.setImage(gif)
		preview.setImage(gif)
		return gif
	}

	// how do we make this nice?
	var image = null
	// Credits:
	// Reading files: http://www.html5rocks.com/en/tutorials/file/dndfiles/
	function handleFileSelect(event) {
		var files = event.target.files
		if (!files.length) {
			throw "No file provided!"
		}

		var file = files[0]
		loadFile(file)
	}

	function loadFile(file) {
		if (!file.type.match('image.*')) {
			alert('Please select an image file!')
			throw "Illegal file type!"
		}

		var reader = new FileReader()

		reader.onloadend = function(event) {
			if (event.target.readyState == FileReader.DONE) {
				image = loadImage(event.target.result)
				saveButton.removeClass("disabled")
			}
		};

		reader.readAsBinaryString(file)
	}

	function saveFile() {
		if (null !== image) {
			image.generateFile()
		}
	}

	loadButton.click(function(e) { $('<input />')
		.attr({type: 'file', name: 'files[]', accept: 'image/gif'})
		.on('change', handleFileSelect).click() })
	saveButton.click(saveFile)
	saveButton.addClass("disabled")
	$(zoom).bind("valueChanged", function(event, value) {
		canvas.setZoom(value)
	})

	$(toolbar).bind("selected", function(event, value) {
		canvas.setTool(value)
	})
	toolbar.createButton(Pencil, "images/pencil.png").click()
	toolbar.createButton(Line, "images/line.png")
	toolbar.createButton(FloodFill, "images/paintcan.png")
})