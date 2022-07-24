console.log('content script');
// 设置iframeVisible默认值，刷新后重置storage
chrome.storage.local.set({iframeVisible: true});

// 在页面上插入代码
const script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', chrome.runtime.getURL('pageScripts/index.js'));
document.documentElement.appendChild(script);
script.addEventListener('load', () => {
  chrome.storage.local.get(['iframeVisible', 'ajaxToolsSwitchOn', 'ajaxToolsSwitchOnNot200', 'ajaxToolsSkin', 'ajaxDataList'], (result) => {
    console.log('【ajaxTools content.js】【storage】', result);
    const {ajaxToolsSwitchOn = true, ajaxToolsSwitchOnNot200 = true, ajaxDataList = []} = result;
    postMessage({type: 'ajaxTools', to: 'pageScript', key: 'ajaxDataList', value: ajaxDataList});
    postMessage({type: 'ajaxTools', to: 'pageScript', key: 'ajaxToolsSwitchOn', value: ajaxToolsSwitchOn});
    postMessage({type: 'ajaxTools', to: 'pageScript', key: 'ajaxToolsSwitchOnNot200', value: ajaxToolsSwitchOnNot200});
  });
});


let iframe;
let iframeLoaded = false;

// 只在最顶层页面嵌入iframe
if (window.self === window.top) {

  document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
      iframe = document.createElement('iframe');
      iframe.className = "ajax-tools";
      iframe.style.setProperty('height', '100%', 'important');
      iframe.style.setProperty('width', '450px', 'important');
      iframe.style.setProperty('min-width', '1px', 'important');
      iframe.style.setProperty('position', 'fixed', 'important');
      iframe.style.setProperty('top', '0', 'important');
      iframe.style.setProperty('right', '0', 'important');
      iframe.style.setProperty('left', 'auto', 'important');
      iframe.style.setProperty('bottom', 'auto', 'important');
      iframe.style.setProperty('z-index', '9999999999999', 'important');
      iframe.style.setProperty('transform', 'translateX(470px)', 'important'); // 470px
      iframe.style.setProperty('transition', 'all .4s', 'important');
      iframe.style.setProperty('box-shadow', '0 0 15px 2px rgba(0,0,0,0.12)', 'important');
      iframe.frameBorder = "none";
      // iframe.src = "http://localhost:4001/";
      iframe.src = chrome.runtime.getURL("html/iframePage/dist/index.html");
      // iframe.src = chrome.runtime.getURL("html/sidebar.html");
      document.body.appendChild(iframe);

      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('【ajax-tools-iframe-show】接收消息popup->content', request);
        const {type, iframeVisible, iframeZoom} = request;
        if (type === 'iframeToggle') {
          iframe.style.setProperty('transform', iframeVisible ? 'translateX(0)' : 'translateX(470px)', 'important');
          sendResponse({nextIframeVisible: !iframeVisible}); // 返回信息到popup.js / App.jsx
        }
        if (type === 'iframeZoom') {
          if (iframeZoom === 'out') { // 缩小
            iframe.style.setProperty('height', '40px', 'important');
            let timer = setTimeout(() => {
              iframe.style.setProperty('width', '100px', 'important');
              clearTimeout(timer);
            }, 400);
          } else if (iframeZoom === 'in') { // 放大
            iframe.style.setProperty('width', '470px', 'important');
            let timer = setTimeout(() => {
              iframe.style.setProperty('height', '100%', 'important');
              clearTimeout(timer);
            }, 400);
          }
          sendResponse();
        }
        return true;
      });

    }
  }
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, {oldValue, newValue}] of Object.entries(changes)) {
    // console.table({
    //   namespace,
    //   key,
    //   newValue,
    //   oldValue
    // })
    if (
      key === 'ajaxDataList'
      || key === 'ajaxToolsSwitchOn'
      || key === 'ajaxToolsSwitchOnNot200'
    ) {
      // 发送到pageScript/index
      postMessage({
        type: 'ajaxTools',
        to: 'pageScript',
        key,
        value: newValue,
      });
    }
  }
});

