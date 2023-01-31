chrome.devtools.panels.create('U-Network', 'icon.png', '../html/iframePage/dist/uNetwork.html', function (panel) {
  console.log('U-Network面板创建成功！');
});

// 创建自定义侧边栏
chrome.devtools.panels.elements.createSidebarPane("Images", function (sidebar) {
  // sidebar.setPage('../popup.html'); // 指定加载某个页面
  sidebar.setExpression('document.querySelectorAll("img")', 'All Images'); // 通过表达式来指定
  // sidebar.setObject({aaa: 111, bbb: 'Hello World!'}); // 直接设置显示某个对象
});

