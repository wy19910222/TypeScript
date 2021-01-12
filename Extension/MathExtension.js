Math.randomRangeInt = function(min, max) {
	return min + Math.floor(Math.random() * (max - min));
};
Math.randomRangeFloat = function(min, max) {
    return min + (Math.random() * (max - min));
};
Math.clamp = function (num, min, max) {
	return Math.max(Math.min(num, max), min);
};
Math.average = function (...numArray) {
	let sum = 0;
	for (let num of numArray) {
		sum += num;
	}
	return sum / numArray.length;
};
Math.variance = function (...numArray) {
	let average = this.average(...numArray);
	let varianceSum = 0;
	for (let num of numArray) {
		varianceSum += Math.pow(num - average, 2);
	}
	return varianceSum / numArray.length;
};
Math.rad2deg = function (rad) {
	return rad * 180 / Math.PI;
};
Math.deg2rad = function (deg) {
	return deg * Math.PI / 180;
};