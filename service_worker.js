function sendMessageToContentScript(tabId, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      // console.log('【service_worker.js】->【content】【ajax-tools-iframe-show】Return message:', response);
      resolve(response);
    });
  });
}
async function toggleIframeVisibility() {
  const {iframeVisible} = await chrome.storage.local.get({iframeVisible: true});
  const tabs = await chrome.tabs.query({active: true, currentWindow: true});
  const response = await sendMessageToContentScript(tabs[0].id, {type: 'iframeToggle', iframeVisible});
  await chrome.storage.local.set({iframeVisible: response.nextIframeVisible});
}
function setSwitchBadge (switchValue) {
  chrome.action.setBadgeText({text: switchValue ? 'ON' : 'OFF'});
  chrome.action.setBadgeTextColor({ color: switchValue ? '#ffffff' : '#333333' });
  chrome.action.setBadgeBackgroundColor({color: switchValue ? '#4480f7' : '#bfbfbf'});
}

chrome.action.onClicked.addListener(async () => {
  await toggleIframeVisibility();
});

chrome.storage.local.get(['ajaxToolsSwitchOn'], (result) => {
  const {ajaxToolsSwitchOn = true} = result;
  setSwitchBadge(ajaxToolsSwitchOn);
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, {oldValue, newValue}] of Object.entries(changes)) {
    if (key === 'ajaxToolsSwitchOn') {
      setSwitchBadge(newValue);
    }
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('%c Ajax Tools onInstalled', `color: #3aa757`);
});

