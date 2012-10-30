var BITS_IN_BYTES = 8;
var ERR_TOO_FAR = "Tried to read too far into bit string.";
var ERR_EXPECTED_TERMINATOR = "ERR_EXPECTED_TERMINATOR";

// GIF Spec:
// http://www.matthewflickinger.com/lab/whatsinagif/bits_and_bytes.asp
// http://www.w3.org/Graphics/GIF/spec-gif89a.txt

function checkByte(name, expected, actual) {
	if (expected !== actual) {
		alert(name + ' should be 0x' + hex(expected) + ', but instead got 0x' + hex(actual));
	}
}

function BlockReader(reader) {
	var self = this,
		byteIndex = 0,
		bitIndex = 0,	// [76543210]
		str = null;

	function init() {
		if (reader.peekByte() === 0x00) {
			throw ERR_TOO_FAR;
		}
		var subBlockLength = reader.getShort();
		str = reader.getStr(subBlockLength);
		byteIndex = 0;
		bitIndex = 0;
	}

	this.getBits = function (bitSize) {
		if (byteIndex >= str.length) {
			init();
		}
		var output = str[byteIndex].charCodeAt(0) >> bitIndex;
		bitIndex += bitSize;
		if (BITS_IN_BYTES < bitIndex) {
			var remaining = bitIndex - BITS_IN_BYTES;
			bitIndex = 0;
			byteIndex += 1;
			output += self.getBits(remaining) << bitSize - remaining;
		}
		return output % Math.pow(2, bitSize);
	};

	this.isEnding = function (bitSize) {
		return reader.peekByte() === 0x00 && (byteIndex + (bitIndex + bitSize) / BITS_IN_BYTES >= str.length);
	};

	init();
}

function BitReader(str) {
	var reader = this,
		byteIndex = 0,
		bitIndex = 0;	// [76543210]

	this.getBits = function (bitSize) {
		if (byteIndex >= str.length) {
			throw ERR_TOO_FAR;
		}
		var byteValue = str[byteIndex].charCodeAt(0),
			output = byteValue >> bitIndex;
		bitIndex += bitSize;
		if (BITS_IN_BYTES < bitIndex) {
			var remaining = bitIndex - BITS_IN_BYTES;
			bitIndex = 0;
			byteIndex += 1;
			output += reader.getBits(remaining) << bitSize - remaining;
		}
		return output % Math.pow(2, bitSize);
	};

	this.getBoolean = function () {
		return 1 === this.getBits(1);
	};

	this.isEnding = function (bitSize) {
		return (byteIndex + (bitIndex + bitSize) / BITS_IN_BYTES >= str.length);
	};
}

/**
 * Creates a reader for a GIF (uses little-endian data).
 */
function GIFReader(file) {
	var reader = this;
	var byteIndex = 0;
	/**
	 * Retrieve the next byte, but do not move the reader head.
	 * 
	 * @this {GIFReader}
	 * @returns {byte} The next byte of data.
	 */
	this.peekByte = function () {
		return file[byteIndex].charCodeAt(0);
	};

	/**
	 * Get the next String.
	 * 
	 * @this {GIFReader}
	 * @param {number} characters The desired number of characters.
	 * @returns {string} A string of the specified size.
	 */
	this.getStr = function (characters) {
		var output = file.slice(byteIndex, byteIndex + characters);
		byteIndex += characters;
		return output;
	};

	/**
	 * Get the next Unsigned integer.
	 * 
	 * @this {GIFReader}
	 * @returns {number} An integer between 0-65,535. (2 bytes)
	 */
	this.getUnsigned = function () {
		var output = file[byteIndex + 1].charCodeAt(0) << 8;
		output += file[byteIndex].charCodeAt(0);
		byteIndex += 2;
		return output;
	};

	/**
	 * Get the next byte.
	 * 
	 * @this {GIFReader}
	 * @returns {byte} The next byte of data.
	 */
	this.getByte = function () {
		byteIndex += 1;
		return file[byteIndex - 1].charCodeAt(0);
	};

	/**
	 * Get the next short value.
	 * 
	 * @this {GIFReader}
	 * @returns {number} An integer between 0-255. (1 byte)
	 */
	this.getShort = function () {
		return reader.getByte();
	};

	/**
	 * Get the next Colour.
	 * 
	 * @this {GIFReader}
	 * @returns {RGB} A colour.
	 */
	this.getColour = function () {
		return new RGB(reader.getShort(), reader.getShort(), reader.getShort());
	};

	/**
	 * Get the next Colour.
	 * 
	 * @this {GIFReader}
	 * @throws {ERR_EXPECTED_TERMINATOR} If the next byte is not a terminator.
	 */
	this.getBlockTerminator = function () {
		if (0x00 !== reader.getByte()) {
			alert('0x00 Block Terminator expected!');
			throw ERR_EXPECTED_TERMINATOR;
		}
	};

	/**
	 * Get a BitReader for the given number of bytes.
	 * 
	 * @this {GIFReader}
	 * @param {number} bytes The number of characters in the string.
	 * @returns {BitReader} A bitreader for the specified number of bytes.
	 */
	this.getBitReader = function (bytes) {
		return new BitReader(reader.getStr(bytes));
	};

	this.getBlockReader = function () {
		return new BlockReader(reader);
	};

	this.getDataSubBlocks = function () {
		var data = "";
		while (reader.peekByte() !== 0x00) {
			var subBlockLength = reader.getShort();
			data = data + reader.getStr(subBlockLength);
		}
		reader.getBlockTerminator();
		return data;
	};
}

