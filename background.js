
chrome.action.onClicked.addListener(() => {

  chrome.storage.local.get("iframeVisible", ({iframeVisible}) => {
    console.table({iframeVisible});
    chrome.tabs.query(
      {active: true, currentWindow: true},
      function (tabs) {
        // 发送消息到content.js
        chrome.tabs.sendMessage(
          tabs[0].id,
          {type: 'iframeToggle', iframeVisible},
          function (response) {
            console.log('【background.js】【ajax-tools-iframe-show】返回消息content->popup', response);
            chrome.storage.local.set({iframeVisible: response.nextIframeVisible});
          }
        );
      }
    );
  });

});

chrome.storage.local.get(['ajaxToolsSwitchOn'], (result) => {
  const {ajaxToolsSwitchOn = true} = result;
  chrome.action.setBadgeText({text: ajaxToolsSwitchOn ? 'ON' : 'OFF'});
  chrome.action.setBadgeBackgroundColor({color: ajaxToolsSwitchOn ? '#4480f7' : '#bfbfbf'});
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, {oldValue, newValue}] of Object.entries(changes)) {
    if (key === 'ajaxToolsSwitchOn') {
      chrome.action.setBadgeText({text: newValue ? 'ON' : 'OFF'});
      chrome.action.setBadgeBackgroundColor({color: newValue ? '#4480f7' : '#bfbfbf'});
    }
  }
});


let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({color});
  // chrome.storage.local.set({ iframeVisible });
  console.log('%c Ajax Tools onInstalled', `color: #3aa757`);
});

