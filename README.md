# CoroutineManager: 利用js的generator做的协程管理器

## 新建一个协程
调用startCo可以新建一个协程，并返回一个Coroutine对象。
```
function* testCoroutine(): IterableIterator<any> {
	console.log("Coroutine start.");
	yield null;
	console.log("Next frame.");
	yield new WaitForFrames(2);
	console.log("2 frames later.");
	yield new WaitForSeconds(0.5);
	console.log("0.5 seconds later.");
}
let coroutine = CoroutineManager.instance.startCo(testCoroutine());
```
startCo可以传入一个已终止的Coroutine或IterableIterator<any>对象，继续执行协程。如果该协程正在进行中，则抛出错误：“Coroutine is already running!”。  
```
CoroutineManager.instance.startCo(iteratorOrCoroutine);
```
startCo传入IterableIterator<any>对象时，还可以传入一个cc.Component实例作为owner，协程会随着owner的销毁而自动终止。
```
CoroutineManager.instance.startCo(iterator, owner);
```

## 终止一个协程
调用stopCo传入一个Coroutine或IterableIterator<any>对象可以终止尚未执行完毕的协程，如果协程已经执行完毕，则不做任何处理。
```
    CoroutineManager.instance.stopCo(iteratorOrCoroutine);
```
也可以主动终止指定owner对应的所有协程。
```
    CoroutineManager.instance.stopAllCo(owner);
```

## 单步执行协程
调用moveNext传入一个Coroutine或IterableIterator<any>对象可以单步执行协程，协程将从当前yield执行到下一个yield，并保持执行状态或终止状态。
```
    CoroutineManager.instance.moveNext(iteratorOrCoroutine);
```

## 强制协程执行完毕
调用flush传入一个Coroutine或IterableIterator<any>对象可以强制协程执行完毕，协程将从当前yield执行到最终状态并终止。
```
    CoroutineManager.instance.flush(iteratorOrCoroutine);
```
由于协程有可能永远不会运行到结束状态，为了避免死循环，flush还可以传入一个maxSteps，用以限制执行步数，协程将从当前yield执行指定步数或者执行到最终状态并终止。
```
    CoroutineManager.instance.flush(iteratorOrCoroutine, 20);
```

## 判断协程是否已终止
调用isRunning传入一个Coroutine或IterableIterator<any>对象可以判断该协程是否正在进行中。
```
    CoroutineManager.instance.isRunning(iteratorOrCoroutine);
```

## 简化协程的使用
CoroutineManager提供了一些简便的协程使用接口，在需求符合的前提下，调用以下接口，创建协程可以**不需要另写一个generator函数**。

* 在下一个lateUpdate执行逻辑
```
CoroutineManager.instance.late(callback: () => void, owner?: cc.Component): Coroutine;
```

* 在指定秒数后执行逻辑
```
CoroutineManager.instance.once(delay: number, callback: () => void, owner?: cc.Component): Coroutine;
```

* 在指定帧数后执行逻辑
```
CoroutineManager.instance.frameOnce(delay: number, callback: () => void, owner?: cc.Component): Coroutine;
```

* 在指定条件达成后执行逻辑

　　· 在waitUntil返回true时，执行callback。
```
CoroutineManager.instance.wait(waitUntil: () => boolean, callback: () => void, owner?: cc.Component): Coroutine;
```
　　· 在waitUntil返回true时，执行callback，最早在下一个lateUpdate执行。
```
CoroutineManager.instance.lateWait(waitUntil: () => boolean, callback: () => void, owner?: cc.Component): Coroutine;
```

* 指定间隔循环逻辑

　　· 在loopUntil返回true之前，都会以interval秒为间隔执行loopUntil。
```
CoroutineManager.instance.loop(interval: number, loopUntil: () => boolean, owner?: cc.Component): Coroutine;
```
　　· 在loopUntil返回true之前，都会以interval秒为间隔执行loopUntil，最早在下一个lateUpdate执行。
```
CoroutineManager.instance.lateLoop(interval: number, loopUntil: () => boolean, owner?: cc.Component): Coroutine;
```
　　· 在loopUntil返回true之前，都会以interval帧为间隔执行loopUntil。
```
CoroutineManager.instance.frameLoop(interval: number, loopUntil: () => boolean, owner?: cc.Component): Coroutine;
```
　　· 在loopUntil返回true之前，都会以interval帧为间隔执行loopUntil，最早在下一个lateUpdate执行。
```
CoroutineManager.instance.lateFrameLoop(interval: number, loopUntil: () => boolean, owner?: cc.Component): Coroutine;
```

* 在帧率稳定后执行逻辑  
帧率稳定的定义：连续3帧的帧间隔（秒）的方差在0.00001（方差范围）内，或从当前开始超过20帧。（3、0.00001、20可以通过改源码调整）

　　· 在帧率稳定后执行callback
```
CoroutineManager.instance.endOfLag(callback: () => void, owner?: cc.Component): Coroutine;
```
　　· 获得一个立即开始且在帧率稳定后结束的协程对象
```
CoroutineManager.instance.waitForEndOfLag(owner?: cc.Component): Coroutine;
```
　　　该协程对象可用于在另一个协程中yield。
```
function* testCoroutine(): IterableIterator<any> {
	console.log("Instantiate a large prefab.");
	yield CoroutineManager.instance.waitForEndOfLag();
	console.log("Frame rate is stable.");
}
```