// Global Colour Table
function GCT(reader) {
	var bitReader = reader.getBitReader(1);
	// Size of Global Color Table: 2^(N+1)
	this.size = Math.pow(2, 1 + bitReader.getBits(3));
	// Sort Flag: set if the colours in the global color table are sorted in order of "decreasing importance"
	// - typically means "decreasing frequency" in the image. This can help the image decoder but is not required
	this.isSorted = bitReader.getBoolean();
	// Color Resolution
	// - is the number of bits per primary color available to the original image, minus 1
	// - represents the size of the entire palette from which the colors in the graphic were selected.
	// See: http://www.devx.com/projectcool/Article/19997/0/page/7
	this.colourResolution = bitReader.getBits(3);
	// Global Color Table flag: if it is set (i.e., 1), then a global color table will follow
	this.isSet = bitReader.getBoolean();
}

function GCE(reader) {
	// - Graphic Control Label: 0xF9 indicates a Graphic Control Extension
	checkByte("Graphic Control Label", 0xF9, reader.getByte());
	// - Total Block size in bytes
	this.blockSizeInBytes = reader.getShort();

	var bitReader = reader.getBitReader(1);
	// - Transparent Colour Flag
	this.hasTransparentColour = bitReader.getBoolean();
	// - User Input Flag
	this.userInput = bitReader.getBoolean();
	// - Disposal Method
	//   0 -   No disposal specified. The decoder is
	//         not required to take any action.
	//   1 -   Do not dispose. The graphic is to be left
	//         in place.
	//   2 -   Restore to background color. The area used by the
	//         graphic must be restored to the background color.
	//   3 -   Restore to previous. The decoder is required to
	//         restore the area overwritten by the graphic with
	//         what was there prior to rendering the graphic.
	// 4-7 -   To be defined.
	this.disposalMethod = bitReader.getBits(3);
	// - Reserved for future use
	bitReader.getBits(3);
	// - Delay Time
	this.delayTime = reader.getUnsigned();
	// - Transparent Colour Index
	this.transparentColourIndex = reader.getShort();
	reader.getBlockTerminator();
}

function initializeCodeTable(size) {
	var codeTable = [];
	var i;
	for (i = 0; i < size; i++) {
		codeTable.push([i]);
	}
	codeTable.push(0);		// Add Clear Code
	codeTable.push(-1);	// Add End Of Information Code
	return codeTable;
}

function ImageDescriptor(reader) {
	this.imageLeft = reader.getUnsigned();
	this.imageTop = reader.getUnsigned();
	this.width = reader.getUnsigned();
	this.height = reader.getUnsigned();

	var bitReader = reader.getBitReader(1);
	this.localColourTableSize = Math.pow(2, 1 + bitReader.getBits(3));
	bitReader.getBits(2);	// - Reserved for future use
	this.isSorted = bitReader.getBoolean();
	this.isInterlaced = bitReader.getBoolean();
	this.hasLocalColourTable = bitReader.getBoolean();

	this.parseImageData = function (colourTable) {
		var indexList = [];
		//  Each image must fit within the boundaries of the Logical Screen, as defined in the Logical Screen Descriptor.

		var lzwMinimumCodeSize = reader.getShort();
		var expectedClearCode = Math.pow(2, lzwMinimumCodeSize);
		var endOfInformationCode = expectedClearCode + 1;

		// Initialize Code Table
		var codeTable;
		// The current size of each code in bytes. (dictated by largest possible code)
		var codeSize = lzwMinimumCodeSize + 1;
		var codeMax = Math.pow(2, codeSize);

		var blockReader = reader.getBlockReader();
		var code;
		while (!blockReader.isEnding(codeSize)) {
			var previousCode = code;
			code = blockReader.getBits(codeSize);
			if (code === endOfInformationCode) {
				break;
			} else if (code === expectedClearCode) {
				codeTable = initializeCodeTable(expectedClearCode);
				codeSize = lzwMinimumCodeSize + 1;
				codeMax = Math.pow(2, codeSize);

				code = blockReader.getBits(codeSize);
				indexList.push(codeTable[code]);
				continue;
			}

			var isInCodeTable = code < codeTable.length, k;
			if (isInCodeTable) {
				k = codeTable[code][0];
				indexList.push(codeTable[code]);
			} else {
				k = codeTable[previousCode][0];
				indexList.push(codeTable[previousCode]);
				indexList.push([k]);
			}

			var newCode = codeTable[previousCode].slice(0).concat(k);
			codeTable.push(newCode);
			if (codeTable.length >= codeMax) {
				codeSize += 1;
				codeMax *= 2;
			}
		}
		this.indexes = Array.prototype.concat.apply([], indexList);
		reader.getBlockTerminator();
	};
}

