> tag-0.0.2

阅读了src/utils的代码和测试用例，utils.js里面主要是一些工具函数，比如get,set,isObject,unique等等函数，这个tag里面两个方法函数没有包括toFragment，parseTemplateOption，这两个方法主要看fragment.js和template-parser.js这两个文件，在阅读计划中...

src/utils里面唯一与Vue-0.1相关的函数是toConstructor函数，该函数把普通的对象转换成vue的构造函数，函数里面主要用到了vue.extend方法，这个方法在src/index下面定义的，extend里面的代码我只保留了一些关键代码便于通过单元测试，里面的主要知识点为：javascript的组合寄生继承

[组合寄生继承的一篇文章](https://tsejx.github.io/JavaScript-Guidebook/object-oriented-programming/inheritance/parasitic-combination-inheritance.html)

阅读指南
1.克隆该项目
2.切换到这个tag
3. 安装依赖```yarn install```
4. 运行单元测试```npm run unit```
