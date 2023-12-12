import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import { VTablePro } from 'virtualized-table';
import { Button, Input, Modal, Radio, Space } from 'antd';
import { FilterOutlined, PauseCircleFilled, PlayCircleTwoTone, StopOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import './App.css';
import RequestDrawer from './RequestDrawer';
import { defaultInterface, AjaxDataListObject, DefaultInterfaceObject } from '../common/value';

interface AddInterceptorParams {
  ajaxDataList: AjaxDataListObject[],
  iframeVisible?: boolean,
  groupIndex?: number,
  request: string,
  responseText: string
}

const getColumns = ({
  onAddInterceptorClick,
  onRequestUrlClick
} : {
  onAddInterceptorClick: (record: any) => void,
  onRequestUrlClick: (record: any) => void,
}) => {
  return [
    {
      title: 'Index',
      dataIndex: 'Index',
      width: 60,
      align: 'center',
      render: (value: any, record: any, index: any, realIndex: number) => realIndex + 1,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
      style: { padding: '0 4px' },
      render: (value: any, record: { request: { url: string }; }) => {
        const name = record.request.url.match('[^/]+(?!.*/)');
        return <span
          className="ajax-tools-devtools-text-btn"
          title={record.request.url}
          onClick={() => onRequestUrlClick(record)}
        >
          {name && name[0]}
        </span>;
      }
    },
    {
      title: 'Method',
      dataIndex: 'method',
      width: 60,
      align: 'center',
      render: (value: any, record: { request: { method: string }; }) => record.request.method,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 60,
      align: 'center',
      render: (value: any, record: { response: { status: string }; }) => record.response.status,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 60,
      align: 'center',
      render: (value: any, record: { _resourceType: string; }) => record._resourceType,
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
      render: (value: any, record: any) => {
        return <>
          <FilterOutlined
            className="ajax-tools-devtools-text-btn"
            title="Add request to be intercepted"
            onClick={() => onAddInterceptorClick(record)}
          />
        </>;
      }
    }
  ];
};

// "/^t.*$/" or "^t.*$" => new RegExp
const strToRegExp = (regStr: string) => {
  let regexp = new RegExp('');
  try {
    const regParts = regStr.match(new RegExp('^/(.*?)/([gims]*)$'));
    if (regParts) {
      regexp = new RegExp(regParts[1], regParts[2]);
    } else {
      regexp = new RegExp(regStr);
    }
  } catch (error) {
    console.error(error);
  }
  return regexp;
};
export default () => {
  const requestFinishedRef = useRef<any>(null);
  const [recording, setRecording] = useState(false);
  const [uNetwork, setUNetwork] = useState<any>([]);
  const [filterKey, setFilterKey] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currRecord, setCurrRecord] = useState(null);

  const setUNetworkData = function (request:any) {
    if (['fetch', 'xhr'].includes(request._resourceType)) {
      uNetwork.push(request);
      setUNetwork([...uNetwork]);
    }
  };
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

  const getChromeLocalStorage = (keys: string|string[]) => new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
  const onAddInterceptorClick = (
    record: {
      request: { url: string; };
      getContent: (arg0: (content: any) => void) => void;
    }
  ) => {
    const requestUrl = record.request.url.split('?')[0];
    const matchUrl = requestUrl.match('(?<=//.*/).+');
    if (record.getContent) {
      record.getContent((content) => {
        handleAddInterceptor({
          request: matchUrl && matchUrl[0] || '',
          responseText: content
        });
      });
    } else {
      handleAddInterceptor({
        request: matchUrl && matchUrl[0] || '',
        responseText: ''
      });
    }
  };
  const handleAddInterceptor = async (
    { request, responseText }: { request: string, responseText: string }
  ) => {
    try {
      const { ajaxDataList = [], iframeVisible }: AddInterceptorParams|any = await getChromeLocalStorage(['iframeVisible', 'ajaxDataList']);
      const interfaceList = ajaxDataList.flatMap((item: { interfaceList: DefaultInterfaceObject[]; }) => item.interfaceList || []);
      const hasIntercepted = interfaceList.some((v: { request: string | null; }) => v.request === request);
      if (hasIntercepted) {
        const confirmed = await new Promise((resolve) => {
          Modal.confirm({
            title: 'Request Already Intercepted',
            content: 'This request has already been intercepted. Do you want to add another interceptor?',
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
          });
        });
        if (confirmed) {
          await addInterceptorIfNeeded({ ajaxDataList, iframeVisible, request, responseText });
        }
      } else {
        await addInterceptorIfNeeded({ ajaxDataList, iframeVisible, request, responseText });
      }
    } catch(error) {
      console.error(error);
    }
  };
  const addInterceptorIfNeeded = async ({ ajaxDataList, iframeVisible, request, responseText }: AddInterceptorParams) => {
    if (ajaxDataList.length === 0) { // 首次，未添加过拦截接口
      ajaxDataList = [{
        summaryText: 'Group Name（Editable）',
        collapseActiveKeys: [],
        headerClass: 'ajax-tools-color-volcano',
        interfaceList: []
      }];
    }
    const groupIndex: any = ajaxDataList.length > 1 ? await showGroupModal({ ajaxDataList }) : 0;
    showSidePage(iframeVisible);
    addInterceptor({ ajaxDataList, groupIndex, request, responseText });
  };
  const showGroupModal = ({ ajaxDataList }: { ajaxDataList: AjaxDataListObject[] }) => new Promise((resolve) => {
    const SelectGroupContent = (props: { onChange: (arg0: any) => void; }) => {
      const [value, setValue] = useState(0);
      return <Radio.Group
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          props.onChange(e.target.value);
        }}
      >
        <Space direction="vertical">
          {ajaxDataList.map((v, index) => <Radio key={index} value={index}>Group {index + 1}：{v.summaryText}</Radio>)}
        </Space>
      </Radio.Group>;
    };
    let _groupIndex = 0;
    Modal.confirm({
      title: 'Which group to add to',
      content: <SelectGroupContent onChange={(value) => _groupIndex = value}/>,
      onOk: () => resolve(_groupIndex),
    });
  });
  const showSidePage = (iframeVisible: undefined | boolean) => {
    if (iframeVisible) { // 当前没展示，要展示
      chrome.tabs.query(
        { active: true, currentWindow: true },
        function (tabs) {
          const tabId = tabs[0]?.id;
          // 发送消息到content.js
          if (tabId) {
            chrome.tabs.sendMessage(
              tabId,
              { type: 'iframeToggle', iframeVisible },
              function (response) {
                // console.log('【uNetwork/App.jsx】->【content】【ajax-tools-iframe-show】Return message:', response);
                chrome.storage.local.set({ iframeVisible: response.nextIframeVisible });
              }
            );
          }
        }
      );
    }
  };
  const addInterceptor = (
    { ajaxDataList, groupIndex = 0, request, responseText }: AddInterceptorParams
  ) => {
    const key = String(Date.now());
    ajaxDataList[groupIndex]!.collapseActiveKeys.push(key);
    const interfaceObj: DefaultInterfaceObject = {
      ...defaultInterface,
      key,
      request,
      responseText,
    };
    ajaxDataList[groupIndex].interfaceList.push(interfaceObj);
    // 发送给iframe(src/App.jsx)侧边页面，更新ajaxDataList
    chrome.runtime.sendMessage(chrome.runtime.id, {
      type: 'ajaxTools_updatePage',
      to: 'mainSettingSidePage',
      ajaxDataList
    });
  };
  const onRequestUrlClick = (record: React.SetStateAction<null>) => {
    setCurrRecord(record);
    setDrawerOpen(true);
  };
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
        placeholder="Filter RegExp"
        size="small"
        style={{ width: 160, marginLeft: 16 }}
        onChange={(e) => setFilterKey(e.target.value)}
      />
    </div>
    <VTablePro
      bordered
      headerNotSticky
      columns={columns}
      dataSource={uNetwork.filter((v: { request: { url: string; }; }) => v.request.url.match(strToRegExp(filterKey)))}
      visibleHeight={window.innerHeight - 50}
      rowHeight={24}
      estimatedRowHeight={24}
      locale={{
        emptyText: <div style={{ textAlign: 'center' }}>
          <p>Recording network activity... </p>
          <p>Click Record, and then Perform a request or hit <strong>⌘ R</strong> to record the load.</p>
        </div>
      }}
    />
    {
      currRecord && <RequestDrawer
        record={currRecord}
        drawerOpen={drawerOpen}
        onAddInterceptorClick={onAddInterceptorClick}
        onClose={() => setDrawerOpen(false)}
      />
    }
  </div>;
};

