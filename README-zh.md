
[English](./README.md) | 简体中文

<img src="./icons/ajax-tools.png" width="300">  

[![](https://img.shields.io/chrome-web-store/v/kphegobalneikdjnboeiheiklpbbhncm.svg?logo=Google%20Chrome&logoColor=white&color=blue&style=flat-square)](https://chrome.google.com/webstore/detail/ajax-interceptor-tools/kphegobalneikdjnboeiheiklpbbhncm)
[![](https://img.shields.io/chrome-web-store/users/kphegobalneikdjnboeiheiklpbbhncm.svg?logo=Google%20Chrome&logoColor=white&color=blue&style=flat-square)](https://chrome.google.com/webstore/detail/ajax-interceptor-tools/kphegobalneikdjnboeiheiklpbbhncm)   
一个修改Ajax请求响应结果的Chrome扩展插件。  

**主要功能：**   
- [x] 支持拦截并修改XMLHttpRequest和fetch请求的响应结果，包括404状态的请求
- [x] 支持基于正则表达式和HTTP请求方法匹配请求
- [x] 支持以JSON或JavaScript格式编辑响应结果（支持使用Mock.js语法）
- [x] 支持在JavaScript编程中从arguments参数获取原始请求信息，轻松创建mock场景
- [x] 在DevTools中新增U-Network面板，快速实现请求拦截和响应结果修改
- [x] 支持更改请求的URL、请求头和请求体
- [x] 支持导入/导出规则配置
- [x] 支持调整分组及规则顺序


## 安装
谷歌商店：https://chrome.google.com/webstore/detail/ajax-interceptor-tools/kphegobalneikdjnboeiheiklpbbhncm  
直接下载：https://raw.githubusercontent.com/PengChen96/ajax-tools/master/kphegobalneikdjnboeiheiklpbbhncm.crx

## 使用
<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a88c304eadc54915bd7a75ea2fe3ee86~tplv-k3u1fbpfcp-watermark.image?">
<!-- <img src="https://user-images.githubusercontent.com/16712630/224017778-c52aaa26-95ac-47b7-b653-c4c1a1975e99.png"> -->

视频: [https://www.youtube.com/watch?v=HPtQO0Fyb7I](https://www.youtube.com/watch?v=HPtQO0Fyb7I)

### 一、修改Response响应结果
在Response编辑器中，您可以选择：  
1、使用JSON/JavaScript格式编辑响应结果  
2、转发原始响应结果（如果清空Response编辑器，将会把原始响应结果转发给应用程序）
<img width="500" src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4912b1318dbc4266a8a0781567ed0676~tplv-k3u1fbpfcp-watermark.image?"/>

#### 1、 使用JSON格式编辑响应结果
示例：
```
{
  "status": 200,
  "response": "OK"
}

```

#### 2、 使用JavaScript格式编辑响应结果
使用JS方式编辑响应结果时，通过`new Function(responseText)`生成函数并执行，响应结果即为函数的返回值。

##### 2.1. 简单JavaScript片段

示例：
```js
const data = [];
for (let i = 0; i < 10; i++) {
  data.push({ id: i });
}
return {
  "status": 200,
  "response": data
}
```
##### 2.2. 使用 [mock.js](https://github.com/nuysoft/Mock/wiki/Getting-Started) 生成随机数据
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
  "status": 200,
  "response": data
}
```
将生成类似以下数据：
```
// ==>
{
    "list": [
        {
            "id": 1
        },
        {
            "id": 2
        },
        {
            "id": 3
        }
    ]
}
```

##### 2.3. 从arguments获取原始数据，简单编程创建场景 
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
return {
  "status": 200,
  "response": originalResponse
};
```

### 二、修改Request请求信息
在Request面板中，您可以选择修改请求URL、method、headers和payload。
<img width="500" src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6ecb0b5fa7f240198940ae6274ffba93~tplv-k3u1fbpfcp-watermark.image?" />
#### 1. 修改请求URL和method
例下图中，将会把匹配到的`/auth/login`请求路径替换为`/auth/login2`，并把请求方法改为POST，您可以打开devtools在Network面板中看到替换后的请求。  
<img width="500" src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/03960d6f0fb245a8b3c02357857f8322~tplv-k3u1fbpfcp-watermark.image?" />  

#### 2. 修改请求headers
例下图中，将会把请求headers中的`Content-Type`替换为`application/json`。
<img width="500" src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/63750565f4b04d38b1f3bdb5b1b75bdd~tplv-k3u1fbpfcp-watermark.image?" />  

#### 3. 修改请求payload
例下图中，将会在入参中新增`test: test123`，您可以打开devtools在Network面板中看到请求体的修改。  
<img width="500" src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fd3322e0367b44b799c3a4ad745eb6e8~tplv-k3u1fbpfcp-watermark.image?" />  

### 三、快速添加请求进行修改
![快速添加请求进行修改.gif](./assets/QuicklyAddRequestsForModification.gif)

### 四、支持导入/导出规则配置
![导入导出规则配置.gif](./assets/SupportImportExportOfRuleConfigurations.gif)


## License
MIT License.
