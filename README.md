# ajax-tools

一个修改ajax请求返回结果的chrome插件。
**主要功能：** 
[x] 支持XMLHttpRequest、fetch
[x] 支持正则表达式匹配
[x] 支持返回结果Json、JavaScript方式

## 安装


## 使用


### 通过JS编辑返回结果
代码是通过`new Function(responseText)`生成函数然后执行，所以JS方式返回结果就是return的值。
示例：
```js
const data = [];
for (let i = 0; i < 10; i++) {
  data.push({ id: i });
}
return {
  data
}
```
**支持[mock.js]('https://github.com/nuysoft/Mock/wiki/Getting-Started')生成数据**
示例：
```js
const data = Mock.mock({
    // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
    'list|1-10': [{
        // 属性 id 是一个自增数，起始值为 1，每次增 1
        'id|+1': 1
    }]
});
return {
  data
}
```

