
// 设置iframeVisible默认值，刷新后重置storage
chrome.storage.local.set({iframeVisible: true});

async function injectedScript (path, root = document.documentElement) {
  // 获取顶层插入开关设置
  const result = await chrome.storage.local.get(['ajaxToolsTopLevelOnly']);
  const { ajaxToolsTopLevelOnly = true } = result;
  // 只在最顶层嵌入  https://github.com/PengChen96/ajax-tools/issues/18
  if (window.self === window.top || !ajaxToolsTopLevelOnly) {
    const scriptNode = document.createElement('script');
    scriptNode.src= chrome.runtime.getURL(path);
    root.appendChild(scriptNode);
    return scriptNode;
  }
}
async function injectedCss(path, root = document.documentElement) {
  // 获取顶层插入开关设置
  const result = await chrome.storage.local.get(['ajaxToolsTopLevelOnly']);
  const { ajaxToolsTopLevelOnly = true } = result;
  // 只在最顶层嵌入  https://github.com/PengChen96/ajax-tools/issues/18
  if (window.self === window.top || !ajaxToolsTopLevelOnly) {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = chrome.runtime.getURL(path);
    root.appendChild(linkElement);
    return linkElement;
  }
}
async function injectedStyle(styleContent, root = document.documentElement) {
  // 获取顶层插入开关设置
  const result = await chrome.storage.local.get(['ajaxToolsTopLevelOnly']);
  const { ajaxToolsTopLevelOnly = true } = result;
  // 只在最顶层嵌入  https://github.com/PengChen96/ajax-tools/issues/18
  if (window.self === window.top || !ajaxToolsTopLevelOnly) {
    const styleElement = document.createElement('style');
    styleElement.textContent = styleContent;
    root.appendChild(styleElement);
    return styleElement;
  }
}

