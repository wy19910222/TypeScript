declare namespace cc {
	class Node {
		constructor(name: string);
		setParent(parent: Node): void;
		addComponent<T extends Component>(type: {new(): T}): T;
	}
	class Component {
		isValid: boolean;
	}
	namespace director {
		function getTotalFrames(): number;
		function getDeltaTime(): number;
		function getScene(): Node;
	}
}

export class WaitForFrames {
	private readonly _frames: number;
	private _doneFrame: number;

	constructor(frames: number) {
		this._frames = frames;
	}

	public resetDoneFrame(): void {
		this._doneFrame = cc.director.getTotalFrames() + this._frames;
	}

	public get isDone(): boolean {
		return cc.director.getTotalFrames() >= this._doneFrame;
	}
}

export class WaitForSeconds {
	private readonly _milliSeconds: number;
	private _doneTime: number;

	constructor(seconds: number) {
		this._milliSeconds = seconds * 1000;
	}

	public resetDoneTime(): void {
		this._doneTime = Date.now() + this._milliSeconds;
	}

	public get isDone(): boolean {
		return Date.now() >= this._doneTime;
	}
}

export class WaitForLateUpdate { }

export class Coroutine {
	private readonly _owner: cc.Component;
	public get owner(): cc.Component {
		return this._owner;
	}

	private readonly _iterator: IterableIterator<any>;
	public get iterator(): IterableIterator<any> {
		return this._iterator;
	}

	private _current: any;
	public get current(): any {
		return this._current;
	}

	constructor(iterator: IterableIterator<any>, mOwner?: cc.Component) {
		this._iterator = iterator;
		this._owner = mOwner;
	}

	public next(): IteratorResult<any> {
		let result;
		try {
			result = this._iterator.next();
		} catch (e) {
			result = {done: true};
			console.error(e);
		}
		this._current = result.value;
		return result;
	}
}

export class CoroutineManager extends cc.Component {
	private static s_instance: CoroutineManager;
	public static get instance(): CoroutineManager {
		if (!this.s_instance) {
			let node = new cc.Node("CoroutineManager");
			node.setParent(cc.director.getScene());
			this.s_instance = node.addComponent(CoroutineManager);
		}
		return this.s_instance;
	}

	//#region Coroutine
	private _coroutinesMap = new Map<Function, Coroutine[]>();

	protected onLoad() {
		this._coroutinesMap.set(Object, []);
		this._coroutinesMap.set(WaitForFrames, []);
		this._coroutinesMap.set(WaitForSeconds, []);
		this._coroutinesMap.set(Coroutine, []);
		this._coroutinesMap.set(WaitForLateUpdate, []);
	}

	protected update(): void {
		this.invokeDefaultCoroutine();
		this.invokeFramesCoroutine();
		this.invokeSecondsCoroutine();
		this.invokeStartCoroutineCoroutine();
	}

	protected lateUpdate(): void {
		this.invokeLateUpdateCoroutine();
	}

	private invokeDefaultCoroutine(): void {
		let coroutines = this._coroutinesMap.get(Object);
		this._coroutinesMap.set(Object, []);
		for (let coroutine of coroutines) {
			if (coroutine) {
				if (!coroutine.owner || coroutine.owner.isValid) {
					if (!coroutine.next().done) {
						this.updateCoroutine(coroutine);
						this.addCoroutine(coroutine);
					}
				}
			}
		}
	}

	private invokeFramesCoroutine(): void {
		let coroutines = this._coroutinesMap.get(WaitForFrames);
		this._coroutinesMap.set(WaitForFrames, []);
		for (let coroutine of coroutines) {
			if (coroutine) {
				if (!coroutine.owner || coroutine.owner.isValid) {
					let current: WaitForFrames = coroutine.current;
					if (current.isDone) {
						if (!coroutine.next().done) {
							this.updateCoroutine(coroutine);
							this.addCoroutine(coroutine);
						}
					} else {
						this.addCoroutine(coroutine);
					}
				}
			}
		}
	}

	private invokeSecondsCoroutine(): void {
		let coroutines = this._coroutinesMap.get(WaitForSeconds);
		this._coroutinesMap.set(WaitForSeconds, []);
		for (let coroutine of coroutines) {
			if (coroutine) {
				if (!coroutine.owner || coroutine.owner.isValid) {
					let current: WaitForSeconds = coroutine.current;
					if (current.isDone) {

						if (!coroutine.next().done) {
							this.updateCoroutine(coroutine);
							this.addCoroutine(coroutine);
						}
					} else {
						this.addCoroutine(coroutine);
					}
				}
			}
		}
	}

