import React, {useEffect, useRef, useState} from 'react';
import {VTablePro} from 'virtualized-table';
import {Modal, Radio, Space} from 'antd';
import {FilterOutlined} from '@ant-design/icons';
import 'antd/dist/antd.css';
import './app.css';

const getColumns = ({onAddInterceptorClick}) => {
  return [
    {
      title: 'Index',
      dataIndex: 'Index',
      width: 60,
      align: 'center',
      render: (value, record, index, realIndex) => realIndex + 1,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
      render: (value, record) => {
        let name = record.request.url.match('[^/]+(?!.*/)');
        return <span title={record.request.url}>
          {name && name[0]}
        </span>
      }
    },
    {
      title: 'Method',
      dataIndex: 'method',
      width: 60,
      align: 'center',
      render: (value, record) => record.request.method,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 60,
      align: 'center',
      render: (value, record) => record.response.status,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 60,
      align: 'center',
      render: (value, record) => record._resourceType,
    },
    // { title: 'Initiator', dataIndex: 'initiator', width: 100 },
    // {
    //   title: 'Size',
    //   dataIndex: 'size',
    //   width: 60,
    //   render: (value, record) => record.response.bodySize,
    // },
    // { title: 'Time', dataIndex: 'time', width: 60 },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 60,
      align: 'center',
      render: (value, record) => {
        return <>
          <FilterOutlined
            title="添加拦截请求"
            onClick={() => onAddInterceptorClick(record)}
          />
        </>
      }
    }
  ]
};

export default () => {
  const [recording, setRecording] = useState(false);
  const [uNetwork, setUNetwork] = useState([]);
  const requestFinishedRef = useRef(null);

  const setUNetworkData = function (request) {
    if (['fetch', 'xhr'].includes(request._resourceType)) {
      uNetwork.push(request);
      setUNetwork([...uNetwork]);
    }
  }
  useEffect(() => {
    if (chrome.devtools) {
      if (recording) {
        requestFinishedRef.current = setUNetworkData;
        chrome.devtools.network.onRequestFinished.addListener(requestFinishedRef.current);
      } else {
        chrome.devtools.network.onRequestFinished.removeListener(requestFinishedRef.current);
      }
    }
  }, [recording]);
  useEffect(() => {
    if (chrome.devtools && recording && uNetwork.length < 1) {
      chrome.devtools.network.onRequestFinished.removeListener(requestFinishedRef.current);
      requestFinishedRef.current = setUNetworkData;
      chrome.devtools.network.onRequestFinished.addListener(requestFinishedRef.current);
    }
  }, [uNetwork]);

  const onAddInterceptorClick = (record) => {
    const requestUrl = record.request.url.split('?')[0];
    const matchUrl = requestUrl.match('(?<=//.*/).+');
    if (record.getContent) {
      record.getContent((content) => {
        handleAddInterceptor({
          request: matchUrl && matchUrl[0],
          responseText: content
        })
      })
    } else {
      handleAddInterceptor({
        request: matchUrl && matchUrl[0],
        responseText: ''
      })
    }
  }
  const handleAddInterceptor = ({request, responseText}) => {
    if (chrome.storage) {
      chrome.storage.local.get(['iframeVisible', 'ajaxDataList'], async (result) => {
        const {ajaxDataList = [], iframeVisible} = result;
        if (ajaxDataList.length > 1) { // 有多个分组，展示勾选分组弹框
          const groupIndex = await showGroupModal({ajaxDataList});
          showSidePage(iframeVisible);
          addInterceptor({ajaxDataList, groupIndex, request, responseText}); // todo 展示分组弹框
        } else if (ajaxDataList.length === 1) { // 存在一个分组
          showSidePage(iframeVisible);
          addInterceptor({ajaxDataList, request, responseText});
        } else { // 首次，未添加过拦截接口
          const defAjaxDataList = [{
            summaryText: '分组名称（可编辑）',
            collapseActiveKeys: [],
            headerClass: 'ajax-tools-color-volcano',
            interfaceList: []
          }];
          showSidePage(iframeVisible);
          addInterceptor({ajaxDataList: defAjaxDataList, request, responseText});
        }
      });
    }
  }
  const showGroupModal = ({ajaxDataList}) => new Promise((resolve) => {
    const SelectGroupContent = (props) => {
      const [value, setValue] = useState(0);
      return <Radio.Group
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          props.onChange(e.target.value);
        }}
      >
        <Space direction="vertical">
          {ajaxDataList.map((v, index) => <Radio value={index}>第{index + 1}组：{v.summaryText}</Radio>)}
        </Space>
      </Radio.Group>
    }
    let _groupIndex = 0;
    Modal.confirm({
      title: '添加到哪个分组',
      content: <SelectGroupContent onChange={(value) => _groupIndex = value}/>,
      onOk: () => resolve(_groupIndex),
    });
  })
  const showSidePage = (iframeVisible) => {
    if (iframeVisible) { // 当前没展示，要展示
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
    }
  }
  const addInterceptor = ({ajaxDataList, groupIndex = 0, request, responseText}) => {
    const key = String(Date.now());
    ajaxDataList[groupIndex].collapseActiveKeys.push(key);
    const interfaceObj = {
      key,
      open: true,
      matchType: 'normal', // normal regex
      matchMethod: '', // GET、POST、PUT、DELETE、HEAD、OPTIONS、CONNECT、TRACE、PATCH
      request,
      requestDes: '',
      responseText,
      language: 'json', // json javascript
    }
    ajaxDataList[groupIndex].interfaceList.push(interfaceObj);
    chrome.storage.local.set({ajaxDataList});
  }

  return <div>
    <button onClick={() => setRecording(!recording)}>{recording ? '记录中' : '记录'}</button>
    <button onClick={() => console.log(uNetwork)}>打印</button>
    <button onClick={() => setUNetwork([])}>清空</button>
    <VTablePro
      bordered
      headerNotSticky
      columns={getColumns({onAddInterceptorClick})}
      dataSource={uNetwork}
      visibleHeight={window.innerHeight - 50}
      rowHeight={24}
      estimatedRowHeight={24}
    />
  </div>;
}

