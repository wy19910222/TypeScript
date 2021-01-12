Array.includes = function (arrayLike, searchElement, fromIndex) {
	return Array.indexOf(arrayLike, searchElement, fromIndex) !== -1;
};
Array.indexOf = function (arrayLike, searchElement, fromIndex) {
	if (arrayLike) {
		if (arrayLike.indexOf) {
			return arrayLike.indexOf(searchElement, fromIndex);
		} else {
			for (let index = fromIndex || 0, length = arrayLike.length; index < length; ++index) {
				if (arrayLike[index] === searchElement) {
					return index;
				}
			}
		}
	}
	return -1;
};
Array.lastIndexOf = function (arrayLike, searchElement, fromIndex) {
	if (arrayLike) {
		if (arrayLike.lastIndexOf) {
			if (arguments.length < 3) {
				return arrayLike.lastIndexOf(searchElement);
			} else {
				return arrayLike.lastIndexOf(searchElement, fromIndex);
			}
		} else {
			for (let index = fromIndex || arrayLike.length - 1; index >= 0; --index) {
				if (arrayLike[index] === searchElement) {
					return index;
				}
			}
		}
	}
	return -1;
};
Array.find = function (arrayLike, predicate, thisArg) {
	let index = Array.findIndex(arrayLike, predicate, thisArg);
	return index !== -1 ? arrayLike[index] : undefined;
};
Array.findIndex = function (arrayLike, predicate, thisArg) {
	if (arrayLike && predicate) {
		if (arrayLike.findIndex) {
			return arrayLike.findIndex(predicate, thisArg);
		} else {
			for (let index = 0, length = arrayLike.length; index < length; ++index) {
				if (predicate.call(thisArg, arrayLike[index], index, arrayLike)) {
					return index;
				}
			}
		}
	}
	return -1;
};
Array.findLast = function (arrayLike, predicate, thisArg) {
	let index = Array.findLastIndex(arrayLike, predicate, thisArg);
	return index !== -1 ? arrayLike[index] : undefined;
};
Array.findLastIndex = function (arrayLike, predicate, thisArg) {
	if (arrayLike && predicate) {
		for (let index = arrayLike.length - 1; index >= 0; --index) {
			if (predicate.call(thisArg, arrayLike[index], index, arrayLike)) {
				return index;
			}
		}
	}
	return -1;
};

Array.contains = function (arrayLike, predicate, thisArg) {
	return Array.findIndex(arrayLike, predicate, thisArg) !== -1;
};