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

