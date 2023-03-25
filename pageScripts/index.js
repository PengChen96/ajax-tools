
const ajax_tools_space = {
  ajaxToolsSwitchOn: true,
  ajaxToolsSwitchOnNot200: true,
  ajaxDataList: [],
  originalXHR: window.XMLHttpRequest,
  // "/^t.*$/" or "^t.*$" => new RegExp
  strToRegExp: (regStr) => {
    let regexp = '';
    const regParts = regStr.match(new RegExp('^/(.*?)/([gims]*)$'));
    if (regParts) {
      regexp = new RegExp(regParts[1], regParts[2]);
    } else {
      regexp = new RegExp(regStr);
    }
    return regexp;
  },
  getOverrideText: (responseText, args, toJson= false) => {
    let overrideText = responseText;
    try {
      JSON.parse(responseText);
    } catch (e) {
      try {
        // const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        // const returnText = await (new AsyncFunction(responseText))();
        const returnText = (new Function(responseText))(args);
        if (returnText) {
          overrideText = typeof returnText === 'object' ? JSON.stringify(returnText) : returnText;
        }
      } catch (e) {}
    }
    if (toJson) {
      try {
        overrideText = JSON.parse(overrideText);
      } catch (e) {
        overrideText = {};
      }
    }
    return overrideText;
  },
  getRequestParams: (requestUrl) => {
    if (!requestUrl) {
      return null;
    }
    const paramStr = requestUrl.split('?').pop();
    const keyValueArr = paramStr.split('&');
    let keyValueObj = {};
    keyValueArr.forEach((item) => {
      // 保证中间不会把=给忽略掉
      const itemArr = item.replace('=', '〓').split('〓');
      const itemObj = {[itemArr[0]]: itemArr[1]};
      keyValueObj = Object.assign(keyValueObj, itemObj);
    });
    return keyValueObj;
  },
  getMatchedInterface: ({thisRequestUrl = '', thisMethod = ''}) => {
    const interfaceList = [];
    ajax_tools_space.ajaxDataList.forEach((item) => {
      interfaceList.push(...(item.interfaceList || []));
    });
    // const interfaceList = ajax_tools_space.ajaxDataList.flatMap(item => item.interfaceList || []);
    return interfaceList.find(({ open = true, matchType = 'normal', matchMethod, request }) => {
      const matchedMethod = !matchMethod || matchMethod === thisMethod.toUpperCase();
      const matchedRequest = request && (matchType === 'normal' ? thisRequestUrl.includes(request) : thisRequestUrl.match(ajax_tools_space.strToRegExp(request)));
      return open && matchedMethod && matchedRequest;
    });
  },
  myXHR: function () {
    const modifyResponse = () => {
      const [method, requestUrl] = this._openArgs;
      const queryStringParameters = ajax_tools_space.getRequestParams(requestUrl);
      const [requestPayload] = this._sendArgs;
      const matchedInterface = this._matchedInterface;
      if (matchedInterface && matchedInterface.responseText) {
        const funcArgs = {
          method,
          payload: {
            queryStringParameters,
            requestPayload
          },
          originalResponse: this.responseText
        };
        const overrideText = ajax_tools_space.getOverrideText(matchedInterface.responseText, funcArgs);
        this.responseText = overrideText;
        this.response = overrideText;
        if (ajax_tools_space.ajaxToolsSwitchOnNot200 && this.status !== 200) {
          this.status = 200;
        }
        // console.info('ⓢ ►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►► ⓢ');
        console.groupCollapsed(`%c Matched XHR Path/Rule：${matchedInterface.request}`, 'background-color: #108ee9; color: white; padding: 4px');
        console.info(`%cRequest Url：`, 'background-color: #ff8040; color: white;', this.responseURL);
        console.info('%cResponse Text：', 'background-color: #ff5500; color: white;', JSON.parse(overrideText));
        console.groupEnd();
        // console.info('ⓔ ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣ ⓔ')
      }
    }

    const xhr = new ajax_tools_space.originalXHR;
    for (const attr in xhr) {
      if (attr === 'onreadystatechange') {
        xhr.onreadystatechange = (...args) => {
          // 下载成功
          if (this.readyState === this.DONE) {
            // 开启拦截
            modifyResponse();
          }
          this.onreadystatechange && this.onreadystatechange.apply(this, args);
        }
        this.onreadystatechange = null;
        continue;
      } else if (attr === 'onload') {
        // xhr.onload = (...args) => {
        //   // 开启拦截
        //   modifyResponse();
        //   this.onload && this.onload.apply(this, args);
        // }
        // this.onload = null;
        // continue;
      } else if (attr === 'open') {
        this.open = (...args) => {
          this._openArgs = args;
          const [method, requestUrl] = args;
          this._matchedInterface = ajax_tools_space.getMatchedInterface({thisRequestUrl: requestUrl, thisMethod: method});
          const matchedInterface = this._matchedInterface;
          // modify request url
          if (matchedInterface) {
            console.groupCollapsed(`%c Matched XHR Path/Rule：${matchedInterface.request}`, 'background-color: #fa8c16; color: white; padding: 4px');
            if (matchedInterface.replacementUrl) {
              args[1] = matchedInterface.replacementUrl;
              console.info(`%cReplacement Url：`, 'background-color: #ff8040; color: white;', matchedInterface.replacementUrl);
            }
            if (matchedInterface.replacementMethod) {
              args[0] = matchedInterface.replacementMethod;
              console.info(`%cReplacement Method：`, 'background-color: #ff8040; color: white;', matchedInterface.replacementMethod);
            }
            console.groupEnd();
          }
          xhr.open && xhr.open.apply(xhr, args);
        }
        continue;
      } else if (attr === 'send') {
        this.send = (...args) => {
          this._sendArgs = args;
          const matchedInterface = this._matchedInterface;
          if (matchedInterface && matchedInterface.headers) {
            const overrideHeaders = ajax_tools_space.getOverrideText(matchedInterface.headers, this._openArgs, true);
            const headers = this._headerArgs ? Object.assign(this._headerArgs, overrideHeaders) : overrideHeaders;
            Object.keys(headers).forEach((key) => {
              xhr.setRequestHeader && xhr.setRequestHeader.apply(xhr, [key, headers[key]]);
            })
          }
          xhr.send && xhr.send.apply(xhr, args);
        }
        continue;
      } else if (attr === 'setRequestHeader') {
        this.setRequestHeader = (...args) => {
          this._headerArgs = this._headerArgs ? Object.assign(this._headerArgs, {[args[0]]: args[1]}) : {[args[0]]: args[1]};
          const matchedInterface = this._matchedInterface;
          if (!(matchedInterface && matchedInterface.headers)) { // 没有要拦截修改或添加的header
            xhr.setRequestHeader && xhr.setRequestHeader.apply(xhr, args);
          }
        }
        continue;
      }
      if (typeof xhr[attr] === 'function') {
        this[attr] = xhr[attr].bind(xhr);
      } else {
        // responseText和response不是writeable的，但拦截时需要修改它，所以修改就存储在this[`_${attr}`]上
        if (['responseText', 'response', 'status'].includes(attr)) {
          Object.defineProperty(this, attr, {
            get: () => this[`_${attr}`] == undefined ? xhr[attr] : this[`_${attr}`],
            set: (val) => this[`_${attr}`] = val,
            enumerable: true
          });
        } else {
          Object.defineProperty(this, attr, {
            get: () => xhr[attr],
            set: (val) => xhr[attr] = val,
            enumerable: true
          });
        }
      }
    }
  },
  originalFetch: window.fetch.bind(window),
  myFetch: function (...args) {
    const getOriginalResponse = async (stream) => {
      let text = '';
      const decoder = new TextDecoder('utf-8');
      const reader = stream.getReader();
      const processData = (result) => {
        if (result.done) {
          return text;
        }
        const value = result.value; // Uint8Array
        text += decoder.decode(value, {stream: true});
        // 读取下一个文件片段，重复处理步骤
        return reader.read().then(processData);
      };
      return await reader.read().then(processData);
    }
    const [requestUrl, data] = args;
    const matchedInterface = ajax_tools_space.getMatchedInterface({thisRequestUrl: requestUrl, thisMethod: data && data.method});
    if (matchedInterface && matchedInterface.headers && args && args[1]) {
      const overrideHeaders = ajax_tools_space.getOverrideText(matchedInterface.headers, data, true);
      args[1].headers = Object.assign(args[1].headers, overrideHeaders);
      // args[0] = requestUrl.replace('api.', '');
    }
    return ajax_tools_space.originalFetch(...args).then(async (response) => {
      let overrideText = undefined;
      if (matchedInterface && matchedInterface.responseText) {
        const queryStringParameters = ajax_tools_space.getRequestParams(requestUrl);
        const originalResponse = await getOriginalResponse(response.body);
        const funcArgs = {
          method: data.method,
          payload: {
            queryStringParameters,
            requestPayload: data.body
          },
          originalResponse
        };
        overrideText = ajax_tools_space.getOverrideText(matchedInterface.responseText, funcArgs);
        // console.info('ⓢ ►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►► ⓢ');
        console.groupCollapsed(`%c Matched Fetch Path/Rule：${matchedInterface.request}`, 'background-color: #108ee9; color: white; padding: 4px');
        console.info(`%cRequest Url：`, 'background-color: #ff8040; color: white;', response.url);
        console.info('%cResponse Text：', 'background-color: #ff5500; color: white;', JSON.parse(overrideText));
        console.groupEnd();
        // console.info('ⓔ ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣ ⓔ')
      }
      if (overrideText !== undefined) {
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(overrideText));
            controller.close();
          }
        });
        const newResponse = new Response(stream, {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        });
        const responseProxy = new Proxy(newResponse, {
          get: function (target, name) {
            switch (name) {
              case 'body':
              case 'bodyUsed':
              case 'ok':
              case 'redirected':
              case 'type':
              case 'url':
                return response[name];
            }
            return target[name];
          }
        });
        for (let key in responseProxy) {
          if (typeof responseProxy[key] === 'function') {
            responseProxy[key] = responseProxy[key].bind(newResponse);
          }
        }
        return responseProxy;
      }
      return response;
    })
  }
}

window.addEventListener("message", function (event) {
  const data = event.data;
  if (data.type === 'ajaxTools' && data.to === 'pageScript') {
    console.log('【pageScripts/index.js】', data);
    ajax_tools_space[data.key] = data.value;
  }
  if (ajax_tools_space.ajaxToolsSwitchOn) {
    window.XMLHttpRequest = ajax_tools_space.myXHR;
    window.fetch = ajax_tools_space.myFetch;
  } else {
    window.XMLHttpRequest = ajax_tools_space.originalXHR;
    window.fetch = ajax_tools_space.originalFetch;
  }

}, false);
