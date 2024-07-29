import React from 'react';
import { Button, Dropdown, MenuProps, Switch } from 'antd';
import { MinusOutlined, FormOutlined, ToTopOutlined, MoreOutlined } from '@ant-design/icons';
import { AjaxDataListObject, DefaultInterfaceObject } from '../../common/value';

interface PanelExtraProps {
  groupIndex: number;
  interfaceIndex: number;
  v: DefaultInterfaceObject;
  ajaxDataList: AjaxDataListObject[];
  modifyDataModalRef: any;
  onInterfaceMove: (groupIndex: number, interfaceIndex: number, placement: string) => void;
  onInterfaceListChange: (groupIndex: number, interfaceIndex: number, key: string, value: string | boolean) => void;
  onInterfaceListDelete: (groupIndex: number, key: string) => void;
}

const PanelExtra = (props: PanelExtraProps) => {
  const {
    groupIndex,
    interfaceIndex,
    ajaxDataList,
    modifyDataModalRef,
    onInterfaceMove,
    onInterfaceListChange,
    onInterfaceListDelete,
    v } = props;
  const { interfaceList = [] } = ajaxDataList[groupIndex];
  const items: MenuProps['items'] = [
    {
      key: '0',
      label: 'Edit data',
      icon: <FormOutlined style={{ fontSize: 14 }} />,
      onClick: () => modifyDataModalRef.current.openModal({
        groupIndex,
        interfaceIndex,
        activeTab: 'Response',
        request: v.request,
        replacementMethod: v.replacementMethod,
        replacementUrl: v.replacementUrl,
        replacementStatusCode: v.replacementStatusCode,
        headersText: v.headers,
        requestPayloadText: v.requestPayloadText,
        responseLanguage: v.language,
        responseText: v.responseText
      })
    },
    {
      key: '1',
      label: 'Move to top',
      icon: <ToTopOutlined style={{ fontSize: 14 }} />,
      onClick: () => onInterfaceMove( groupIndex, interfaceIndex, 'top'),
      disabled: interfaceIndex === 0
    },
    {
      key: '2',
      label: 'Move to bottom',
      icon: <ToTopOutlined style={{ transform: 'rotateZ(180deg)', fontSize: 14 }}/>,
      onClick: () => onInterfaceMove(groupIndex, interfaceIndex, 'bottom'),
      disabled: interfaceIndex === interfaceList.length - 1
    },
  ];

  return (<div onClick={(event) => event.stopPropagation()} style={{ display: 'flex', alignItems: 'center', height: 24 }}>
    <Switch
      title={v.open ? 'Disable Extension' : 'Enable Extension'}
      checked={v.open}
      onChange={(value) => onInterfaceListChange(groupIndex, interfaceIndex, 'open', value)}
      size="small"
      style={{ margin: '0 4px' }}
    />
    <Button
      danger
      size="small"
      type="primary"
      shape="circle"
      icon={<MinusOutlined/>}
      title="Delete Interface"
      onClick={() => onInterfaceListDelete(groupIndex, v.key)}
      style={{ minWidth: 16, width: 16, height: 16 }}
    />
    <Dropdown
      menu={{ items }}
      trigger={['click']}
    >
      <MoreOutlined title="More" style={{ marginLeft: 4, fontSize: 18 }}/>
    </Dropdown>
  </div>);
};

export default PanelExtra;