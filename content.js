
// 设置iframeVisible默认值，刷新后重置storage
chrome.storage.local.set({iframeVisible: true});

function injectedScript (path) {
  const scriptNode = document.createElement('script');
  scriptNode.src= chrome.runtime.getURL(path);
  document.documentElement.appendChild(scriptNode);
  return scriptNode;
}
function injectedCss(path) {
  const linkElement = document.createElement('link');
  linkElement.rel = 'stylesheet';
  linkElement.href = chrome.runtime.getURL(path);
  document.documentElement.appendChild(linkElement);
  return linkElement;
}
function injectedStyle(styleContent) {
  const styleElement = document.createElement('style');
  styleElement.textContent = styleContent;
  document.documentElement.appendChild(styleElement);
  return styleElement;
}
injectedStyle(`
  .ajax-interceptor-container {
    display: flex;
    flex-direction: column;
    height: 100% !important;
    width: 580px !important;
    min-width: 1px !important;
    position: fixed !important;
    inset: 0px 0px auto auto !important;
    z-index: 2147483647 !important;
    transform: translateX(0px) !important;
    transition: all 0.4s ease 0s !important;
    box-shadow: rgba(0, 0, 0, 0.12) 0px 0px 15px 2px !important;
    background: #fff;
    overflow: hidden;
  }
  .ajax-interceptor-action-bar {
    height: 40px;
    min-height: 40px;
    padding: 0 12px 0 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .ajax-interceptor-iframe {
    border: none;
    height: calc(100% - 40px);
    width: 100%;
    border-top: 1px solid #d1d3d8;
  }
  .ajax-interceptor-icon {
    cursor: pointer;
  }
  .ajax-interceptor-mr-12 {
    margin-right: 12px;
  }
`);
injectedCss('icons/iconfont/iconfont.css');
injectedScript('html/iframePage/mock.js');
injectedScript('pageScripts/index.js').addEventListener('load', () => {
  chrome.storage.local.get(['iframeVisible', 'ajaxToolsSwitchOn', 'ajaxToolsSwitchOnNot200', 'ajaxDataList', 'ajaxToolsSkin'], (result) => {
    console.log('【ajaxTools content.js】【storage】', result);
    const {ajaxToolsSwitchOn = true, ajaxToolsSwitchOnNot200 = true, ajaxDataList = []} = result;
    postMessage({type: 'ajaxTools', to: 'pageScript', key: 'ajaxDataList', value: ajaxDataList});
    postMessage({type: 'ajaxTools', to: 'pageScript', key: 'ajaxToolsSwitchOn', value: ajaxToolsSwitchOn});
    postMessage({type: 'ajaxTools', to: 'pageScript', key: 'ajaxToolsSwitchOnNot200', value: ajaxToolsSwitchOnNot200});
  });
});