async function injectContent() {
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
      position: relative;
    }
    .ajax-interceptor-new::after {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ff0000;
      position: absolute;
      right: -2px;
      top: -2px;
    }
    .ajax-interceptor-mr-8 {
      margin-right: 8px;
    }
  `);
  injectedCss('icons/iconfont/iconfont.css');
  injectedScript('html/iframePage/mock.js');
  const pageScripts = await injectedScript('pageScripts/index.js');
  if (pageScripts) {
    pageScripts.addEventListener('load', () => {
      chrome.storage.local.get(['iframeVisible', 'ajaxToolsSwitchOn', 'ajaxToolsSwitchOnNot200', 'ajaxDataList', 'ajaxToolsSkin'], (result) => {
        // console.log('【ajaxTools content.js】【storage】', result);
        const {ajaxToolsSwitchOn = true, ajaxToolsSwitchOnNot200 = true, ajaxDataList = []} = result;
        postMessage({type: 'ajaxTools', to: 'pageScript', key: 'ajaxDataList', value: ajaxDataList});
        postMessage({type: 'ajaxTools', to: 'pageScript', key: 'ajaxToolsSwitchOn', value: ajaxToolsSwitchOn});
        postMessage({type: 'ajaxTools', to: 'pageScript', key: 'ajaxToolsSwitchOnNot200', value: ajaxToolsSwitchOnNot200});
      });
    });
  }
}
injectContent();

async function callbackIframeLoad(iframe) {
  try {
    await injectedScript('html/iframePage/mock.js', iframe.contentDocument.documentElement);
    const pageScripts = await injectedScript('pageScripts/index.js', iframe.contentDocument.documentElement);
    if (pageScripts) {
      pageScripts.addEventListener('load', () => {
        chrome.storage.local.get(['ajaxToolsSwitchOn', 'ajaxToolsSwitchOnNot200', 'ajaxDataList'], (result) => {
          const {ajaxToolsSwitchOn = true, ajaxToolsSwitchOnNot200 = true, ajaxDataList = []} = result;
          iframe.contentWindow.postMessage({
            type: 'ajaxTools',
            to: 'pageScript',
            key: 'ajaxDataList',
            value: ajaxDataList
          }, '*');
          iframe.contentWindow.postMessage({
            type: 'ajaxTools',
            to: 'pageScript',
            key: 'ajaxToolsSwitchOn',
            value: ajaxToolsSwitchOn
          }, '*');
          iframe.contentWindow.postMessage({
            type: 'ajaxTools',
            to: 'pageScript',
            key: 'ajaxToolsSwitchOnNot200',
            value: ajaxToolsSwitchOnNot200
          }, '*');
        });
      });
    }
  } catch (err) {
    console.error('Failed to inject scripts into iframe:', err);
  } 
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeName === 'IFRAME') {
        const iframe = node;
        if (iframe.complete || (iframe.contentDocument && iframe.contentDocument.readyState === 'complete')) {
          callbackIframeLoad(iframe);
        } else {
          iframe.addEventListener('load', () => {
            callbackIframeLoad(iframe);
          });
        }
      }
    });
  });
});

observer.observe(document, { childList: true, subtree: true });

function closeButton (container) {
  const closeIcon = document.createElement('i');
  closeIcon.title = 'Close';
  closeIcon.className='c-iconfont c-icon-close ajax-interceptor-icon ajax-interceptor-mr-8';
  closeIcon.addEventListener('click', function () {
    container.style.setProperty('transform', 'translateX(calc(100% + 20px))', 'important');
    chrome.storage.local.set({iframeVisible: true});
  })
  return closeIcon;
}
function zoomButton (container) {
  let zoomOut = true;
  const zoomIcon = document.createElement('i');
  zoomIcon.className='c-iconfont c-icon-reduce ajax-interceptor-icon ajax-interceptor-mr-8';
  zoomIcon.addEventListener('click', function () {
    if (zoomOut) { // 缩小
      container.style.setProperty('height', '40px', 'important');
      let timer = setTimeout(() => {
        container.style.setProperty('width', '180px', 'important');
        clearTimeout(timer);
      }, 400);
      zoomOut = false;
      zoomIcon.title = 'Zoom in';
      zoomIcon.className='c-iconfont c-icon-fullscreen ajax-interceptor-icon ajax-interceptor-mr-8';
    } else { // 放大
      container.style.setProperty('width', '580px', 'important');
      let timer = setTimeout(() => {
        container.style.setProperty('height', '100%', 'important');
        clearTimeout(timer);
      }, 400);
      zoomOut = true;
      zoomIcon.title = 'Zoom out';
      zoomIcon.className='c-iconfont c-icon-reduce ajax-interceptor-icon ajax-interceptor-mr-8';
    }
  })
  return zoomIcon;
}
function pipButton (container) {
  const pipIcon = document.createElement('i');
  pipIcon.title = 'Picture in picture';
  const className ='c-iconfont c-icon-zoomout ajax-interceptor-icon';
  pipIcon.className = className;
  chrome.storage.local.get(['ajaxToolsPipBtnNewHideFlag'], ({ ajaxToolsPipBtnNewHideFlag }) => {
    pipIcon.className = ajaxToolsPipBtnNewHideFlag ? pipIcon.className : `${pipIcon.className} ajax-interceptor-new`;
  });
  pipIcon.addEventListener('click', async function() {
    if (!('documentPictureInPicture' in window)) {
      alert('Your browser does not currently support documentPictureInPicture. You can go to chrome://flags/#document-picture-in-picture-api to enable it.\n' +
        'If you have enabled documentPictureInPicture, please use the HTTPS protocol, or localhost/127.0.0.1, or open the configuration page in a new tab and use picture-in-picture there.');
      return;
    }
    pipIcon.className = className;
    chrome.storage.local.set({ ajaxToolsPipBtnNewHideFlag: true });
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
function themeModeButton (container) {
  let mode = 'light'; // 'light|dark'
  const themeIcon = document.createElement('i');
  themeIcon.addEventListener('click', function() {
    if (mode === 'dark') {
      mode = 'light';
      themeIcon.title = 'Dark';
      themeIcon.className = 'c-iconfont c-icon-heiyemoshi ajax-interceptor-icon ajax-interceptor-mr-8';
      container.style.setProperty('filter', 'none');
      chrome.storage.local.set({ ajaxToolsSkin: 'light' });
    } else {
      mode = 'dark';
      themeIcon.title = 'Light';
      themeIcon.className = 'c-iconfont c-icon-taiyang ajax-interceptor-icon ajax-interceptor-mr-8';
      container.style.setProperty('filter', 'invert(1)');
      chrome.storage.local.set({ ajaxToolsSkin: 'dark' });
    }
  });
  // 设置初始主题
  chrome.storage.local.get(['ajaxToolsSkin'], (result) => {
    mode = result.ajaxToolsSkin || 'light';
    if (mode === 'dark') {
      themeIcon.title = 'Light';
      themeIcon.className = 'c-iconfont c-icon-taiyang ajax-interceptor-icon ajax-interceptor-mr-8';
      container.style.setProperty('filter', 'invert(1)');
    } else {
      themeIcon.title = 'Dark';
      themeIcon.className = 'c-iconfont c-icon-heiyemoshi ajax-interceptor-icon ajax-interceptor-mr-8';
      container.style.setProperty('filter', 'none');
    }
  });
  return themeIcon;
}
function discussionsButton () {
  const discussionsIcon = document.createElement('i');
  discussionsIcon.title = 'Discussions';
  discussionsIcon.className='c-iconfont c-icon-xiaoxi ajax-interceptor-icon ajax-interceptor-mr-8';
  discussionsIcon.addEventListener('click', function () {
    window.open('https://github.com/PengChen96/ajax-tools/discussions');
  })
  return discussionsIcon;
}
function codeNetButton () {
  const codeNetIcon = document.createElement('i');
  codeNetIcon.title = 'Open the Declarative Network Request Configuration page';
  const className = 'c-iconfont c-icon-code ajax-interceptor-icon ajax-interceptor-mr-8';
  codeNetIcon.className = className;
  chrome.storage.local.get(['ajaxToolsCodeNetBtnNewHideFlag'], ({ ajaxToolsCodeNetBtnNewHideFlag }) => {
    codeNetIcon.className = ajaxToolsCodeNetBtnNewHideFlag ? className : `${className} ajax-interceptor-new`;
  });
  codeNetIcon.addEventListener('click', function () {
    window.open(chrome.runtime.getURL('html/iframePage/dist/declarativeNetRequest.html'));
    codeNetIcon.className = className;
    chrome.storage.local.set({ ajaxToolsCodeNetBtnNewHideFlag: true });
  })
  return codeNetIcon;
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
  const pipBtn = pipButton(container);
  left.appendChild(pipBtn);
  header.appendChild(left);
  // right
  const right = document.createElement('div');
  const themeModeBtn = themeModeButton(container);
  right.appendChild(themeModeBtn);
  const discussionsBtn = discussionsButton();
  right.appendChild(discussionsBtn);
  const codeNetBtn = codeNetButton();
  right.appendChild(codeNetBtn);
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
        // console.log('【content】【ajax-tools-iframe-show】receive message', request);
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

