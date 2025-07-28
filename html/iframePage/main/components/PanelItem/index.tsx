import React from 'react';
import { Button, Collapse, Dropdown, Input, Select, Space, Switch } from 'antd';
import {  PlusOutlined, FormOutlined, MoreOutlined, RightOutlined, DeleteOutlined, ToTopOutlined } from '@ant-design/icons';

import './index.css';
import PanelExtra from '../PanelExtra';
import { HTTP_METHOD_MAP } from '../../../common/value';

const { Panel } = Collapse;
const { TextArea } = Input;

const PanelItem =    ({ fold, index, groupOpen, summaryText, headerClass, interfaceList, ajaxDataList, collapseActiveKeys, modifyDataModalRef, onGroupMove, onGroupDelete, onCollapseChange, onInterfaceListAdd, onGroupOpenChange, onGroupSummaryTextChange, onInterfaceListDelete, onInterfaceMove, onInterfaceListChange }:any) => {
  return (
    <div key={index}>
      <div className={`ajax-tools-iframe-body-header ${headerClass}`}>
        <Button
          type="text"
          shape="circle"
          size="small"
          title="Collapse All"
          icon={<RightOutlined style={{ transform: fold ? undefined : 'rotateZ(90deg)', transition: '.3s' }}/>}
          onClick={() => {
            if (fold) { // 当前折叠要展开
              const allKeys = interfaceList.map((v:any) => v.key);
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
                  activeKey={collapseActiveKeys}
                  onChange={(keys) => onCollapseChange(index, keys)}
                  style={{ borderRadius: 0 }}
                >
                  {
                    interfaceList.map((v:any, i:number) => {
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
    </div>
  );
};

export default PanelItem;