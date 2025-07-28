
import React, { useRef, useState } from 'react';
import { Button, Collapse, Input, Select, Switch, Dropdown, Space } from 'antd';
import {  PlusOutlined, FormOutlined, MoreOutlined, RightOutlined, DeleteOutlined, ToTopOutlined } from '@ant-design/icons';
import ModifyDataModal, { ModifyDataModalOnSaveProps } from './components/ModifyDataModal';
import {
  defaultInterface,
  defaultAjaxDataList,
  HTTP_METHOD_MAP,
} from '../common/value';
import 'antd/dist/antd.css';
import './App.css';
import { openImportJsonModal } from './utils/importJson';
import Footer from './components/Footer';
import ModifyNav from './components/ModifyNav';
  
import PanelExtra from './components/PanelExtra';
import RenderWrapper from './components/RenderWrapper';

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

  const [ajaxToolsSkin, setAjaxToolsSkin] = useState('light');
  const [ajaxToolsSwitchOn, setAjaxToolsSwitchOn] = useState(true); // 默认开启
  const [ajaxDataList, setAjaxDataList] = useState(defaultAjaxDataList);
  const [isRegistry, setIsRegistry] = useState(false);

  if (chrome.storage && chrome.runtime && !isRegistry) {
    setIsRegistry(true);
    console.log('ajax interceptor iframe 已开启监听');
    chrome.storage.local.get(['ajaxDataList', 'ajaxToolsSwitchOn', 'ajaxToolsSkin'], (result) => {
      const { ajaxDataList = [], ajaxToolsSwitchOn = true, ajaxToolsSkin = 'light' } = result;
      if (ajaxDataList.length > 0) {
        setAjaxDataList(ajaxDataList);
      }
      setAjaxToolsSwitchOn(ajaxToolsSwitchOn);
      setAjaxToolsSkin(ajaxToolsSkin);
    });
    // 接收uNetwork/App.jsx发来的数据（在uNetWork面板中可以添加拦截数据更新页面）
    chrome.runtime.onMessage.addListener((request) => {
      const { type, to, ajaxDataList } = request;
      if (type === 'ajaxTools_updatePage' && to === 'mainSettingSidePage') {
        // console.log('【main/App.jsx】<-【uNetwork】Receive message:', request);
        setAjaxDataList(ajaxDataList);
        chrome.storage.local.set({ ajaxDataList });
      }
    });
  }

  const onImportClick = async () => {
    if (!chrome.storage) return;
    const importJsonData = await openImportJsonModal();
    let newAjaxDataList = ajaxDataList;
    if (Array.isArray(importJsonData)) {
      newAjaxDataList = [...ajaxDataList, ...importJsonData];
    }
    setAjaxDataList(newAjaxDataList);
    chrome.storage.local.set({ ajaxDataList: newAjaxDataList });
  };
  // 新增分组
  const onGroupAdd = () => {
    if (!chrome.storage) return;
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
    if (!chrome.storage) return;
    const newAjaxDataList = ajaxDataList.filter((_, i) => i !== groupIndex);
    setAjaxDataList([...newAjaxDataList]);
    chrome.storage.local.set({ ajaxDataList: newAjaxDataList });
  };
  // placement: top|bottom
  const onGroupMove = (groupIndex: number, placement: string) => {
    if (!chrome.storage) return;
    const movedItem = ajaxDataList.splice(groupIndex, 1)[0];
    if (placement === 'top') {
      ajaxDataList.unshift(movedItem);
    } else if (placement === 'bottom') {
      ajaxDataList.push(movedItem);
    }
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ ajaxDataList });
  };
  const onGroupSummaryTextChange = (e: React.ChangeEvent<HTMLInputElement>, groupIndex: number) => {
    if (!chrome.storage) return;
    ajaxDataList[groupIndex].summaryText = e.target.value;
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ ajaxDataList });
  };
  // 收缩分组 折叠全部keys传[]
  const onCollapseChange = (groupIndex: number, keys: string | string[]) => {
    if (!chrome.storage) return;
    ajaxDataList[groupIndex].collapseActiveKeys = Array.isArray(keys) ? keys : [keys];
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ ajaxDataList });
  };
  const onGroupOpenChange = (groupIndex: number, open: boolean) => {
    if (!chrome.storage) return;
    ajaxDataList[groupIndex].interfaceList = ajaxDataList[groupIndex].interfaceList.map((v) => {
      v.open = open;
      return v;
    });
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ ajaxDataList });
  };

  // interfaceList值变化
  const onInterfaceListChange = (groupIndex: number, interfaceIndex: number, key: string, value: string | boolean) => {
    if (!chrome.storage) return;
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
    if (!chrome.storage) return;
    const key = String(Date.now());
    ajaxDataList[groupIndex].collapseActiveKeys.push(key);
    const interfaceItem = { ...defaultInterface };
    interfaceItem.key = key;
    ajaxDataList[groupIndex].interfaceList.push(interfaceItem);
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ ajaxDataList });
  };
  const onInterfaceListDelete = (groupIndex: number, key: string) => {
    if (!chrome.storage) return;
    ajaxDataList[groupIndex].collapseActiveKeys = ajaxDataList[groupIndex].collapseActiveKeys.filter((activeKey) => activeKey !== key);
    ajaxDataList[groupIndex].interfaceList = ajaxDataList[groupIndex].interfaceList.filter((v) => v.key !== key);
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ ajaxDataList });
  };
  const onInterfaceListSave = (
    { groupIndex, interfaceIndex, replacementMethod, replacementUrl, replacementStatusCode, headersEditorValue,
      requestPayloadEditorValue, responseEditorValue, language } : ModifyDataModalOnSaveProps
  ) => {
    if (replacementMethod !== undefined) onInterfaceListChange(groupIndex, interfaceIndex, 'replacementMethod', replacementMethod);
    if (replacementUrl !== undefined) onInterfaceListChange(groupIndex, interfaceIndex, 'replacementUrl', replacementUrl);
    if (replacementStatusCode !== undefined) onInterfaceListChange(groupIndex, interfaceIndex, 'replacementStatusCode', replacementStatusCode);
    if (headersEditorValue !== undefined) onInterfaceListChange(groupIndex, interfaceIndex, 'headers', headersEditorValue);
    if (requestPayloadEditorValue !== undefined) onInterfaceListChange(groupIndex, interfaceIndex, 'requestPayloadText', requestPayloadEditorValue);
    if (responseEditorValue !== undefined) onInterfaceListChange(groupIndex, interfaceIndex, 'responseText', responseEditorValue);
    if (language !== undefined) onInterfaceListChange(groupIndex, interfaceIndex, 'language', language);
  };
  // placement: top|bottom
  const onInterfaceMove = (groupIndex: number, interfaceIndex: number, placement: string ) => {
    if (!chrome.storage) return;
    const { interfaceList = [] } = ajaxDataList[groupIndex];
    const movedItem = interfaceList.splice(interfaceIndex, 1)[0];
    if (placement === 'top') {
      interfaceList.unshift(movedItem);
    } else if (placement === 'bottom') {
      interfaceList.push(movedItem);
    }
    ajaxDataList[groupIndex].interfaceList = interfaceList;
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ ajaxDataList });
  };

  return (
    <div
      className="ajax-tools-iframe-container"
      style={{
        filter: ajaxToolsSkin === 'dark' ? 'invert(1)' : undefined
      }}
    >
      <ModifyNav 
        ajaxToolsSwitchOn={ajaxToolsSwitchOn} 
        updateAjaxToolsSwitchOn={(value) => {
          setAjaxToolsSwitchOn(value);
        }} 
        onGroupAdd={onGroupAdd}
      />

      <RenderWrapper ajaxDataList={ajaxDataList} onGroupAdd={onGroupAdd} onImportClick={onImportClick}>
        <main
          className="ajax-tools-iframe-body"
          style={{ filter: ajaxToolsSwitchOn ? undefined : 'opacity(0.5)' }}
        >
          {
            ajaxDataList.map((item, index) => {
              const { summaryText, headerClass, interfaceList = [], collapseActiveKeys = [] } = item;
              const groupOpen = !!interfaceList.find(v => v.open);
              const fold = collapseActiveKeys.length < 1;
              return <div key={index}>
                <div className={`ajax-tools-iframe-body-header ${headerClass}`}>
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    title="Collapse All"
                    icon={<RightOutlined style={{ transform: fold ? undefined : 'rotateZ(90deg)', transition: '.3s' }}/>}
                    onClick={() => {
                      if (fold) { // 当前折叠要展开
                        const allKeys = interfaceList.map(v => v.key);
                        onCollapseChange(index, allKeys);
                      } else {
                        onCollapseChange(index, []);
                      }
                    }}
                  />
                  <Input
                    value={summaryText}
                    className={`ajax-tools-iframe-body-header-input ${headerClass}`}
                    onChange={(e) => onGroupSummaryTextChange(e, index)}
                  />
                  <Switch
                    title={groupOpen ? 'Disable group' : 'Enable group'}
                    checked={groupOpen}
                    onChange={(open) => onGroupOpenChange(index, open)}
                    size="small"
                  />

                  <Button 
                    danger
                    type="primary" size='small' shape="circle" 
                    style={{ minWidth: 16, width: 16, height: 16, margin: '0 10px 0 4px' }}
                    onClick= {() => onGroupDelete(index)}
                    icon={<DeleteOutlined style={{ color: '#fff', fontSize: '12px' }}/>} />
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: '0',
                          label: 'Move to top',
                          icon: <ToTopOutlined style={{ fontSize: 14 }} />,
                          onClick: () => onGroupMove(index, 'top'),
                          disabled: index === 0
                        },
                        {
                          key: '1',
                          label: 'Move to bottom',
                          icon: <ToTopOutlined style={{ transform: 'rotateZ(180deg)', fontSize: 14 }}/>,
                          onClick: () => onGroupMove(index, 'bottom'),
                          disabled: index === ajaxDataList.length - 1
                        },
                      ]
                    }}
                    trigger={['click']}
                  >
                    <Button
                      type="text"
                      shape="circle"
                      size="small"
                      title="More"
                      icon={<MoreOutlined style={{ fontSize: 22 }}/>}
                    />
                  </Dropdown>
                </div>
                {!fold && 
              (<>
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
                                  <Space.Compact>
                                    <Select
                                      value={v.matchType}
                                      onChange={(value) => onInterfaceListChange(index, i, 'matchType', value)}
                                    >
                                      <Select.Option value="normal">Normal</Select.Option>
                                      <Select.Option value="regex">Regex</Select.Option>
                                    </Select>
                                    <Select
                                      dropdownMatchSelectWidth={false}
                                      value={v.matchMethod}
                                      onChange={(value) => onInterfaceListChange(index, i, 'matchMethod', value)}
                                    >
                                      <Select.Option value="">*(any)</Select.Option>
                                      { HTTP_METHOD_MAP.map((method) => <Select.Option key={method} value={method}>{method}</Select.Option>) }
                                    </Select>
                                  </Space.Compact>
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
                        extra={<PanelExtra 
                          groupIndex={index} 
                          interfaceIndex={i} 
                          ajaxDataList={ajaxDataList} 
                          modifyDataModalRef={modifyDataModalRef}
                          onInterfaceMove={onInterfaceMove}
                          onInterfaceListChange={onInterfaceListChange}
                          onInterfaceListDelete={onInterfaceListDelete} 
                          v={v}/>}
                      >
                        <div style={{ position: 'relative' }}>
                          <TextArea
                            rows={4}
                            value={v.responseText}
                            onChange={(e) => onInterfaceListChange(index, i, 'responseText', e.target.value)}
                            placeholder='Response  e.g. { "status": 200, "response": "OK" }'
                          />
                          <FormOutlined
                            title="Edit"
                            className="ajax-tools-textarea-edit"
                            onClick={() => modifyDataModalRef.current.openModal({
                              groupIndex: index,
                              interfaceIndex: i,
                              activeTab: 'Response',
                              request: v.request,
                              replacementMethod: v.replacementMethod,
                              replacementUrl: v.replacementUrl,
                              replacementStatusCode: v.replacementStatusCode,
                              headersText: v.headers,
                              requestPayloadText: v.requestPayloadText,
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
              </>)}
              </div>;
            })
          }
        </main>
      </RenderWrapper>
      <Footer/>
      <ModifyDataModal
        ref={modifyDataModalRef}
        onSave={onInterfaceListSave}
      />
    </div>
  );
}

export default App;
