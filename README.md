### tag-0.0.5

阅读了src/binding的代码和测试用例，我就说下我的阅读收获，binding这个类里面最重要的方法是update, 
update里面的逻辑分3块， 第一块更新binding上面的值，
第二更新directive上面的值
第三块更新subs上面的值， subs应该就是compute计算属性的依赖。
update的更新操作会进入一个异步队列batcher批量处理，所以在阅读这之前，可以阅读一下，batcher.js, 可能我自己现在也是一知半解，
如果你对其中的代码有疑惑的，强烈建议你可以看测试用例， 帮助你理解，发现我理解有误，还望指出。

### 阅读指南

1. 克隆该项目

2. 切换到这个tag

3. 安装依赖```yarn install```

4. 运行单元测试```npm run unit```
