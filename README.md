
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
<img width="500" src="https://user-images.githubusercontent.com/16712630/224018668-be15df22-17f8-419b-83cb-99e553972589.png" />   

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

### Support blocking or modifying network requests using specified declarative rules through `chrome.declarativeNetRequest`
<img width="500" src="./assets/DeclareNetRequestHtml.png" />  

#### 1. Blocking Request Rule Example：
The following rule will block all script requests coming from the domain 'react.docschina.org' and containing the 'main' substring in the URL.  
```js
[
  {
    "id" : 1,
    "priority": 1,
    "action" : { "type" : "block" },
    "condition" : {
      "urlFilter" : "main",
      "domains" : ["react.docschina.org"],
      "resourceTypes" : ["script"]
    }
  }
]
```
#### 2. Redirect Request Rule Example：
The following rule will redirect all script requests coming from the domain 'react.docschina.org' and containing the 'main' substring in the URL to 'new.react.docschina.org'.  
```js
[
  {
    "id": 1,
    "priority": 1,
    "action": {
      "type": "redirect",
      "redirect": {
        "transform": {
          "host": "new.react.docschina.org",
          "scheme": "https"
        }
      }
    },
    "condition": {
      "urlFilter": "main",
      "domains" : ["react.docschina.org"],
      "resourceTypes": ["script"]
    }
  }
]
```
#### 3. Complete Configuration
For more details, please refer to the documentation.
[declarativeNetRequest Documentation](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#build-rules)
<details>
  <summary><b>Complete Configuration</b> (click to show)</summary>

```js
[
  {
    // 唯一标识规则的 id。必填项，应为 >= 1
    "id": 1,
    // 规则优先级。默认值为 1。指定时，应为 >= 1
    "priority": 1,
    // 匹配此规则时要执行的操作
    "action": {
      // 要执行的操作的类型。 block、redirect、allow、upgradeScheme、modifyHeaders、allowAllRequests
      "type": "redirect",
      // 描述应如何执行重定向。仅对重定向规则有效。
      "redirect": {
        // 重定向网址。不允许重定向到 JavaScript 网址。
        "url": "",
        // 要执行的 URL 转换。
        "transform": {
          // 请求的新方案。允许的值是“http”，“https”，“ftp”和“chrome扩展名”。
          "scheme": "https",
          // 请求的新主机。
          "host": "new.react.docschina.org",
          // 请求的新路径。如果为空，则清除现有路径。
          "path": "",
          // 请求的新端口。如果为空，则清除现有端口。
          "port": "",
          // 请求的新片段。应为空，在这种情况下，将清除现有片段;或应以“#”开头。
          "fragment": "",
          // 请求的新查询。应为空，在这种情况下，将清除现有查询;或者应该以“？”开头。
          "query": "",
          // 添加、删除或替换查询键值对。
          "queryTransform": {
            // 要添加或替换的查询键值对的列表
            "addOrReplaceParams": [
              {
                "key": "",
                "value": "",
                // 如果为 true，则仅当查询键已存在时，才会替换查询键。否则，如果缺少密钥，也会添加密钥。默认为 false。
                "replaceOnly": false,
              }
            ],
            // 要删除的查询键的列表。
            "removeParams": []
          },
          // 请求的新用户名
          "username": "",
          // 请求的新密码。
          "password": "",
        },
        // 相对于扩展目录的路径。应以“/”开头。
        "extensionPath": "",
        // 对于指定了 regexFilter 的规则，使用此替换模式。在 URL 中，regexFilter 的第一个匹配项将被替换为此模式。在 regexSubstitution 内部，可以使用反斜杠转义的数字（\1 到 \9）来插入相应的捕获组。\0 指的是整个匹配文本。
        "regexSubstitution": ""
      },
      // 要为请求修改的请求标头。仅当 RuleActionType 为 “modifyHeaders” 时才有效。
      "requestHeaders": [
        {
          // 要修改的标头的名称。
          "header": "",
          // 要对标头执行的操作。 append、set、remove
          "operation": [""],
          // 标头的新值。必须为 和 set 操作 append 指定。
          "value": "",
        } 
      ],
      // 要为请求修改的响应标头。仅当 RuleActionType 为 “modifyHeaders” 时才有效。
      "responseHeaders": [
        {
          // 要修改的标头的名称。
          "header": "",
          // 要对标头执行的操作。 append、set、remove
          "operation": [""],
          // 标头的新值。必须为 和 set 操作 append 指定。
          "value": "",
        } 
      ],
    },
    // 触发此规则的条件
    "condition": {
      // 与网络请求 URL 匹配的模式
      "urlFilter": "main",
      // 与网络请求 URL 匹配的正则表达式。这遵循 RE2 语法。
      "regexFilter": "", // 注： 只能指定 or regexFilter 中的一个 urlFilter 。
      // 该规则将仅匹配源自 列表 domains 的网络请求。 自 Chrome 101 起已弃用，改用 initiatorDomains
      "domains" : ["react.docschina.org"],
      // 【new】Chrome 101+ 该规则将仅匹配源自 列表 initiatorDomains 的网络请求。如果省略该列表，则该规则将应用于来自所有域的请求。不允许使用空列表。
      "initiatorDomains" : ["react.docschina.org"],
      // 该规则将不匹配源自列表 excludedDomains 的网络请求。 自 Chrome 101 起已弃用，改用 excludedInitiatorDomains
      "excludedDomains" : [""],
      // 【new】Chrome 101+ 该规则将不匹配源自 列表 excludedInitiatorDomains 的网络请求。如果列表为空或省略，则不排除任何域。这优先于 initiatorDomains 。
      "excludedInitiatorDomains": [""],
      // 规则可以匹配的资源类型列表。不允许使用空列表。
      "resourceTypes": ["script"],
      // 指定网络请求是其来源域的第一方还是第三方。如果省略，则接受所有请求。 firstParty、thirdParty
      "domainType": "",
      // 规则不匹配的请求方法列表。仅应指定 和 excludedRequestMethods 中的一个 requestMethods 。如果未指定它们，则匹配所有请求方法。
      "excludedRequestMethods": "", // "connect"、"delete"、"get"、"head"、"options"、"patch" 、"post"、"put"、"other"
      // 规则不匹配的资源类型列表。仅应指定 和 excludedResourceTypes 中的一个 resourceTypes 。如果未指定它们，则将阻止除“main_frame”之外的所有资源类型。
      "excludedResourceTypes": "", // "main_frame"、"sub_frame"、"stylesheet"、"script"、"image"、"font"、"object"、"xmlhttprequest"、"ping"、"csp_report"、"media"、"websocket"、"webtransport"、"webbundle"、"other"
      // 规则应匹配 tabs.Tab.id 的列表。匹配不是源自选项卡的请求的 tabs.TAB_ID_NONE ID。不允许使用空列表。仅会话范围的规则受支持。      
      "tabIds": [],
      // 规则不应匹配 tabs.Tab.id 的列表。的 tabs.TAB_ID_NONE ID 排除不是源自选项卡的请求。仅会话范围的规则受支持。  
      "excludedTabIds": [],
      // urlFilter 或 regexFilter （以指定者为准）是否区分大小写。默认值为 true。
      "isUrlFilterCaseSensitive": true,
      // 仅当域与 列表中的 requestDomains 网络请求匹配时，该规则才会匹配网络请求。如果省略该列表，则该规则将应用于来自所有域的请求。不允许使用空列表。
      "requestDomains": [],
      // 规则可以匹配的 HTTP 请求方法列表。不允许使用空列表。
      "requestMethods": [], // 注意：指定 requestMethods 规则条件也会排除非 HTTP（s） 请求，而指定 excludedRequestMethods 则不会。
    }
  }
]
```
</details>

### Quickly Add Requests for Modification
![QuicklyAddRequestsForModification.gif](./assets/QuicklyAddRequestsForModification.gif)

### Support Import/Export of Rule Configurations
![SupportImportExportOfRuleConfigurations.gif](./assets/SupportImportExportOfRuleConfigurations.gif)

### Document Picture In Picture
![PictureInPicture](./assets/PictureInPicture.png)

## License
MIT License.