	private invokeStartCoroutineCoroutine(): void {
		let coroutines = this._coroutinesMap.get(Coroutine);
		this._coroutinesMap.set(Coroutine, []);
		for (let coroutine of coroutines) {
			if (coroutine) {
				if (!coroutine.owner || coroutine.owner.isValid) {
					let current: Coroutine = coroutine.current;
					if (this.isCoroutineDone(current)) {
						if (!coroutine.next().done) {
							this.updateCoroutine(coroutine);
							this.addCoroutine(coroutine);
						}
					} else {
						this.addCoroutine(coroutine);
					}
				}
			}
		}
	}

	private invokeLateUpdateCoroutine(): void {
		let coroutines = this._coroutinesMap.get(WaitForLateUpdate);
		this._coroutinesMap.set(WaitForLateUpdate, []);
		for (let coroutine of coroutines) {
			if (coroutine) {
				if (!coroutine.owner || coroutine.owner.isValid) {
					if (!coroutine.next().done) {
						this.updateCoroutine(coroutine);
						this.addCoroutine(coroutine);
					}
				}
			}
		}
	}

	private updateCoroutine(coroutine: Coroutine): void {
		let current = coroutine.current;
		if (current) {
			if ((<Object>current).constructor === WaitForFrames) {
				(<WaitForFrames>current).resetDoneFrame();
			} else if ((<Object>current).constructor === WaitForSeconds) {
				(<WaitForSeconds>current).resetDoneTime();
			}
		}
	}

	private addCoroutine(coroutine: Coroutine): void {
		let current = coroutine.current;
		if (current) {
			let type = (<Object>current).constructor;
			if (type && this._coroutinesMap.has(type)) {
				this._coroutinesMap.get(type).push(coroutine);
				return;
			}
		}
		this._coroutinesMap.get(Object).push(coroutine);
	}

	private isCoroutineDone(coroutine: Coroutine): boolean {
		for (let coroutines of this._coroutinesMap.values()) {
			if (coroutines && coroutines.includes(coroutine)) {
				return false;
			}
		}
		return true;
	}

	private removeCoroutineBy(predicate: (type: Function, coroutine: Coroutine) => boolean): void {
		for (let [type, coroutines] of this._coroutinesMap) {
			for (let index = coroutines.length - 1; index >= 0; --index) {
				if (predicate(type, coroutines[index])) {
					coroutines.splice(index, 1);
				}
			}
		}
	}
	//#endregion

	public startCo(iteratorOrCoroutine: IterableIterator<any> | Coroutine, owner?: cc.Component): Coroutine {
		let coroutine: Coroutine;
		if (iteratorOrCoroutine instanceof Coroutine) {
			coroutine = iteratorOrCoroutine;
		} else {
			coroutine = new Coroutine(iteratorOrCoroutine, owner);
		}
		if (!coroutine.next().done) {
			this.updateCoroutine(coroutine);
			this.addCoroutine(coroutine);
		}
		return coroutine;
	}

	public stopCo(iteratorOrCoroutine: IterableIterator<any> | Coroutine): void {
		if (iteratorOrCoroutine instanceof Coroutine) {
			this.removeCoroutineBy((_, coroutine) => coroutine === iteratorOrCoroutine);
		} else {
			this.removeCoroutineBy((_, coroutine) => coroutine.iterator === iteratorOrCoroutine);
		}
	}

	public stopAllCo(owner: cc.Component): void {
		this.removeCoroutineBy((_, coroutine) => coroutine.owner === owner);
	}

	public moveNext(iteratorOrCoroutine: IterableIterator<any> | Coroutine, owner?: cc.Component): Coroutine {
		this.stopCo(iteratorOrCoroutine);
		if (iteratorOrCoroutine instanceof Coroutine) {
			return this.startCo(iteratorOrCoroutine);
		} else {
			return this.startCo(iteratorOrCoroutine, owner);
		}
	}

	public flush(iteratorOrCoroutine: IterableIterator<any> | Coroutine, maxSteps: number = Number.MAX_VALUE): void {
		if (iteratorOrCoroutine) {
			this.stopCo(iteratorOrCoroutine);
			let hasNext = true;
			let steps = 0;
			while (hasNext && (steps < maxSteps)) {
				hasNext = !iteratorOrCoroutine.next().done;
				++steps;
			}
			if (steps >= maxSteps) {
				console.warn("Flush " + maxSteps + " steps!");
			}
		}
	}

	public late(callback: () => void, owner?: cc.Component): Coroutine {
		return this.startCo(this.doLate(callback, owner), owner);
	}
	private * doLate(callback: () => void, owner: cc.Component): IterableIterator<any> {
		if (callback) {
			yield new WaitForLateUpdate();
			callback.call(owner);
		}
	}

