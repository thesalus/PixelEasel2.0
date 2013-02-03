/**
	A module representing a zoom widget
	@module widget/zoom
 */
define("widget/zoom", (function() {
	var SUB_ELEMENT_PADDING = 5
	,   MIN_ZOOM = 1
	,   MAX_ZOOM = 10
	,   DEFAULT_ZOOM = 1
	,   STEP_SIZE = 1

	/**
		@constructor
		@alias module:widget/zoom
		@param {Node} container The container into which the widget will be injected.
	 */
	function ZoomWidget(container) {
		var self = this
		,   value = DEFAULT_ZOOM
		,   slider = $('<input />', {
				type: 'range',
				min: MIN_ZOOM,
				max: MAX_ZOOM,
				step: STEP_SIZE,
				value: DEFAULT_ZOOM
			})
		,   dropdown = $('<select />')

		/**
		 * @function
		 * @name ZoomWidget#setValue
		 * @fires ZoomWidget#valueChanged
		 */
		this.setValue = function(newValue) {
			if (value != newValue) {
				value = newValue
				$(self).trigger("valueChanged", [value])
				if (newValue !== dropdown.val()) {
					dropdown.val(newValue)
				}
				if (newValue !== slider.val()) {
					slider.val(newValue)
				}
			}
		};

		for (var val = MIN_ZOOM; val <= MAX_ZOOM; val += STEP_SIZE) {
			$('<option />', {value: val, text: val + '00%' }).appendTo(dropdown)
		}
		container.append(slider).append(dropdown)

		slider.change(function(event) {
			self.setValue(this.value)
		})

		dropdown.change(function(event) {
			self.setValue(this.value)
		})
	}
	return ZoomWidget
}))
