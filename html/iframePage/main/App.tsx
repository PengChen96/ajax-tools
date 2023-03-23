
import React, { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Collapse, Input, Select, Switch, Result } from 'antd';
import { CloseOutlined, CodeOutlined, FullscreenOutlined, MinusOutlined, PlusOutlined, FormOutlined, GithubOutlined, DropboxOutlined } from '@ant-design/icons';
import ModifyDataModal, { ModifyDataModalOnSaveProps } from './ModifyDataModal';
import { defaultInterface, defaultAjaxDataList, DefaultInterfaceObject } from '../common/value';
import 'antd/dist/antd.css';
import './App.css';

const { Panel } = Collapse;
const { TextArea } = Input;
const colorMap = [
  'ajax-tools-color-volcano', 'ajax-tools-color-red',
  'ajax-tools-color-orange', 'ajax-tools-color-gold',
  'ajax-tools-color-green', 'ajax-tools-color-cyan',
  'ajax-tools-color-blue', 'ajax-tools-color-geekblue',
  'ajax-tools-color-purple', 'ajax-tools-color-magenta',
];

function App() {
  const modifyDataModalRef = useRef<any>({});

  const [ajaxToolsSkin, setAjaxToolsSkin] = useState(false);
  const [ajaxToolsSwitchOn, setAjaxToolsSwitchOn] = useState(true); // 默认开启
  const [ajaxToolsSwitchOnNot200, setAjaxToolsSwitchOnNot200] = useState(true); // 默认开启
  const [zoom, setZoom] = useState('out'); // 默认缩小
  const [ajaxDataList, setAjaxDataList] = useState(defaultAjaxDataList);

  useEffect(() => {
    if (chrome.storage) {
      chrome.storage.local.get(['ajaxDataList', 'ajaxToolsSwitchOn', 'ajaxToolsSwitchOnNot200', 'ajaxToolsSkin'], (result) => {
        const { ajaxDataList = [], ajaxToolsSwitchOn = true, ajaxToolsSwitchOnNot200 = true, ajaxToolsSkin = false } = result;
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
        const { type, to, ajaxDataList } = request;
        if (type === 'ajaxTools_updatePage' && to === 'mainSettingSidePage') {
          console.log('【main/App.jsx】<-【uNetwork】Receive message:', request);
          setAjaxDataList(ajaxDataList);
          chrome.storage.local.set({ ajaxDataList });
        }
      });
    }
  }, []);

  const openTabs = () => {
    chrome.tabs.create({
      url: 'html/iframePage/dist/index.html'
    });
  };
  // 关闭
  const onCloseClick = () => {
    chrome.storage.local.get('iframeVisible', ({ iframeVisible }) => {
      chrome.tabs.query(
        { active: true, currentWindow: true },
        function (tabs) {
          const tabId = tabs[0]?.id;
          if (tabId) {
            // 发送消息到content.js
            chrome.tabs.sendMessage(
              tabId,
              { type: 'iframeToggle', iframeVisible },
              function (response) {
                console.log('【main/App.jsx】->【content】【ajax-tools-iframe-show】Return message:', response);
                chrome.storage.local.set({ iframeVisible: response.nextIframeVisible });
              }
            );
          }
        }
      );
    });
  };
  // 放大缩小
  const onZoomClick = () => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      function (tabs) {
        const tabId = tabs[0]?.id;
        // 发送消息到content.js
        if (tabId != null) {
          chrome.tabs.sendMessage(
            tabId,
            { type: 'iframeZoom', iframeZoom: zoom },
            function (response) {
              console.log('【main/App.jsx】->【content】【ajax-tools-iframe-show】Return message:', response);
              setZoom(zoom === 'out' ? 'in' : 'out');
            }
          );
        }
      }
    );
  };

  // 新增分组
  const onGroupAdd = () => {
    const len = ajaxDataList.length;
    const newAjaxDataList = [...ajaxDataList, {
      summaryText: 'Group Name (Editable)',
      collapseActiveKeys: [],
      headerClass: colorMap[len % 9],
      interfaceList: [{ ...defaultInterface }]
    }];
    setAjaxDataList([...newAjaxDataList]);
    chrome.storage.local.set({ ajaxDataList: newAjaxDataList });
  };
  const onGroupDelete = (groupIndex: number) => {
    const newAjaxDataList = ajaxDataList.filter((_, i) => i !== groupIndex);
    setAjaxDataList([...newAjaxDataList]);
    chrome.storage.local.set({ ajaxDataList: newAjaxDataList });
  };
  const onGroupSummaryTextChange = (e: React.ChangeEvent<HTMLInputElement>, groupIndex: number) => {
    ajaxDataList[groupIndex].summaryText = e.target.value;
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ ajaxDataList });
  };

  // 收缩分组
  const onCollapseChange = (groupIndex: number, keys: string | string[]) => {
    ajaxDataList[groupIndex].collapseActiveKeys = Array.isArray(keys) ? keys : [keys];
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ ajaxDataList });
  };

  // interfaceList值变化
  const onInterfaceListChange = (groupIndex: number, interfaceIndex: number, key: string, value: string | boolean) => {
    if (key === 'headers' || key === 'responseText') {
      try {
        const lastValue = ajaxDataList[groupIndex]?.interfaceList?.[interfaceIndex]?.[key];
        const formattedValue = JSON.stringify(JSON.parse(value as string), null, 4);
        value = lastValue === formattedValue ? value : formattedValue;
      } catch (e) {
        // value = value;
      }
    }
    ajaxDataList[groupIndex].interfaceList[interfaceIndex][key]! = value;
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ ajaxDataList });
  };
  const onInterfaceListAdd = (groupIndex: number) => {
    const key = String(Date.now());
    ajaxDataList[groupIndex].collapseActiveKeys.push(key);
    const interfaceItem = { ...defaultInterface };
    interfaceItem.key = key;
    ajaxDataList[groupIndex].interfaceList.push(interfaceItem);
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ ajaxDataList });
  };
  const onInterfaceListDelete = (groupIndex: number, key: string) => {
    ajaxDataList[groupIndex].collapseActiveKeys = ajaxDataList[groupIndex].collapseActiveKeys.filter((activeKey) => activeKey !== key);
    ajaxDataList[groupIndex].interfaceList = ajaxDataList[groupIndex].interfaceList.filter((v) => v.key !== key);
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ ajaxDataList });
  };
  const onInterfaceListSave = (
    { groupIndex, interfaceIndex, headersEditorValue, responseEditorValue, language } : ModifyDataModalOnSaveProps
  ) => {
    if (headersEditorValue !== undefined) onInterfaceListChange(groupIndex, interfaceIndex, 'headers', headersEditorValue);
    if (responseEditorValue !== undefined) onInterfaceListChange(groupIndex, interfaceIndex, 'responseText', responseEditorValue);
    if (language !== undefined) onInterfaceListChange(groupIndex, interfaceIndex, 'language', language);
  };

  const genExtra = (
    groupIndex: number,
    interfaceIndex: number,
    v: DefaultInterfaceObject,
  ) => {
    return <div onClick={(event) => event.stopPropagation()} style={{ display: 'flex', alignItems: 'center', height: 24 }}>
      <Switch
        checked={v.open}
        onChange={(value) => onInterfaceListChange(groupIndex, interfaceIndex, 'open', value)}
        size="small"
        style={{ margin: '0 4px' }}
      />
      <Button
        size="small"
        type="primary"
        shape="circle"
        icon={<MinusOutlined/>}
        title="Delete Interface"
        onClick={() => onInterfaceListDelete(groupIndex, v.key)}
        style={{ minWidth: 16, width: 16, height: 16 }}
      />
      <FormOutlined
        onClick={() => modifyDataModalRef.current.openModal({
          groupIndex,
          interfaceIndex,
          activeTab: 'Response',
          request: v.request,
          headersText: v.headers,
          responseLanguage: v.language,
          responseText: v.responseText
        })}
        style={{ marginLeft: 8 }}
      />
    </div>;
  };

  const inIframe = top?.location !== self.location;
  return (
    <div
      className="ajax-tools-iframe-container"
      style={{
        filter: ajaxToolsSkin ? 'invert(1)' : undefined
      }}
    >
      <header className="ajax-tools-iframe-header">
        <div>
          {
            inIframe && <>
              <CloseOutlined
                title="Close"
                onClick={onCloseClick}
                style={{ marginRight: 12 }}
              />
              {
                zoom === 'out' ? <MinusOutlined
                  title="Zoom Out"
                  onClick={onZoomClick}
                /> : <FullscreenOutlined
                  title="Zoom In"
                  onClick={onZoomClick}
                />
              }
            </>
          }
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <a href="https://github.com/PengChen96/ajax-tools" target="_blank" rel="noreferrer" style={{ marginRight: 12 }}>
            <GithubOutlined style={{ color: '#000' }} title="GitHub"/>
          </a>
          <Switch
            checkedChildren="Light Mode"
            unCheckedChildren="Dark Mode"
            checked={ajaxToolsSkin}
            onChange={(value) => {
              setAjaxToolsSkin(value);
              chrome.storage.local.set({ ajaxToolsSkin: value });
            }}
          />
          <CodeOutlined
            title="Open a new tab"
            onClick={openTabs}
            style={{ marginLeft: 8 }}
          />
        </div>
      </header>
      <nav className="ajax-tools-iframe-action">
        <Button size="small" type="primary" onClick={onGroupAdd}>Add Group</Button>
        <div>
          <Checkbox
            defaultChecked
            checked={ajaxToolsSwitchOnNot200}
            onChange={(e) => {
              setAjaxToolsSwitchOnNot200(e.target.checked);
              chrome.storage.local.set({ ajaxToolsSwitchOnNot200: e.target.checked });
            }}
            style={{ filter: ajaxToolsSwitchOn ? undefined : 'opacity(0.5)' }}
          >
            <span title="Change the request status from 404/500 to 200">Non-200</span>
          </Checkbox>
          <Switch
            defaultChecked
            checkedChildren="Turn on"
            unCheckedChildren="Turn off"
            checked={ajaxToolsSwitchOn}
            onChange={(value) => {
              setAjaxToolsSwitchOn(value);
              chrome.storage.local.set({ ajaxToolsSwitchOn: value });
            }}
          />
        </div>
      </nav>
      <main
        className="ajax-tools-iframe-body"
        style={{ filter: ajaxToolsSwitchOn ? undefined : 'opacity(0.5)' }}
      >
        {
          ajaxDataList.map((item, index) => {
            const { summaryText, headerClass, interfaceList = [] } = item;
            return <div key={index}>
              <div className={`ajax-tools-iframe-body-header ${headerClass}`}>
                <Input
                  value={summaryText}
                  className={`ajax-tools-iframe-body-header-input ${headerClass}`}
                  onChange={(e) => onGroupSummaryTextChange(e, index)}
                />
                <CloseOutlined
                  title="Delete group"
                  style={{ fontSize: 12 }}
                  onClick={() => onGroupDelete(index)}
                />
              </div>
              <Collapse
                className="ajax-tools-iframe-collapse"
                defaultActiveKey={['1']}
                activeKey={item.collapseActiveKeys}
                onChange={(keys) => onCollapseChange(index, keys)}
                style={{ borderRadius: 0 }}
              >
                {
                  interfaceList.map((v, i) => {
                    return <Panel
                      key={v.key}
                      header={
                        <div onClick={e => e.stopPropagation()}>
                          <div style={{
                            display: 'inline-grid',
                            width: 'calc(100vw - 160px)'
                          }}>
                            <Input
                              value={v.request}
                              onChange={(e) => onInterfaceListChange(index, i, 'request', e.target.value)}
                              placeholder="Please enter the matching interface"
                              size="small"
                              addonBefore={
                                <Input.Group compact>
                                  <Select
                                    value={v.matchType}
                                    onChange={(value) => onInterfaceListChange(index, i, 'matchType', value)}
                                  >
                                    <Select.Option value="normal">Normal Match</Select.Option>
                                    <Select.Option value="regex">Regex Match</Select.Option>
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
                              placeholder="Remark（Editable）"
                              size="small"
                              className="ajax-tools-iframe-request-des-input"
                            />
                          </div>
                        </div>
                      }
                      extra={genExtra(index, i, v)}
                    >

                      <div style={{ position: 'relative', marginBottom: 8 }}>
                        <TextArea
                          rows={2}
                          value={v.headers}
                          onChange={(e) => onInterfaceListChange(index, i, 'headers', e.target.value)}
                          placeholder='Headers.  eg: { "Content-Type": "application/json" }'
                        />
                        <FormOutlined
                          className="ajax-tools-textarea-edit"
                          onClick={() => modifyDataModalRef.current.openModal({
                            groupIndex: index,
                            interfaceIndex: i,
                            activeTab: 'Headers',
                            request: v.request,
                            headersText: v.headers,
                            responseLanguage: v.language,
                            responseText: v.responseText
                          })}
                        />
                      </div>
                      <div style={{ position: 'relative' }}>
                        <TextArea
                          rows={4}
                          value={v.responseText}
                          onChange={(e) => onInterfaceListChange(index, i, 'responseText', e.target.value)}
                          placeholder='Response.  eg: { "status": 200, "response": "OK" }'
                        />
                        <FormOutlined
                          className="ajax-tools-textarea-edit"
                          onClick={() => modifyDataModalRef.current.openModal({
                            groupIndex: index,
                            interfaceIndex: i,
                            activeTab: 'Response',
                            request: v.request,
                            headersText: v.headers,
                            responseLanguage: v.language,
                            responseText: v.responseText
                          })}
                        />
                      </div>
                    </Panel>;
                  })
                }
              </Collapse>
              <div className="ajax-tools-iframe-body-footer">
                <Button
                  size="small"
                  type="primary"
                  shape="circle"
                  icon={<PlusOutlined/>}
                  title="Add Interface"
                  onClick={() => onInterfaceListAdd(index)}
                />
              </div>
            </div>;
          })
        }
        {
          ajaxDataList.length < 1 && <Result
            icon={<DropboxOutlined style={{ color: '#c1d0dd' }}/>}
            title={'Ohhh... nothing here'}
            subTitle={<>
                Create a rule by clicking the <Button size="small" type="primary" onClick={onGroupAdd}>Add Group</Button> button
            </>}
          />
        }
      </main>
      <ModifyDataModal
        ref={modifyDataModalRef}
        onSave={onInterfaceListSave}
      />
    </div>
  );
}

export default App;
