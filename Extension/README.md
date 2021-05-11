## ArrayExtension
扩展Array类，由于不希望被遍历到，所以做成了静态函数。

#### Array.includes
是否包含元素。这个是为了兼容es5没有includes实例函数，才加的。
```
includes<T>(arrayLike: ArrayLike<T>, searchElement: T, fromIndex?: number): boolean;
```
#### Array.contains
是否包含符合指定条件的元素。
```
contains<T>(arrayLike: ArrayLike<T>, predicate: (value: T, index: number, obj: ArrayLike<T>) => boolean, thisArg?: any): boolean;
```
#### Array.indexOf/lastIndexOf
获取元素索引，从前往后找/从后往前找。对应同名实例函数，为了整齐才加的。
```
indexOf<T>(arrayLike: ArrayLike<T>, searchElement: T, fromIndex?: number): number;
lastIndexOf<T>(arrayLike: ArrayLike<T>, searchElement: T, fromIndex?: number): number;
```
#### Array.find/findLast
获取符合指定条件的元素，从前往后找/从后往前找。
```
find<T>(arrayLike: ArrayLike<T>, predicate: (value: T, index: number, obj: ArrayLike<T>) => boolean, thisArg?: any): T | undefined;
findLast<T>(arrayLike: ArrayLike<T>, predicate: (value: T, index: number, obj: ArrayLike<T>) => boolean, thisArg?: any): T | undefined;
```
#### Array.findIndex/findLastIndex
获取符合指定条件的索引，从前往后找/从后往前找。findIndex对应同名实例函数，为了整齐才加的。
```
findIndex<T>(arrayLike: ArrayLike<T>, predicate: (value: T, index: number, obj: ArrayLike<T>) => boolean, thisArg?: any): number;
findLastIndex<T>(arrayLike: ArrayLike<T>, predicate: (value: T, index: number, obj: ArrayLike<T>) => boolean, thisArg?: any): number;
```


## DateExtension

#### Date.prototype.toCustomString
扩展Date类，C#的DateTime.ToString的简化版本。
```
toCustomString(this: Date, formatStr: string): string;
```
```typescript
// example:
new Date().toCustomString("yyyy-MM-dd HH:mm:ss.fff");   // 2021-01-26 21:04:58.858
new Date().toCustomString("yyyy-MM-dd HH:mm:ss.ms");   // 2021-01-26 21:04:58.858
new Date().toCustomString("yy-M-d H:m:s.f");    // 21-1-26 21:4:58.8
```


## MathExtension
扩展Math类，新增一些计算函数。

#### Math.randomRangeFloat
返回[min, max)区间内的随机小数。
```
randomRangeFloat(min: number, max:number): number;
```
#### Math.randomRangeInt
如果min是个整数，返回[min, max)区间内的随机整数，如果min是个小数，则返回的随机数与min的差为整数。
```
randomRangeInt(min: number, max:number): number;
```
#### Math.clamp
返回[min, max]区间内最接近num的数。
```
clamp(num: number, min: number, max: number): number;
```
#### Math.average
返回numArray的平均数。
```
average(...numArray: number[]): number;
```
#### Math.variance
返回numArray的方差。
```
variance(...numArray: number[]): number;
```
#### Math.rad2deg
弧度转角度。
```
rad2deg(rad: number): number;
```
#### Math.deg2rad
角度转弧度。
```
deg2rad(deg: number): number;
```


## ObjectExtension
对Object的一些简便操作

#### Object.deepcopy
深拷贝。支持拷贝循环引用，支持拷贝Object、Array、Map和Set，但不支持拷贝弱引用。
```
deepcopy<T extends Object>(obj: T): T;
```

#### Object.diff
对比两个对象的不同之处，返回相同结构的Object，每个key对应的value，新增字段为1，修改字段为0，删除字段为-1。
```
interface Diff {
    [key: string]: number | Diff;
}
diff(obj1: Object, obj2: Object): Diff;
```
```typescript
// example:
Object.diff({key1: {key11: "key11"}, key2: {key21: "key21"}}, {key2:{key21: "key21New", key22: "key22"}});
// {key1: -1, key2: {key22: 1, key21: 0}}
```

#### Object.merge
类似Object.assign，区别在于该接口允许参数为空，其中一个为空则直接返回另一个。
```
merge<T, U>(target: T, source: U): T & U;
```

#### Object.findByPath
通过“key1.key2.key3”的形式取值。
```
findByPath(obj: Object, path: string): any;
```
```typescript
// example:
Object.findByPath({key1: ["element1", {key2: "foo"}]}, "key1.1.key2");  // "foo"
```

