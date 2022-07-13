
const ajax_tools_space = {
  ajaxToolsSwitchOn: true,
  ajaxToolsSwitchOnNot200: true,
  ajaxDataList: [],
  originalXHR: window.XMLHttpRequest,
  myXHR: function () {
    const modifyResponse = () => {
      const interfaceList = [];
      ajax_tools_space.ajaxDataList.forEach((item) => {
        interfaceList.push(...(item.interfaceList || []));
      });
      interfaceList.forEach(({open = true, request, responseText}) => {
        if (open) {
          let matched = false;
          if (request && this.responseURL.includes(request)) {
            matched = true;
          }
          if (matched && responseText) {
            this.responseText = responseText;
            this.response = responseText;
            if (ajax_tools_space.ajaxToolsSwitchOnNot200) { // 非200请求如404，改写status
              this.status = 200;
            }
            // console.info('ⓢ ►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►► ⓢ');
            console.groupCollapsed(`%c XHR匹配路径/规则：${request}`, 'background-color: #108ee9; color: white; padding: 4px');
            console.info(`%c接口路径：`, 'background-color: #ff8040; color: white;', this.responseURL);
            console.info('%c返回出参：', 'background-color: #ff5500; color: white;', JSON.parse(responseText));
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
        //   // 请求成功
        //   // if (ajax_interceptor_qoweifjqon.settings.ajaxInterceptor_switchOn) {
        //     // 开启拦截
        //     modifyResponse();
        //   // }
        //   this.onload && this.onload.apply(this, args);
        // }
        // continue;
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
    return ajax_tools_space.originalFetch(...args).then((response) => {
      let text = undefined;
      const interfaceList = [];
      ajax_tools_space.ajaxDataList.forEach((item) => {
        interfaceList.push(...(item.interfaceList || []));
      });
      interfaceList.forEach(({open = true, request, responseText}) => {
        if (open) {
          let matched = false;
          if (request && response.url.includes(request)) {
            matched = true;
          }
          if (matched && responseText) {
            text = responseText;
            // console.info('ⓢ ►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►► ⓢ');
            console.groupCollapsed(`%c Fetch匹配路径/规则：${request}`, 'background-color: #108ee9; color: white; padding: 4px');
            console.info(`%c接口路径：`, 'background-color: #ff8040; color: white;', response.url);
            console.info('%c返回出参：', 'background-color: #ff5500; color: white;', JSON.parse(responseText));
            console.groupEnd();
            // console.info('ⓔ ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣ ⓔ')
          }
        }
      });
      if (text !== undefined) {
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(text));
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