function GIF(file) {
	var gif = this;
	var reader = new GIFReader(file);
	var lastGCE = null;

	this.images = [];
	function parseHeader() {
		if ("GIF89a" !== reader.getStr(6)) {
			alert('Please select a GIF file.');
			throw 'Please select a GIF file.';
		}
	}
	function parseLogicalScreenDescriptor() {
		// - logical screen/canvas width in pixels
		gif.width = reader.getUnsigned();
		// - logical screen/canvas height in pixels
		gif.height = reader.getUnsigned();
		// - Global Color Table
		gif.gct = new GCT(reader);
		// - background colour index (meaningful only if GCT is set)
		gif.backgroundIndex = reader.getShort();
		// - pixel aspect ratio: (N + 15) / 64 for all N<>0; 0 is default
		gif.pixelAspectRatio = reader.getShort();
	}
	function parseColourTable(size) {
		var colourTable = [], i;
		for (i = 0; i < size; i++) {
			colourTable.push(reader.getColour());
		}
		return colourTable;
	}
	function parsePlainTextExtension() {
		// requires version 89a
		checkByte("Plain Text Label", 0x01, reader.getByte());
		var blockSize = reader.getShort();
		if (blockSize === 12) {
			var textGridLeftPosition = reader.getUnsigned();
			var textGridTopPosition = reader.getUnsigned();
			var textGridWidth = reader.getUnsigned();
			var textGridHeight = reader.getUnsigned();
			var characterCellWidth = reader.getShort();
			var characterCellHeight = reader.getShort();
			var textForegroundColourIndex = reader.getShort();
			var textBackgroundColourIndex = reader.getShort();
		} else {
			reader.getStr(blockSize);
		}
		var textData = reader.getDataSubBlocks();
		// TODO: something with textData
	}
	function parseApplicationExtension() {
		// requires version 89a
		checkByte("Application Label", 0xFF, reader.getByte());
		var blockSize = reader.getShort();
		var applicationIdentifier = reader.getStr(8);
		var applicationAuthenticationCode = reader.getStr(3);
		var applicationData = reader.getDataSubBlocks();
	}
	function parseCommentExtension() {
		// requires version 89a
		checkByte("Comment Extension", 0xFE, reader.getByte());
		var commentData = reader.getDataSubBlocks();
	}
	function parseControlExtension() {
		checkByte("Extension Introducer", 0x21, reader.getByte());
		switch (reader.peekByte()) {
		case 0x01:
			parsePlainTextExtension();
			break;
		case 0xF9:
			lastGCE = new GCE(reader);
			break;
		case 0xFE:
			parseCommentExtension();
			break;
		case 0xFF:
			parseApplicationExtension();
			break;
		default:
			alert("Unknown control extension");
		}
	}
	function parseImageDescriptor() {
		checkByte("Image Separator", 0x2C, reader.getByte());
		var image = new ImageDescriptor(reader);
		if (image.hasLocalColourTable) {
			image.colourTable = parseColourTable(image.localColourTableSize);
			if (lastGCE.hasTransparentColor) {
				image.colourTable[lastGCE.transparentColourIndex].a == 0;
			}
			image.data.parseImageData(image.colourTable);
		} else {
			image.parseImageData(gif.globalColourTable);
		}
		return image;
	}
	parseHeader();
	parseLogicalScreenDescriptor();
	if (gif.gct.isSet) {
		gif.globalColourTable = parseColourTable(gif.gct.size);
	}

	while (true) {
		switch (reader.peekByte()) {
		case 0x3B:
			console.log("We're done reading.");
			return;
		case 0x2C:
			console.log("parsing an image descriptor");
			gif.images.push(parseImageDescriptor());
			break;
		case 0x21:
			console.log("parsing an extension block");
			parseControlExtension();
			break;
		default:
			console.log("something else");
			break;
		}
	}
}

function GIFWrapper(gif) {
	var wrapper = this;
	this.width = gif.width;
	this.height = gif.height;

	this.getColourAt = function (x, y) {
		var index = gif.images[0].indexes[wrapper.width * y + x], colour;
		if (gif.images[0].hasLocalColourTable) {
			colour = gif.images[0].colourTable[index];
		} else {
			colour = gif.globalColourTable[index];
		}
		return colour;
	};
}