function closeButton (container) {
  const closeIcon = document.createElement('i');
  closeIcon.title = 'Close';
  closeIcon.className='c-iconfont c-icon-close ajax-interceptor-icon ajax-interceptor-mr-12';
  closeIcon.addEventListener('click', function () {
    container.style.setProperty('transform', 'translateX(calc(100% + 20px))', 'important');
    chrome.storage.local.set({iframeVisible: true});
  })
  return closeIcon;
}
function zoomButton (container) {
  let zoomOut = true;
  const zoomIcon = document.createElement('i');
  zoomIcon.className='c-iconfont c-icon-reduce ajax-interceptor-icon';
  zoomIcon.addEventListener('click', function () {
    if (zoomOut) { // 缩小
      container.style.setProperty('height', '40px', 'important');
      let timer = setTimeout(() => {
        container.style.setProperty('width', '160px', 'important');
        clearTimeout(timer);
      }, 400);
      zoomOut = false;
      zoomIcon.title = 'Zoom in';
      zoomIcon.className='c-iconfont c-icon-fullscreen ajax-interceptor-icon';
    } else { // 放大
      container.style.setProperty('width', '580px', 'important');
      let timer = setTimeout(() => {
        container.style.setProperty('height', '100%', 'important');
        clearTimeout(timer);
      }, 400);
      zoomOut = true;
      zoomIcon.title = 'Zoom out';
      zoomIcon.className='c-iconfont c-icon-reduce ajax-interceptor-icon';
    }
  })
  return zoomIcon;
}
function themeModeButton (container) {
  let mode = 'light'; // 'light|dark'
  const themeIcon = document.createElement('i');
  themeIcon.addEventListener('click', function() {
    if (mode === 'dark') {
      mode = 'light';
      themeIcon.title = 'Dark';
      themeIcon.className = 'c-iconfont c-icon-heiyemoshi ajax-interceptor-icon ajax-interceptor-mr-12';
      container.style.setProperty('filter', 'none');
      chrome.storage.local.set({ ajaxToolsSkin: 'light' });
    } else {
      mode = 'dark';
      themeIcon.title = 'Light';
      themeIcon.className = 'c-iconfont c-icon-taiyang ajax-interceptor-icon ajax-interceptor-mr-12';
      container.style.setProperty('filter', 'invert(1)');
      chrome.storage.local.set({ ajaxToolsSkin: 'dark' });
    }
  });
  // 设置初始主题
  chrome.storage.local.get(['ajaxToolsSkin'], (result) => {
    mode = result.ajaxToolsSkin || 'light';
    if (mode === 'dark') {
      themeIcon.title = 'Light';
      themeIcon.className = 'c-iconfont c-icon-taiyang ajax-interceptor-icon ajax-interceptor-mr-12';
      container.style.setProperty('filter', 'invert(1)');
    } else {
      themeIcon.title = 'Dark';
      themeIcon.className = 'c-iconfont c-icon-heiyemoshi ajax-interceptor-icon ajax-interceptor-mr-12';
      container.style.setProperty('filter', 'none');
    }
  });
  return themeIcon;
}
function pipButton (container) {
  const pipIcon = document.createElement('i');
  pipIcon.title = 'Picture in picture';
  pipIcon.className='c-iconfont c-icon-zoomout ajax-interceptor-icon ajax-interceptor-mr-12';
  pipIcon.addEventListener('click', async function() {
    if (!('documentPictureInPicture' in window)) {
      alert('Your browser does not currently support documentPictureInPicture. You can go to chrome://flags/#document-picture-in-picture-api to enable it.');
      return;
    }
    const iframe = document.querySelector('.ajax-interceptor-iframe');
    const pipWindow = await documentPictureInPicture.requestWindow({width: 580, height: 680});
    // css
    const allCSS = [...document.styleSheets]
      .map((styleSheet) => {
        try {
          return [...styleSheet.cssRules].map((r) => r.cssText).join('');
        } catch (e) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.media = styleSheet.media;
          link.href = styleSheet.href;
          pipWindow.document.head.appendChild(link);
        }
      })
      .filter(Boolean)
      .join('\n');
    const style = document.createElement('style');
    style.textContent = allCSS;
    pipWindow.document.head.appendChild(style);
    // js
    [...document.scripts].map((v) => {
      const script = document.createElement('script');
      script.src = v.src;
      script.type = v.type;
      pipWindow.document.head.appendChild(script);
    });
    pipWindow.document.body.append(iframe);
    // 收起侧边
    container.style.setProperty('transform', 'translateX(calc(100% + 20px))', 'important');
    iframe.style.setProperty('height', '100%');
    pipWindow.addEventListener('pagehide', (event) => {
      // 展示侧边
      container.style.setProperty('transform', 'translateX(0)', 'important');
      iframe.style.setProperty('height', 'calc(100% - 40px)');
      container?.append(iframe);
    });
  });
  return pipIcon;
}
function newTabButton () {
  const newTabIcon = document.createElement('i');
  newTabIcon.title = 'Open a new tab';
  newTabIcon.className='c-iconfont c-icon-codelibrary ajax-interceptor-icon';
  newTabIcon.addEventListener('click', function () {
    window.open(chrome.runtime.getURL('html/iframePage/dist/index.html'));
  })
  return newTabIcon;
}
function actionBar (container) {
  const header = document.createElement('header');
  header.className = 'ajax-interceptor-action-bar';
  // left
  const left = document.createElement('div');
  const closeBtn = closeButton(container);
  left.appendChild(closeBtn);
  const zoomBtn = zoomButton(container);
  left.appendChild(zoomBtn);
  header.appendChild(left);
  // right
  const right = document.createElement('div');
  const themeModeBtn = themeModeButton(container);
  right.appendChild(themeModeBtn);
  const pipBtn = pipButton(container);
  right.appendChild(pipBtn);
  const newTabBtn = newTabButton();
  right.appendChild(newTabBtn);
  header.appendChild(right);
  return header;
}
// 只在最顶层页面嵌入iframe
if (window.self === window.top) {
  document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
      let container = document.createElement('div');
      container.className = 'ajax-interceptor-container'
      container.style.setProperty('transform', 'translateX(calc(100% + 20px))', 'important'); // 470px
      const _actionBar = actionBar(container);
      container.appendChild(_actionBar);
      const iframe = document.createElement('iframe');
      iframe.src = chrome.runtime.getURL("html/iframePage/dist/index.html");
      iframe.className='ajax-interceptor-iframe';
      container.appendChild(iframe);
      if (document.body) document.body.appendChild(container);
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('【content】【ajax-tools-iframe-show】receive message', request);
        const {type, iframeVisible} = request;
        if (type === 'iframeToggle') {
          container.style.setProperty('transform', iframeVisible ? 'translateX(0)' : 'translateX(calc(100% + 20px))', 'important');
          sendResponse({nextIframeVisible: !iframeVisible}); // 返回信息到popup.js / App.jsx
        }
        return true;
      });
    }
  }
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, {oldValue, newValue}] of Object.entries(changes)) {
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

