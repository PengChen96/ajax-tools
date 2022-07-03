chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, {oldValue, newValue}] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
  }
});

let color = '#3aa757';
// let iframeVisible = true;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({color});
  // chrome.storage.local.set({ iframeVisible });
  console.log('Default background color set to 1 %cgreen', `color: ${color}`);
});

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log('12112121212');
    console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the extension");
    // if (request.greeting.indexOf("hello") !== -1){
    //   sendResponse({farewell: "goodbye"});
    // }
    return true;
  });
