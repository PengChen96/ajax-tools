
[English](./README.md) | 简体中文

<img src="./icons/ajax-tools.png" width="300">  

[![](https://img.shields.io/chrome-web-store/v/kphegobalneikdjnboeiheiklpbbhncm.svg?logo=Google%20Chrome&logoColor=white&color=blue&style=flat-square)](https://chrome.google.com/webstore/detail/ajax-interceptor-tools/kphegobalneikdjnboeiheiklpbbhncm)   
一个修改Ajax请求响应结果的Chrome扩展插件。  

**主要功能：**   
- [x] 支持拦截并修改XMLHttpRequest和fetch请求的响应结果，包括404状态的请求
- [x] 支持基于正则表达式和HTTP请求方法匹配请求
- [x] 支持以JSON或JavaScript格式编辑响应结果（支持使用Mock.js语法）
- [x] 支持在JavaScript编程中从arguments参数获取原始请求信息，轻松创建mock场景
- [x] 在DevTools中新增U-Network面板，快速实现请求拦截和响应结果修改【0.0.4版本新增】

## 安装
谷歌商店：https://chrome.google.com/webstore/detail/ajax-interceptor-tools/kphegobalneikdjnboeiheiklpbbhncm  
直接下载：https://raw.githubusercontent.com/PengChen96/ajax-tools/master/kphegobalneikdjnboeiheiklpbbhncm.crx

## 使用
<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a88c304eadc54915bd7a75ea2fe3ee86~tplv-k3u1fbpfcp-watermark.image?">
<!-- <img src="https://user-images.githubusercontent.com/16712630/224017778-c52aaa26-95ac-47b7-b653-c4c1a1975e99.png"> -->

视频: [https://www.youtube.com/watch?v=HPtQO0Fyb7I](https://www.youtube.com/watch?v=HPtQO0Fyb7I)

### 使用JS方式编辑返回响应结果
使用JS方式编辑响应结果时，通过`new Function(responseText)`生成函数并执行，响应结果即为函数的返回值。

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
**支持 [mock.js](https://github.com/nuysoft/Mock/wiki/Getting-Started) 生成数据**
<img width="800" src="https://user-images.githubusercontent.com/16712630/224018087-70b5433e-3fbb-46a5-ac8f-9c69b0ed7496.png">

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

**使用arguments获取原始请求信息，并通过简单编程创建mock场景**
<img width="800" src="https://user-images.githubusercontent.com/16712630/224018668-be15df22-17f8-419b-83cb-99e553972589.png">  
示例：
```js
let { method, payload, originalResponse } = arguments[0];
if (method === 'get') { // 请求方式
  // do something
}
if (payload) { // 入参 { queryStringParameters，requestPayload }
  // do something
}
return originalResponse;
```

## License
MIT License.
