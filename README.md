
English | [简体中文](./README-zh.md)

<img src="./icons/ajax-tools.png" width="300">  

[![](https://img.shields.io/chrome-web-store/v/kphegobalneikdjnboeiheiklpbbhncm.svg?logo=Google%20Chrome&logoColor=white&color=blue&style=flat-square)](https://chrome.google.com/webstore/detail/ajax-interceptor-tools/kphegobalneikdjnboeiheiklpbbhncm)
[![](https://img.shields.io/chrome-web-store/users/kphegobalneikdjnboeiheiklpbbhncm.svg?logo=Google%20Chrome&logoColor=white&color=blue&style=flat-square)](https://chrome.google.com/webstore/detail/ajax-interceptor-tools/kphegobalneikdjnboeiheiklpbbhncm)   
An extension plugin for Chrome that modifies the response of AJAX requests. 

**Main features:**   
- [x] Intercept and modify the response of XMLHttpRequest and fetch requests, including 404 status requests.
- [x] Match requests based on regular expressions and HTTP request methods.
- [x] Edit response results in JSON or JavaScript format, with support for mock.js syntax.
- [x] Easily create mock scenarios in JavaScript programming by accessing original request information from the arguments parameter.
- [x] New U-Network panel in DevTools for quickly intercepting requests and modifying response results.
- [x] Support change the request URL, request headers and body.
- [x] Support importing/exporting rule configurations.
- [x] Support adjusting the order of groups and rules.

## Install
https://chrome.google.com/webstore/detail/ajax-interceptor-tools/kphegobalneikdjnboeiheiklpbbhncm  

## Usage
<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a88c304eadc54915bd7a75ea2fe3ee86~tplv-k3u1fbpfcp-watermark.image?">
<!-- <img src="https://user-images.githubusercontent.com/16712630/224017778-c52aaa26-95ac-47b7-b653-c4c1a1975e99.png"> -->

Video: [https://www.youtube.com/watch?v=HPtQO0Fyb7I](https://www.youtube.com/watch?v=HPtQO0Fyb7I)

### Modify Response Results
In the Response editor, you have the following options:  
1. Edit the response results using JSON/JavaScript format.   
2. Forward the original response results if the Response editor is cleared.  
<img width="500" src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4912b1318dbc4266a8a0781567ed0676~tplv-k3u1fbpfcp-watermark.image?"/>

#### 1. Edit Response Results in JSON Format
Example:
```
{
  "status": 200,
  "response": "OK"
}

```

#### 2. Edit Response Results in JavaScript Format
When using the JavaScript approach to edit response results, you can generate and execute a function using `new Function(responseText)`, and the response results will be the return value of the function.

##### 2.1. Simple JavaScript Snippet

Example：
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
##### 2.2. Generate Random Data using [mock.js](https://github.com/nuysoft/Mock/wiki/Getting-Started)  
Example：
```js
const data = Mock.mock({
    'list|1-10': [{
        'id|+1': 1
    }]
});
return {
  "status": 200,
  "response": data
}
```
This will generate data similar to the following:
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

##### 2.3. Create Scenarios by Accessing Original Data from arguments
<img width="800" src="https://user-images.githubusercontent.com/16712630/224018668-be15df22-17f8-419b-83cb-99e553972589.png">   

Example： 
```js
let { method, payload, originalResponse } = arguments[0];
if (method === 'get') {
  // do something
}
if (payload) { // { queryStringParameters，requestPayload }
  // do something
}
return {
  "status": 200,
  "response": originalResponse
};
```

### Modify Request  
In the Request panel, you can modify the request URL, method, headers, and payload.  
<img width="500" src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6ecb0b5fa7f240198940ae6274ffba93~tplv-k3u1fbpfcp-watermark.image?" />
#### 1. Modify Request URL and Method
In the example below, any matched `/auth/login` request path will be replaced with `/auth/login2`, and the request method will be changed to POST. You can open the DevTools and check the modified request in the Network panel.  
<img width="500" src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/03960d6f0fb245a8b3c02357857f8322~tplv-k3u1fbpfcp-watermark.image?" />  

#### 2. Modify Request Headers
In the example below, the `Content-Type` header in the request will be replaced with `application/json`.
<img width="500" src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/63750565f4b04d38b1f3bdb5b1b75bdd~tplv-k3u1fbpfcp-watermark.image?" />  

#### 3. Modify Request Payload
In the example below, `test: test123` will be added to the request payload. You can open the DevTools and check the modified request body in the Network panel.  
<img width="500" src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fd3322e0367b44b799c3a4ad745eb6e8~tplv-k3u1fbpfcp-watermark.image?" />  

### Quickly Add Requests for Modification
![QuicklyAddRequestsForModification.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3cc16f06f1224b9ebf9acabd6f8a01ff~tplv-k3u1fbpfcp-watermark.image?)

### Support Import/Export of Rule Configurations
![SupportImportExportOfRuleConfigurations.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d4247d03568a4f5bba0ef5c3c014a0e5~tplv-k3u1fbpfcp-watermark.image?)

## License
MIT License.
