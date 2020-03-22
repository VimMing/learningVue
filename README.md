### tag-0.0.6

阅读了src/observer.js的代码和测试用例
 这是观察者模式里面的发布者。入口函数应该是watch和observe, 下面是它的调用顺序，可以看出它是个递归函数， watch->watch(数组)， 或者 observe -> observe（对象）

 *  watch -> (watchObject/watchArray) -> (convent & conventKey) -> observe -> watch
 *  observe->watch->(watchObject/watchArray) -> (convent & conventKey) -> observe
 1. watch函数里面分2部分， watchObject, watchArray 
 2. convent函数作用是给watch的数组或者对象，安装触发器(__emitter__)
 3. convertKey循环遍历数组或者对象，对里面的属性进行拦截， 对象是拦截set,get; 数组拦截mutate, 同时通过__emitter__发布消息（触发事件）
 4. 在上一步中，遍历的属性的值为对象或者数组，调用observe
 5. observe的主要作用是代理同时订阅(监听)，该属性发布的事件并传递事件， 同时调用watch, 重复上面的步骤


### 阅读指南

1. 克隆该项目

2. 切换到这个tag

3. 安装依赖```yarn install```

4. 运行单元测试```npm run unit```
