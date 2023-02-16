import React, {useEffect, useRef, useState} from 'react';
import {VTablePro} from 'virtualized-table';
import {Button, Input, Modal, Radio, Space} from 'antd';
import {FilterOutlined, PauseCircleFilled, PlayCircleTwoTone, StopOutlined} from '@ant-design/icons';
import 'antd/dist/antd.css';
import './App.css';
import RequestDrawer from "./RequestDrawer";

const getColumns = ({
                      onAddInterceptorClick,
                      onRequestUrlClick
                    }) => {
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
      style: {padding: '0 4px'},
      render: (value, record) => {
        let name = record.request.url.match('[^/]+(?!.*/)');
        return <span
          className="ajax-tools-devtools-text-btn"
          title={record.request.url}
          onClick={() => onRequestUrlClick(record)}
        >
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
            className="ajax-tools-devtools-text-btn"
            title="Add requests to be intercepted"
            onClick={() => onAddInterceptorClick(record)}
          />
        </>
      }
    }
  ]
};

export default () => {
  const requestFinishedRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [uNetwork, setUNetwork] = useState([]);
  const [filterKey, setFilterKey] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currRecord, setCurrRecord] = useState(null);

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
          addInterceptor({ajaxDataList, groupIndex, request, responseText});
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
      title: 'Which group to add to',
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
    // 发送给iframe(src/App.jsx)侧边页面，更新ajaxDataList
    chrome.runtime.sendMessage(chrome.runtime.id, {
      type: 'ajaxTools_updatePage',
      to: 'mainSettingSidePage',
      ajaxDataList
    });
  }
  const onRequestUrlClick = (record) => {
    setCurrRecord(record);
    setDrawerOpen(true);
  }
  const columns = getColumns({
    onAddInterceptorClick,
    onRequestUrlClick,
  });
  return <div>
    <div className="ajax-tools-devtools-action-bar">
      <Button
        type="text"
        shape="circle"
        danger={recording}
        title={recording ? 'Stop recording network log' : 'Record network log'}
        icon={recording ? <PauseCircleFilled/> : <PlayCircleTwoTone/>}
        onClick={() => setRecording(!recording)}
      />
      <Button
        type="text"
        shape="circle"
        title="Clear"
        icon={<StopOutlined/>}
        onClick={() => setUNetwork([])}
      />
      <Input
        placeholder="Filter"
        size="small"
        style={{width: 160, marginLeft: 16}}
        onChange={(e) => setFilterKey(e.target.value)}
      />
    </div>
    <VTablePro
      bordered
      headerNotSticky
      columns={columns}
      dataSource={uNetwork.filter((v) => v.request.url.toLocaleLowerCase().includes(filterKey.toLocaleLowerCase()))}
      visibleHeight={window.innerHeight - 50}
      rowHeight={24}
      estimatedRowHeight={24}
      locale={{
        emptyText: <div style={{textAlign: 'center'}}>
          <p>Recording network activity... </p>
          <p>Click Record, and then Perform a request or hit <strong>⌘ R</strong> to record the load.</p>
        </div>
      }}
    />
    <RequestDrawer
      record={currRecord}
      drawerOpen={drawerOpen}
      onAddInterceptorClick={onAddInterceptorClick}
      onClose={() => setDrawerOpen(false)}
    />
  </div>;
}

