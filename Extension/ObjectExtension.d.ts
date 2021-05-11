interface Diff {
	[key: string]: number | Diff;
}

interface ObjectConstructor {
	deepcopy<T extends Object>(obj: T): T;

	diff(obj1: Object, obj2: Object): Diff;

	/**
	  * Copy the values of all of the enumerable own properties from one or more source objects to a
	  * target object. Returns the target object.
	  * @param target The target object to copy to.
	  * @param source The source object from which to copy properties.
	  */
	merge<T, U>(target: T, source: U): T & U;

	findByPath(obj: Object, path: string): any;

	/**
	 * Delete keys which has undefined value in target object.
	 * @param {Object} obj The target object to delete key.
	 * @param {string[]} deletedKeys Deleted key array.
	 * @return {Object} The target object.
	 */
	trim<T extends Object>(obj: T, deletedKeys?: string[]): T;

	/**
	 * Slice object by keys, weed out other keys.
	 * @param {Object} obj The target object to slice.
	 * @param {string[]} keys left keys.
	 * @return {Object} The sliced object.
	 */
	slice<T extends Object, K extends keyof T>(obj: T, keys: K[]): T;

	/**
	 * Pluck values by keys in object.
	 * @param {Object} obj The target object to pluck.
	 * @param {string[]} keys plucked keys array.
	 * @return {Object} plucked values array.
	 */
	pluck<T extends Object, K extends keyof T>(obj: T, keys: K[]): T[K][];
}