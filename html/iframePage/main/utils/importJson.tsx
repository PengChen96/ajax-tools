
import { Modal, Upload, notification, UploadProps, UploadFile } from 'antd';
import React, { useState } from 'react';
import { FileOutlined, InboxOutlined } from '@ant-design/icons';
import { exportJSON } from './exportJson';
import { defaultAjaxDataList, AjaxDataListObject } from '../../common/value';

export const openImportJsonModal = () => new Promise((resolve: (val: AjaxDataListObject[] | unknown) => void) => {
  const Content = (props: { onFileChange: (f: UploadFile | null) => void }) => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [warnMsg, setWarnMsg] = useState('');
    const uploadProps: UploadProps = {
      showUploadList: false,
      beforeUpload: (file) => {
        if (file.type !== 'application/json') {
          setWarnMsg('Only JSON files are supported for upload.');
          setFileList([]);
          props.onFileChange(null);
          return false;
        } else {
          setWarnMsg('');
          setFileList([file]);
          props.onFileChange(file);
        }
        setFileList([file]);
        props.onFileChange(file);
        return false;
      },
      fileList,
    };
    return <>
      {
        (typeof FileReader === 'undefined') ? 'Current browsers do not support FileReader' : <div style={{ minHeight: 210, marginTop: 12 }}>
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              <div>You can import a <strong>.json</strong> file with
                <a onClick={(e) => {
                  e.stopPropagation();
                  exportJSON('AjaxInterceptorTemplate', defaultAjaxDataList);
                }}>&nbsp;AjaxInterceptor&nbsp;</a>
                rules.
              </div>
              <div>They will appear in the extension once the upload is successful.</div>
            </p>
          </Upload.Dragger>
          <div style={{ background: '#f5f5f5', lineHeight: '22px', padding: '0 12px', marginTop: 8 }}>
            { fileList[0] && <FileOutlined style={{ marginRight: 8 }} /> }
            { fileList[0]?.name }
          </div>
          <div style={{ color: '#ff4d4f' }}>{ warnMsg }</div>
        </div>
      }
    </>;
  };
  let _file: Blob | UploadFile<any> | null = null;
  Modal.confirm({
    icon: null,
    width: 520,
    title: 'Import .json file',
    content: <Content onFileChange={(file: UploadFile | null) => _file = file}/>,
    onOk: () => {
      if (_file) {
        importJSON(_file).then((result) => {
          resolve(result);
        }).catch((error) => {
          notification.error({
            message: error.message,
          });
        });
      }
    },
  });
});

const importJSON = (file: Blob | UploadFile<any>) => new Promise((resolve, reject) => {

  const reader = new FileReader();
  reader.readAsText(file as Blob);

  reader.onerror = (error) => {
    reject({
      message: 'Failed to parse JSON file',
      description: error
    });
  };

  reader.onload = () => {
    const resultData = reader.result;
    if (resultData) {
      try {
        if (typeof resultData === 'string') {
          const importData = JSON.parse(resultData);
          resolve(importData);
        }
      } catch (error) {
        reject({
          message: 'Failed to parse JSON',
          description: error
        });
      }
    } else {
      reject({
        message: 'Failed to read data',
        description: 'Failed to read data'
      });
    }
  };
});
