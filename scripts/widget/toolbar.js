define("widget/toolbar", (function() {
	function Toolbar(wrapper) {
		var self = this
		,   buttons = []
		,   activeTool = null

		this.createButton = function(ToolClass, iconImage) {
			var icon = $('<img />', {
				'class': 'icon',
				'src': iconImage
			})
			,   button = $('<button />', {
				html: icon
			})

			button.click(function(e) {
				activeTool = new ToolClass()
				$(self).trigger("selected", [activeTool])
				buttons.forEach(function (elt) { elt.removeClass("selected") })
				button.addClass("selected")
			})
			wrapper.append(button)
			buttons.push(button)

			return button
		}
	}

	return Toolbar
}))