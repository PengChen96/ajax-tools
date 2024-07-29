
import React, { useEffect, useState } from 'react';
import {  Checkbox, Switch, Dropdown, Space } from 'antd';
import {  UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import './index.css';
import { exportJSON } from './../../main/utils/exportJson';
import { popupWindow } from './../../main/utils/pictureInPicture';
import { AjaxDataListObject } from '../../common/value';


interface ModifyNavProps {
  onGroupAdd: () => void;
  ajaxToolsSwitchOn: boolean;
  updateAjaxToolsSwitchOn: (value: boolean) => void;
  ajaxDataList: AjaxDataListObject[];
  onImportClick: () => void;
}

/** 导航栏 */
const ModifyNav = (props: ModifyNavProps) => {

  const { onGroupAdd, onImportClick, ajaxDataList, ajaxToolsSwitchOn, updateAjaxToolsSwitchOn } = props;

  const [ajaxToolsSwitchOnNot200, setAjaxToolsSwitchOnNot200] = useState(true); // 默认开启

  useEffect(() => {
    if (chrome.storage) {
      chrome.storage.local.get(['ajaxToolsSwitchOnNot200'], (result) => {
        const { ajaxToolsSwitchOnNot200 = true,  } = result;
        setAjaxToolsSwitchOnNot200(ajaxToolsSwitchOnNot200);
      });
    }
  }, []);


  const inIframe = top?.location !== self.location;
  return (
    <nav className="ajax-tools-iframe-action">
      <Space>
        <Dropdown.Button
          size="small"
          type="primary"
          onClick={onGroupAdd}
          menu={{
            items: [
              {
                key: '1',
                label: 'Import',
                icon: <UploadOutlined style={{ fontSize: 14 }} />,
                onClick: onImportClick
              },
              {
                key: '2',
                label: 'Export',
                icon: <DownloadOutlined style={{ fontSize: 14 }} />,
                onClick: () => exportJSON(`AjaxInterceptorData_${JSON.stringify(new Date())}`, ajaxDataList),
                disabled: ajaxDataList.length < 1
              },
            ]
          }}>
        Add Group
        </Dropdown.Button>
      </Space>
      <div>
        <Checkbox
          defaultChecked
          checked={ajaxToolsSwitchOnNot200}
          onChange={(e) => {
            if(!chrome.storage) return;
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
            if(!chrome.storage) return;
            updateAjaxToolsSwitchOn(value);
            chrome.storage.local.set({ ajaxToolsSwitchOn: value });
          }}
        />
        {
          inIframe ? null : <i
            className="c-iconfont c-icon-zoomout"
            title="Picture in picture"
            style={{ marginLeft: 12, cursor: 'pointer' }}
            onClick={() => popupWindow({ url: chrome.runtime.getURL('html/iframePage/dist/index.html') })}
          />
        }
      </div>
    </nav>
  );
};

export default ModifyNav;
