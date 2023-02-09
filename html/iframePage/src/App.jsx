import {useEffect, useState} from 'react'
import {Button, Checkbox, Collapse, Input, Select, Switch} from 'antd';
import {CloseOutlined, CodeOutlined, FullscreenOutlined, MinusOutlined, PlusOutlined} from '@ant-design/icons';
import JsonViewButton from './JsonViewButton'
import 'antd/dist/antd.css';
import './App.css'

const {Panel} = Collapse;
const {TextArea} = Input;
const colorMap = [
  'ajax-tools-color-volcano', 'ajax-tools-color-red',
  'ajax-tools-color-orange', 'ajax-tools-color-gold',
  'ajax-tools-color-green', 'ajax-tools-color-cyan',
  'ajax-tools-color-blue', 'ajax-tools-color-geekblue',
  'ajax-tools-color-purple', 'ajax-tools-color-magenta',
];

function App() {
  const defaultInterface = {
    key: '1',
    open: true,
    matchType: 'normal', // normal regex
    matchMethod: '', // GET、POST、PUT、DELETE、HEAD、OPTIONS、CONNECT、TRACE、PATCH
    request: '',
    requestDes: '',
    responseText: '',
    language: 'json', // json javascript
  };
  const [ajaxToolsSkin, setAjaxToolsSkin] = useState(false);
  const [ajaxToolsSwitchOn, setAjaxToolsSwitchOn] = useState(true); // 默认开启
  const [ajaxToolsSwitchOnNot200, setAjaxToolsSwitchOnNot200] = useState(true); // 默认开启
  const [zoom, setZoom] = useState('out'); // 默认缩小
  const [ajaxDataList, setAjaxDataList] = useState([
    {
      summaryText: '分组名称（可编辑）',
      collapseActiveKeys: ['1'],
      headerClass: 'ajax-tools-color-volcano',
      interfaceList: [
        { ...defaultInterface },
      ]
    },
  ]);

  useEffect(() => {
    if (chrome.storage) {
      chrome.storage.local.get(['ajaxDataList', 'ajaxToolsSwitchOn', 'ajaxToolsSwitchOnNot200', 'ajaxToolsSkin'], (result) => {
        const {ajaxDataList = [], ajaxToolsSwitchOn = true, ajaxToolsSwitchOnNot200 = true, ajaxToolsSkin = false} = result;
        if (ajaxDataList.length > 0) {
          setAjaxDataList(ajaxDataList);
        }
        setAjaxToolsSwitchOn(ajaxToolsSwitchOn);
        setAjaxToolsSwitchOnNot200(ajaxToolsSwitchOnNot200);
        setAjaxToolsSkin(ajaxToolsSkin);
      });
    }
    if (chrome.runtime) {
      // 接收uNetwork/App.jsx发来的数据（在uNetWork面板中可以添加拦截数据更新页面）
      chrome.runtime.onMessage.addListener((request) => {
        console.log('【src/App.jsx】接收消息uNetwork->src/App.jsx', request);
        const {type, to, ajaxDataList} = request;
        if (type === 'ajaxTools_updatePage' && to === 'mainSettingSidePage') {
          setAjaxDataList(ajaxDataList);
          chrome.storage.local.set({ajaxDataList});
        }
      })
    }
  }, []);

  const openTabs = () => {
    chrome.tabs.create({
      url: 'html/iframePage/dist/index.html'
    });
  }
  // 关闭
  const onCloseClick = () => {
    chrome.storage.local.get("iframeVisible", ({iframeVisible}) => {
      chrome.tabs.query(
        {active: true, currentWindow: true},
        function (tabs) {
          // 发送消息到content.js
          chrome.tabs.sendMessage(
            tabs[0].id,
            {type: 'iframeToggle', iframeVisible},
            function (response) {
              console.log('【App.jsx】【ajax-tools-iframe-show】返回消息content->popup', response);
              chrome.storage.local.set({iframeVisible: response.nextIframeVisible});
            }
          );
        }
      );
    });
  }
  // 放大缩小
  const onZoomClick = () => {
    chrome.tabs.query(
      {active: true, currentWindow: true},
      function (tabs) {
        // 发送消息到content.js
        chrome.tabs.sendMessage(
          tabs[0].id,
          {type: 'iframeZoom', iframeZoom: zoom},
          function (response) {
            console.log('【App.jsx】【ajax-tools-iframe-show】返回消息content->popup', response);
            setZoom(zoom === 'out' ? 'in' : 'out');
          }
        );
      }
    );
  }

  // 新增分组
  const onGroupAdd = () => {
    let len = ajaxDataList.length;
    const newAjaxDataList = [...ajaxDataList, {
      summaryText: '分组名称（可编辑）',
      collapseActiveKeys: [],
      headerClass: colorMap[len % 9],
      interfaceList: [{...defaultInterface}]
    }];
    setAjaxDataList([...newAjaxDataList]);
    chrome.storage.local.set({ajaxDataList: newAjaxDataList});
  }
  const onGroupDelete = (index) => {
    const newAjaxDataList = ajaxDataList.filter((_, i) => i !== index);
    setAjaxDataList([...newAjaxDataList]);
    chrome.storage.local.set({ajaxDataList: newAjaxDataList});
  }
  const onGroupSummaryTextChange = (e, index) => {
    ajaxDataList[index].summaryText = e.target.value;
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ajaxDataList});
  }

  // 收缩分组
  const onCollapseChange = (index, keys) => {
    ajaxDataList[index].collapseActiveKeys = keys;
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ajaxDataList});
  };

  // interfaceList值变化
  const onInterfaceListChange = (index1, index2, key, value) => {
    if (key === 'responseText') {
      try {
        const lastValue = ajaxDataList[index1].interfaceList[index2][key];
        const formattedValue = JSON.stringify(JSON.parse(value), null, 4);
        value = lastValue === formattedValue ? value : formattedValue;
      } catch (e) {
        value = value;
      }
    }
    ajaxDataList[index1].interfaceList[index2][key] = value;
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ajaxDataList});
  }
  const onInterfaceListAdd = (index1) => {
    const key = String(Date.now());
    ajaxDataList[index1].collapseActiveKeys.push(key);
    const interfaceItem = {...defaultInterface};
    interfaceItem.key = key;
    ajaxDataList[index1].interfaceList.push(interfaceItem);
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ajaxDataList});
  }
  const onInterfaceListDelete = (groupIndex, key) => {
    ajaxDataList[groupIndex].collapseActiveKeys = ajaxDataList[groupIndex].collapseActiveKeys.filter((activeKey) => activeKey !== key);
    ajaxDataList[groupIndex].interfaceList = ajaxDataList[groupIndex].interfaceList.filter((v) => v.key !== key);
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ajaxDataList});
  }

  const genExtra = (groupIndex, v, i) => (
    <div onClick={(event) => event.stopPropagation()}>
      <Switch
        checked={v.open}
        onChange={(value) => onInterfaceListChange(groupIndex, i, 'open', value)}
        size="small"
        style={{margin: "0 4px"}}
      />
      <Button
        size="small"
        type="primary"
        shape="circle"
        icon={<MinusOutlined/>}
        title="删除接口"
        onClick={() => onInterfaceListDelete(groupIndex, v.key)}
        style={{minWidth: 16, width: 16, height: 16}}
      />
    </div>
  );

  const inIframe = top.location !== self.location;
  return (
    <div
      className="ajax-tools-iframe-container"
      style={{
        filter: ajaxToolsSkin ? 'invert(1)' : undefined
      }}
    >
      <div className="ajax-tools-iframe-header">
        <div>
          {
            inIframe && <>
              <CloseOutlined
                title="关闭"
                onClick={onCloseClick}
                style={{marginRight: 12}}
              />
              {
                zoom === 'out' ? <MinusOutlined
                  title="缩小"
                  onClick={onZoomClick}
                /> : <FullscreenOutlined
                  title="放大"
                  onClick={onZoomClick}
                />
              }
            </>
          }
        </div>
        <div style={{display: "flex", alignItems: 'center'}}>
          <Switch
            checkedChildren="黑夜"
            unCheckedChildren="白天"
            checked={ajaxToolsSkin}
            onChange={(value) => {
              setAjaxToolsSkin(value);
              chrome.storage.local.set({ajaxToolsSkin: value});
            }}
          />
          <CodeOutlined
            title="打开标签页"
            onClick={openTabs}
            style={{marginLeft: 8}}
          />
        </div>
      </div>
      <div className="ajax-tools-iframe-action">
        <Button size="small" type="primary" onClick={onGroupAdd}>新增分组</Button>
        <div>
          <Checkbox
            defaultChecked
            checked={ajaxToolsSwitchOnNot200}
            onChange={(e) => {
              setAjaxToolsSwitchOnNot200(e.target.checked);
              chrome.storage.local.set({ajaxToolsSwitchOnNot200: e.target.checked});
            }}
            style={{filter: ajaxToolsSwitchOn ? undefined : 'opacity(0.5)'}}
          >
            <span title="将404、500等请求状态改成200">非200</span>
          </Checkbox>
          <Switch
            defaultChecked
            checkedChildren="开启"
            unCheckedChildren="关闭"
            checked={ajaxToolsSwitchOn}
            onChange={(value) => {
              setAjaxToolsSwitchOn(value);
              chrome.storage.local.set({ajaxToolsSwitchOn: value});
            }}
          />
        </div>
      </div>
      <div
        className="ajax-tools-iframe-body"
        style={{filter: ajaxToolsSwitchOn ? undefined : 'opacity(0.5)'}}
      >
        {
          ajaxDataList.map((item, index) => {
            const {summaryText, headerClass, interfaceList = []} = item;
            return <>
              <div className={`ajax-tools-iframe-body-header ${headerClass}`}>
                <Input
                  value={summaryText}
                  className={`ajax-tools-iframe-body-header-input ${headerClass}`}
                  onChange={(e) => onGroupSummaryTextChange(e, index)}
                />
                <CloseOutlined
                  title="删除分组"
                  style={{fontSize: 12}}
                  onClick={() => onGroupDelete(index)}
                />
              </div>
              <Collapse
                className="ajax-tools-iframe-collapse"
                defaultActiveKey={['1']}
                activeKey={item.collapseActiveKeys}
                onChange={(keys) => onCollapseChange(index, keys)}
                style={{borderRadius: 0}}
              >
                {
                  interfaceList.map((v, i) => {
                    return <Panel
                      key={v.key}
                      header={
                        <div onClick={e => e.stopPropagation()}>
                          <div style={{
                            display: "inline-grid",
                            width: "calc(100vw - 150px)"
                          }}>
                            <Input
                              value={v.request}
                              onChange={(e) => onInterfaceListChange(index, i, 'request', e.target.value)}
                              placeholder="请输入匹配接口"
                              size="small"
                              addonBefore={
                                <Input.Group compact>
                                  <Select
                                    value={v.matchType}
                                    onChange={(value) => onInterfaceListChange(index, i, 'matchType', value)}
                                  >
                                    <Select.Option value="normal">普通匹配</Select.Option>
                                    <Select.Option value="regex">正则匹配</Select.Option>
                                  </Select>
                                  <Select
                                    value={v.matchMethod}
                                    onChange={(value) => onInterfaceListChange(index, i, 'matchMethod', value)}
                                  >
                                    <Select.Option value="">ALL</Select.Option>
                                    <Select.Option value="GET">GET</Select.Option>
                                    <Select.Option value="POST">POST</Select.Option>
                                    <Select.Option value="PUT">PUT</Select.Option>
                                    <Select.Option value="DELETE">DELETE</Select.Option>
                                    <Select.Option value="HEAD">HEAD</Select.Option>
                                    <Select.Option value="OPTIONS">OPTIONS</Select.Option>
                                    <Select.Option value="CONNECT">CONNECT</Select.Option>
                                    <Select.Option value="TRACE">TRACE</Select.Option>
                                    <Select.Option value="PATCH">PATCH</Select.Option>
                                  </Select>
                                </Input.Group>
                              }
                            />
                            <Input
                              value={v.requestDes}
                              onChange={(e) => onInterfaceListChange(index, i, 'requestDes', e.target.value)}
                              placeholder="备注（可编辑）"
                              size="small"
                              className="ajax-tools-iframe-request-des-input"
                            />
                          </div>
                        </div>
                      }
                      extra={genExtra(index, v, i)}
                    >
                      <div style={{position: 'relative'}}>
                        <TextArea
                          rows={4}
                          value={v.responseText}
                          onChange={(e) => onInterfaceListChange(index, i, 'responseText', e.target.value)}
                          placeholder="response text"
                        />
                        <JsonViewButton
                          language={v.language}
                          request={v.request}
                          responseText={v.responseText}
                          onInterfaceListChange={(key, value) => onInterfaceListChange(index, i, key, value)}
                        />
                      </div>
                    </Panel>
                  })
                }
              </Collapse>
              <div className="ajax-tools-iframe-body-footer">
                <Button
                  size="small"
                  type="primary"
                  shape="circle"
                  icon={<PlusOutlined/>}
                  title="新增接口"
                  onClick={() => onInterfaceListAdd(index)}
                />
              </div>
            </>
          })
        }
      </div>
    </div>
  )
}

export default App
