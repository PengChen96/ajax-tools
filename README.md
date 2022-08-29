# ajax-tools

一个修改ajax请求返回结果的chrome插件。  

**主要功能：**   
- [x] 支持XMLHttpRequest、fetch  
- [x] 支持正则表达式匹配  
- [x] 支持返回结果Json、JavaScript方式  

## 安装


## 使用
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fe0e0fd0944943cdb1797151e213070c~tplv-k3u1fbpfcp-watermark.image?)  
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1cbe3740b84b46d6b21fc1f4973d6f40~tplv-k3u1fbpfcp-watermark.image?) 

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

