/**
	A module representing a queue, implemented with 2 stacks
	@module image/rgba
 */
define("lib/queue", (function() {
	var Queue = function() {
		var stacks = [[], []]
		,   popStack = 0
		,   pushStack = 1
		,   pointers = [0, 0]

		this.isEmpty = function() {
			return this.length() === 0
		}

		this.length = function() {
			return (stacks[0].length - pointers[0]) + (stacks[1].length - pointers[1])
		}

		this.pop = function() {
			var output = stacks[popStack][pointers[popStack]]
			pointers[popStack]++
			if (pointers[popStack] >= stacks[popStack].length) {
				pointers[popStack] = 0
				stacks[popStack].length = 0
				pushStack = popStack
				popStack = (popStack + 1) % 2
				if (undefined === output && stacks[popStack].length > 0) {
					return this.pop()
				}
			}
			return output
		}

		this.push = function(item) {
			stacks[pushStack].push(item)
		}
	}

	return Queue
}))