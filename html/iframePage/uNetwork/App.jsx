import React, {useEffect, useRef, useState} from 'react';
import {VTablePro} from 'virtualized-table';

import './app.css';

const getColumns = () => {
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
      title: '操作',
      dataIndex: 'operate',
      width: 60,
      align: 'center',
      render: (value, record) => {
        return <div
          onClick={() => {
            record.getContent((content) => {
              console.log(content);
            })
          }}
        >
          操作
        </div>
      }
    }
  ]
};

export default () => {
  const [recording, setRecording] = useState(false);
  const [uNetwork, setUNetwork] = useState([]);
  const requestFinishedRef = useRef(null);

  const setUNetworkData = function (request) {
    // request.getContent((content) => {
    //   request.responseContent = content;
    uNetwork.push(request);
    setUNetwork([...uNetwork]);
    // })
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

  return <div>
    <button onClick={() => setRecording(!recording)}>{recording ? '记录中' : '记录'}</button>
    <button onClick={() => console.log(uNetwork)}>打印</button>
    <button onClick={() => setUNetwork([])}>清空</button>
    <VTablePro
      bordered
      columns={getColumns()}
      dataSource={uNetwork}
      rowHeight={24}
      estimatedRowHeight={24}
    />
  </div>;
}

