import {useEffect, useState} from 'react'
import {Button, Collapse, Input, Switch} from "antd";
import {CloseOutlined, FullscreenOutlined, MinusOutlined, PlusOutlined, SettingOutlined} from '@ant-design/icons';
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
    open: true,
    request: '',
    responseText: ''
  };
  const [ajaxToolsSwitchOn, setAjaxToolsSwitchOn] = useState(true); // 默认开启
  const [zoom, setZoom] = useState('out'); // 默认缩小
  const [ajaxDataList, setAjaxDataList] = useState([
    {
      summaryText: '登录相关',
      collapseActiveKeys: ['1'],
      headerClass: 'ajax-tools-color-volcano',
      interfaceList: [
        {
          open: true,
          request: '/ptsweb/calculate/pageSalaryOverview',
          responseText: '{"head":{"code":"00000000","description":"成功","msg":"成功","time":"2022-06-27 20:12:37","status":"Y"},"body":{"list":[{"customerId":1888146079963,"customerNo":null,"name":"王周秦测试","taxNo":null,"areaCode":null,"accessible":true,"multiDept":false,"label":null,"virtual":false,"auditStatus":3,"empCount":0,"totalIncome":0,"totalRefundTax":0,"totalActualIncome":0,"uploadState":"1","uploadCount":null,"completeState":"1","deptList":null}],"total":1}}'
        }
      ]
    },
  ]);

  useEffect(() => {
    if (chrome.storage) {
      chrome.storage.local.get(['ajaxDataList', 'ajaxToolsSwitchOn'], (result) => {
        const {ajaxDataList = [], ajaxToolsSwitchOn = true} = result;
        if (ajaxDataList.length > 0) {
          setAjaxDataList(ajaxDataList);
        }
        setAjaxToolsSwitchOn(ajaxToolsSwitchOn);
      });
    }
  }, []);

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
              // iframeVisible = response.nextIframeVisible;
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
      summaryText: '分组名称',
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

  // 收缩分组
  const onCollapseChange = (index, keys) => {
    console.log(keys);
    ajaxDataList[index].collapseActiveKeys = keys;
    setAjaxDataList([...ajaxDataList]);
  };

  // interfaceList值变化
  const onInterfaceListChange = (index1, index2, key, value) => {
    ajaxDataList[index1].interfaceList[index2][key] = value;
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ajaxDataList}, function () {
      // console.log(`${key}: ${value}`);
    });
  }
  const onInterfaceListAdd = (index1) => {
    const length = ajaxDataList[index1].interfaceList.length;
    ajaxDataList[index1].collapseActiveKeys.push(String(length + 1));
    ajaxDataList[index1].interfaceList.push({...defaultInterface});
    setAjaxDataList([...ajaxDataList]);
  }
  const onInterfaceListDelete = (index1, index2) => {
    console.log(index1, ajaxDataList);
    ajaxDataList[index1].collapseActiveKeys = ajaxDataList[index1].collapseActiveKeys.filter((_, i) => i !== index2 + 1);
    ajaxDataList[index1].interfaceList = ajaxDataList[index1].interfaceList.filter((_, i) => i !== index2);
    setAjaxDataList([...ajaxDataList]);
    chrome.storage.local.set({ajaxDataList});
  }

  const genExtra = () => (
    <SettingOutlined
      onClick={(event) => {
        // If you don't want click extra trigger collapse, you can prevent this:
        event.stopPropagation();
      }}
    />
  );

  return (
    <div className="ajax-tools-iframe-container">
      <div className="ajax-tools-iframe-header">
        {
          zoom === 'out' ? <MinusOutlined
            title="缩小"
            onClick={onZoomClick}
          /> : <FullscreenOutlined
            title="放大"
            onClick={onZoomClick}
          />
        }
        <CloseOutlined
          title="关闭"
          onClick={onCloseClick}
        />
      </div>
      <div className="ajax-tools-iframe-action">
        <Button size="small" type="primary" onClick={onGroupAdd}>新增分组</Button>
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
      <div className="ajax-tools-iframe-body">
        {
          ajaxDataList.map((item, index) => {
            const {summaryText, headerClass, interfaceList = []} = item;
            return <>
              <div className={`ajax-tools-iframe-body-header ${headerClass}`}>
                <div>{summaryText}</div>
                <CloseOutlined
                  title="删除分组"
                  style={{fontSize: 12}}
                  onClick={() => onGroupDelete(index)}
                />
              </div>
              <Collapse
                defaultActiveKey={['1']}
                activeKey={item.collapseActiveKeys}
                onChange={(keys) => onCollapseChange(index, keys)}
                style={{borderRadius: 0}}
              >
                {
                  interfaceList.map((v, i) => {
                    return <Panel
                      key={String(i + 1)}
                      header={
                        <div onClick={e => e.stopPropagation()}>
                          <Input
                            value={v.request}
                            onChange={(e) => onInterfaceListChange(index, i, 'request', e.target.value)}
                            placeholder="请输入匹配接口"
                            size="small"
                            style={{width: 280}}
                          />
                          <Switch
                            checked={v.open}
                            onChange={(value) => onInterfaceListChange(index, i, 'open', value)}
                            size="small"
                            style={{margin: "0 4px"}}
                          />
                          <Button
                            size="small"
                            type="primary"
                            shape="circle"
                            icon={<MinusOutlined/>}
                            title="删除接口"
                            onClick={() => onInterfaceListDelete(index, i)}
                            style={{minWidth: 16, width: 16, height: 16}}
                          />
                        </div>
                      }
                      extra={genExtra()}
                    >
                      <TextArea
                        rows={4}
                        value={v.responseText}
                        onChange={(e) => onInterfaceListChange(index, i, 'responseText', e.target.value)}
                        placeholder="response text"
                      />
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
