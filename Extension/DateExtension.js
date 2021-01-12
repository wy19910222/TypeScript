Date.prototype.toCustomString = function (formatStr) {
	if (formatStr) {
		let year = this.getFullYear() + "";
		let month = this.getMonth() + 1 + "";
		let date = this.getDate() + "";
		let hours = this.getHours();
		let hours24 = hours + "";
		let hours12 = hours % 12 + "";
		let minutes = this.getMinutes() + "";
		let seconds = this.getSeconds() + "";
		return formatStr.replace(/y{3,}/, year).replace(/y{1,2}/, year.substring(2))
			.replace(/M{2,}/, month.padStart(2, "0")).replace("M", month)
			.replace(/d{2,}/, date.padStart(2, "0")).replace("d", date)
			.replace(/H{2,}/, hours24.padStart(2, "0")).replace("H", hours24)
			.replace(/h{2,}/, hours12.padStart(2, "0")).replace("h", hours12)
			.replace(/m{2,}/, minutes.padStart(2, "0")).replace("m", minutes)
			.replace(/s{2,}/, seconds.padStart(2, "0")).replace("s", seconds);
	}
	return this.toString();
};