	public once(delay: number, callback: () => void, owner?: cc.Component): Coroutine {
		return this.startCo(this.doOnce(delay == null ? null : new WaitForSeconds(delay), callback, false, owner), owner);
	}
	public lateOnce(delay: number, callback: () => void, owner?: cc.Component): Coroutine {
		return this.startCo(this.doOnce(delay == null ? null : new WaitForSeconds(delay), callback, true, owner), owner);
	}
	public frameOnce(delay: number, callback: () => void, owner?: cc.Component): Coroutine {
		return this.startCo(this.doOnce(delay == null ? null : new WaitForFrames(delay), callback, false, owner), owner);
	}
	public lateFrameOnce(delay: number, callback: () => void, owner?: cc.Component): Coroutine {
		return this.startCo(this.doOnce(delay == null ? null : new WaitForFrames(delay), callback, true, owner), owner);
	}
	private * doOnce(delay: WaitForFrames | WaitForSeconds, callback: () => void, late: boolean, owner: cc.Component): IterableIterator<any> {
		if (callback) {
			if (late) {
				yield new WaitForLateUpdate();
			}
			yield delay;
			callback.call(owner);
		}
	}

	public loop(interval: number, loopUntil: () => boolean, owner?: cc.Component): Coroutine {
		return this.startCo(this.doLoop(interval == null ? null : new WaitForSeconds(interval), loopUntil, false, owner), owner);
	}
	public lateLoop(interval: number, loopUntil: () => boolean, owner?: cc.Component): Coroutine {
		return this.startCo(this.doLoop(interval == null ? null : new WaitForSeconds(interval), loopUntil, true, owner), owner);
	}
	public frameLoop(interval: number, loopUntil: () => boolean, owner?: cc.Component): Coroutine {
		return this.startCo(this.doLoop(interval == null ? null : new WaitForFrames(interval), loopUntil, false, owner), owner);
	}
	public lateFrameLoop(interval: number, loopUntil: () => boolean, owner?: cc.Component): Coroutine {
		return this.startCo(this.doLoop(interval == null ? null : new WaitForFrames(interval), loopUntil, true, owner), owner);
	}
	private * doLoop(interval: WaitForFrames | WaitForSeconds, loopUntil: () => boolean, late: boolean, owner?: cc.Component): IterableIterator<any> {
		if (loopUntil) {
			if (late) {
				yield new WaitForLateUpdate();
			}
			while (!loopUntil.call(owner)) {
				yield interval;
			}
		}
	}

	public wait(waitUntil: () => boolean, callback: () => void, owner?: cc.Component): Coroutine {
		return this.startCo(this.doWait(waitUntil, callback, false, owner), owner);
	}
	public lateWait(waitUntil: () => boolean, callback: () => void, owner?: cc.Component): Coroutine {
		return this.startCo(this.doWait(waitUntil, callback, true, owner), owner);
	}
	private * doWait(waitUntil: () => boolean, callback: () => void, late: boolean, owner: cc.Component): IterableIterator<any> {
		if (callback) {
			if (late) {
				yield new WaitForLateUpdate();
			}
			if (waitUntil) {
				while (!waitUntil.call(owner)) {
					yield null;
				}
			}
			callback.call(owner);
		}
	}

	public endOfLag(callback: () => void, owner?: cc.Component): Coroutine {
		return this.startCo(this.doEndOfLag(callback, owner), owner);
	}
	private * doEndOfLag(callback: () => void, owner: cc.Component): IterableIterator<any> {
		if (callback) {
			yield this.waitForEndOfLag(owner);
			callback.call(owner);
		}
	}
	public waitForEndOfLag(owner?: cc.Component): Coroutine {
		return this.startCo(this.doWaitForEndOfLag(), owner);
	}
	private readonly LAG_FRAME_COUNT_MAX = 20;
	private readonly LAG_CHECK_FRAME_COUNT = 3;
	private readonly LAG_CHECK_THRESHOLD = 20;
	private * doWaitForEndOfLag(): IterableIterator<any> {
		let maxFrame = cc.director.getTotalFrames() + this.LAG_FRAME_COUNT_MAX;
		let deltaTimeList: number[] = [];
		deltaTimeList.push(cc.director.getDeltaTime());
		yield null;
		deltaTimeList.push(cc.director.getDeltaTime());
		while (cc.director.getTotalFrames() < maxFrame) {
			yield null;
			deltaTimeList.push(cc.director.getDeltaTime());
			if (deltaTimeList.length > this.LAG_CHECK_FRAME_COUNT) {
				deltaTimeList.shift();
			}
			let length = deltaTimeList.length;
			let average = deltaTimeList.reduce((total, current) => total + current) / length;
			let variance = deltaTimeList.reduce((total, current) => total + Math.pow(current - average, 2)) / length;
			if (variance < this.LAG_CHECK_THRESHOLD) {
				break;
			}
		}
	}
}