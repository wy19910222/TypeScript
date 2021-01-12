declare interface Math {
	randomRangeInt(min: number, max:number): number;
	randomRangeFloat(min: number, max: number): number;
	clamp(num: number, min: number, max: number): number;
	average(...numArray: number[]): number;
	variance(...numArray: number[]): number;
	rad2deg(rad: number): number;
	deg2rad(deg: number): number;
}