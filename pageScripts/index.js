
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
  getOverrideText: (responseText, args) => {
    let overrideText = responseText;
    try {
      const data = JSON.parse(responseText);
      if (typeof data === 'object') {
        overrideText = responseText;
      }
    } catch (e) {
      // const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      // const returnText = await (new AsyncFunction(responseText))();
      const returnText = (new Function(responseText))(args);
      if (returnText) {
        overrideText = typeof returnText === 'object' ? JSON.stringify(returnText) : returnText;
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
  myXHR: function () {
    const modifyResponse = () => {
      const interfaceList = [];
      ajax_tools_space.ajaxDataList.forEach((item) => {
        interfaceList.push(...(item.interfaceList || []));
      });
      const [method, requestUrl] = this._openArgs;
      const queryStringParameters = ajax_tools_space.getRequestParams(requestUrl);
      const [requestPayload] = this._sendArgs;
      interfaceList.forEach(({open = true, matchType = 'normal', matchMethod, request, responseText}) => {
        const matchedMethod = !matchMethod || matchMethod === method.toUpperCase();
        if (open && matchedMethod) {
          let matched = false;
          if (matchType === 'normal' && request && this.responseURL.includes(request)) {
            matched = true;
          } else if (matchType === 'regex' && request && this.responseURL.match(ajax_tools_space.strToRegExp(request))) {
            matched = true;
          }
          if (matched && responseText) {
            const funcArgs = {
              method,
              payload: {
                queryStringParameters,
                requestPayload
              },
              originalResponse: this.responseText
            };
            const overrideText = ajax_tools_space.getOverrideText(responseText, funcArgs);
            this.responseText = overrideText;
            this.response = overrideText;
            if (ajax_tools_space.ajaxToolsSwitchOnNot200) { // 非200请求如404，改写status
              this.status = 200;
            }
            // console.info('ⓢ ►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►► ⓢ');
            console.groupCollapsed(`%c XHR匹配路径/规则：${request}`, 'background-color: #108ee9; color: white; padding: 4px');
            console.info(`%c接口路径：`, 'background-color: #ff8040; color: white;', this.responseURL);
            console.info('%c返回出参：', 'background-color: #ff5500; color: white;', JSON.parse(overrideText));
            console.groupEnd();
            // console.info('ⓔ ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣ ⓔ')
          }
        }
      });
    }

    const xhr = new ajax_tools_space.originalXHR;
    for (let attr in xhr) {
      if (attr === 'onreadystatechange') {
        xhr.onreadystatechange = (...args) => {
          // 下载成功
          if (this.readyState === this.DONE) {
            // 开启拦截
            modifyResponse();
          }
          this.onreadystatechange && this.onreadystatechange.apply(this, args);
        }
        continue;
      } else if (attr === 'onload') {
        // xhr.onload = (...args) => {
        //   // 开启拦截
        //   modifyResponse();
        //   this.onload && this.onload.apply(this, args);
        // }
        // continue;
      } else if (attr === 'open') {
        this.open = (...args) => {
          this._openArgs = args;
          xhr.open && xhr.open.apply(xhr, args);
        }
        continue;
      } else if (attr === 'send') {
        this.send = (...args) => {
          this._sendArgs = args;
          xhr.send && xhr.send.apply(xhr, args);
        }
        continue;
      }
      if (typeof xhr[attr] === 'function') {
        this[attr] = xhr[attr].bind(xhr);
      } else {
        // responseText和response不是writeable的，但拦截时需要修改它，所以修改就存储在this[`_${attr}`]上
        if (attr === 'responseText' || attr === 'response' || attr === 'status') {
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
    return ajax_tools_space.originalFetch(...args).then(async (response) => {
      let overrideText = undefined;
      const interfaceList = [];
      ajax_tools_space.ajaxDataList.forEach((item) => {
        interfaceList.push(...(item.interfaceList || []));
      });
      const {method = 'GET'} = args[1] || {};
      for (let i = 0; i < interfaceList.length; i++) {
        const {open = true, matchType = 'normal', matchMethod, request, responseText} = interfaceList[i];
        const matchedMethod = !matchMethod || matchMethod === method.toUpperCase();
        if (open && matchedMethod) {
          let matched = false;
          if (matchType === 'normal' && request && response.url.includes(request)) {
            matched = true;
          } else if (matchType === 'regex' && request && response.url.match(ajax_tools_space.strToRegExp(request))) {
            matched = true;
          }
          if (matched && responseText) {
            const queryStringParameters = ajax_tools_space.getRequestParams(response.url);
            const [_, data] = args;
            const originalResponse = await getOriginalResponse(response.body);
            const funcArgs = {
              method,
              payload: {
                queryStringParameters,
                requestPayload: data.body
              },
              originalResponse
            };
            overrideText = ajax_tools_space.getOverrideText(responseText, funcArgs);
            // console.info('ⓢ ►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►► ⓢ');
            console.groupCollapsed(`%c Fetch匹配路径/规则：${request}`, 'background-color: #108ee9; color: white; padding: 4px');
            console.info(`%c接口路径：`, 'background-color: #ff8040; color: white;', response.url);
            console.info('%c返回出参：', 'background-color: #ff5500; color: white;', JSON.parse(overrideText));
            console.groupEnd();
            // console.info('ⓔ ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣ ⓔ')
          }
        }
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
    //
    if (
      data.key === 'ajaxToolsSwitchOn'
      || data.key === 'ajaxToolsSwitchOnNot200'
    ) {
      if (ajax_tools_space.ajaxToolsSwitchOn) {
        window.XMLHttpRequest = ajax_tools_space.myXHR;
        window.fetch = ajax_tools_space.myFetch;
      } else {
        window.XMLHttpRequest = ajax_tools_space.originalXHR;
        window.fetch = ajax_tools_space.originalFetch;
      }
    }
  }

}, false);