#### Object.trim
删除obj中值为undefined的key（最外层）。
```
trim<T extends Object>(obj: T, deletedKeys?: string[]): T;
```

#### Object.slice
提取obj中指定的若干个key生成一个新的对象。
```
slice<T extends Object, K extends keyof T>(obj: T, keys: K[]): T;
```

#### Object.pluck
提取obj中指定的若干个key生成一个value数组。
```
pluck<T extends Object, K extends keyof T>(obj: T, keys: K[]): T[K][];
```


## StringExtension

#### String.prototype.startsWith/endsWith/includes/repeat/padStart/padEnd
为了兼容es5没有这些实例函数，才加的。

#### String.prototype.replaceAll
由于JavaScript没有replaceAll，所以这里加上，实际只是将searchValue转成带g的正则表达式进行replace。
```
replaceAll(searchValue: string, replaceValue: string, multipleLine?: boolean): string;
```

#### String.prototype.format
将一些参数替换进字符串中。
```
format(this: String, ...args: any[]): string;
```
当参数有且只有一个，并且该参数是个Object时，以key作为关键字替换；  
否则，以序号作为关键字替换，并且可以附加一些规则参数：  
- {1:D2} 当第二个参数是整型数字时，用0补到2位
- {1:N2} 当第二个参数是数字时，保留2位小数
- {1:|abc} 当第二个参数是null、undefined、0或空字符串时，替换成abc
- {1:&abc} 当第二个参数不是null、undefined、0或空字符串时，追加上abc，否则为空字符串
```typescript
// example:
"{who} is {job}".format({who: "Tom", job: "boss"});  // "Tom is boss"
"{0} is {1}".format("Tom", "boss");  // "Tom is boss"
"Now is {0:D2}:{1:D2}:{2:D2}.{3:D3}".format(22, 9, 23, 3);  // "Now is 22:09:23.003"
"π is {0:N7}".format(Math.PI);  // "π is 3.1415927"
"{0} is looking for {1:|his} photo".format("Tom", "john's");  // "Tom is looking for john's photo"
"{0} is looking for {1:|his} photo".format("Tom", null);  // "Tom is looking for his photo"
"{1:& and }{0} is running".format("Tom", "john");  // "john and Tom is running"
"{1:& and }{0} is running".format("Tom", null);  // "Tom is running"
```

#### String.formatParamFunc
暴露这个函数是为了扩展format的规则。
```
formatParamFunc(obj: any, param: string): string;
```
```typescript
// example:
let formatParamFunc = String.formatParamFunc;
String.formatParamFunc = function (arg, param) {
    if (param === "U") {
        return (arg + "").toUpperCase();
    }
    return formatParamFunc.call(this, arg, param);
}
```


## NumberExtension

#### Number.prototype.toFloated
Number类自带的只有toFixed，但toFixed遇到整数也会强制保留小数，所以扩展了一个不会强制保留小数的函数。
```
toFloated(fractionDigits?: number): string;
```
```typescript
// example:
(10.1234).toFloated(2);  //"10.12"
(10.1).toFloated(2);  //"10.1"
(10).toFloated(2);  //"10"
```


## FunctionExtension

#### Function.prototype.tailBind
Function自带的bind，固定参数只能放在最前面，于是这里加一个能把固定参数放最后面的接口。
```
tailBind(this: Function, thisArg: any, ...argArray: any[]): any;
```
```typescript
// example:
function test(...args: any[]) {
    console.error(...args);
}
test.tailBind(null, 1, 2)(3);   // 3 1 2
```

#### Function.prototype.combineAfter/combineBefore
类似C#委托相加的功能，将另一个function与当前function合在一起形成一个新的function。  
两个function用的caller都是thisArg，如果thisArg为空，则使用最终调用时的实际caller。  
新function的返回值为当前function的返回值。
```
combineAfter(this: Function, thisArg: any, after: Function): any;
combineBefore(this: Function, thisArg: any, before: Function): any;
```
```typescript
// example:
function func(...args: any[]) {
    console.error("func:", ...args);
    return true;
}
function newFunc(...args: any[]) {
    console.error("newFunc:", ...args);
    return false;
}
console.error("return: ", func.combineAfter(null, newFunc)(1, 2, 3));
// func: 1 2 3
// newFunc: 1 2 3
// return:  true
console.error("return: ", func.combineBefore(null, newFunc)(1, 2, 3));
// newFunc: 1 2 3
// func: 1 2 3
// return:  true
```


## JSONExtension

#### JSON.parseBy
将JSON.parse和Object.setPrototypeOf合在一起形成的接口。
```
parseBy<T>(text: string, proto: T, reviver?: (key: any, value: any) => any): T;
```