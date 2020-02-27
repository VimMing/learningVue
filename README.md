### tag-0.0.3

阅读了src/text-parser的代码和测试用例，text-parser.js里面最主要的方法为parseAttr, parseAttr主要用于解析dom节点上的属性， 比如class="a {{b}} c"解析为 "a "+(b)+" c",具体可以看测试用例，[测试用例链接](https://github.com/VimMing/learningVue/blob/master/test/unit/text-parser.test.js#L54)

### 阅读指南

1. 克隆该项目

2. 切换到这个tag

3. 安装依赖```yarn install```

4. 运行单元测试```npm run unit```
