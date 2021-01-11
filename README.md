# TypeScript
TS开发过程中的一些积累

## Curve: 基于给定的关键帧，通过埃尔米特插值计算任意时间对应的值。  
主要用于在Laya、Cocos Creator、Egret等引擎中自定义缓动过程，可以通过Unity或其他曲线编辑工具里调好曲线，将关键帧的值记录下来，然后在编写代码时使用。  
另外，Curve类声明了几个常见的曲线作为静态变量：CONST、LINEAR、EASE_IN、EASE_OUT、SWING、EASE_PINGPONG、EASE_PARABOLA。  
Curve类的ease函数可以让曲线在上述3个引擎的缓动函数中使用，例如：  
	**Laya:**  
	`let obj = {value: 200};`  
	`let duration = 300;`  
	`Laya.Tween.to(obj, {value: 1000}, 300, Curve.EASE_OUT.layaEase);`  
	**Cocos Creator:**  
	`let obj = {value: 200};`  
	`let duration = 300;`  
	`cc.tween(obj).to(duration, {value: 1000}, {easing: Curve.EASE_OUT.ease}).start();`  
	**Egret:**  
	`let obj = {value: 200};`  
	`let duration = 300;`  
	`egret.Tween.get(obj).to({value: 1000}, duration, Curve.EASE_OUT.ease);`  
