const $id = (id) => document.getElementById(id);

$id('ajax-tools-iframe-show').addEventListener('click', () => {
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
            console.log('【popup.js】【ajax-tools-iframe-show】返回消息content->popup', response);
            chrome.storage.local.set({iframeVisible: response.nextIframeVisible});
          }
        );
      }
    );
  });
});

document.getElementById('testFun').addEventListener('click', () => {
  console.log('123');
  // alert('123');
  let value = Math.random();
  chrome.storage.local.set({key: value}, function () {
    console.log('Value is set to ' + value);
  });
})

let changeColor = document.getElementById("changeColor");

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    function: setPageBackgroundColor,
  });
});

// The body of this function will be executed as a content script inside the
// current page
function setPageBackgroundColor() {
  chrome.storage.sync.get("color", ({color}) => {
    document.body.style.backgroundColor = color;
  });
}
