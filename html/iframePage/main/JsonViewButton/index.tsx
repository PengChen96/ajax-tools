import { Modal, Tabs } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from '../MonacoEditor';
import './index.css';

interface JsonViewButtonProps {
  activeTab: string;
  language: string;
  request: string;
  headersText?: string;
  responseText?: string;
  onInterfaceListChange?: (name: string, value: string) => void;
  onSave?: ({ headersEditorValue, responseEditorValue, language }:{ headersEditorValue: string, responseEditorValue:string, language: string }) => void;
}
export default (props: JsonViewButtonProps) => {
  const monacoEditorHeadersRef = useRef<any>({});
  const monacoEditorResponseRef = useRef<any>({});
  const {
    language, request, headersText = '', responseText = '',
    onSave = () => {},
  } = props;
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(props.activeTab);

  const handleOk = () => {
    const { editorInstance:headersEditorInstance } = monacoEditorHeadersRef.current;
    const { editorInstance:responseEditorInstance } = monacoEditorResponseRef.current;
    const headersEditorValue = headersEditorInstance?.getValue();
    const responseEditorValue = responseEditorInstance?.getValue();
    const language = responseEditorInstance?.getModel()?.getLanguageId();
    onSave({ headersEditorValue, responseEditorValue, language });
    setVisible(false);
  };
  return <>
    <FormOutlined
      onClick={(event) => {
        event.stopPropagation();
        setActiveTab(props.activeTab);
        setVisible(true);
      }}
      className="ajax-tools-iframe-resp-textarea-edit"
    />
    <Modal
      centered
      title={<span style={{ fontSize: 12 }}>Matched URL：{request}</span>}
      width={'98%'}
      open={visible}
      onOk={handleOk}
      onCancel={() => setVisible(false)}
      okText="Save"
      cancelText="Cancel"
      bodyStyle={{
        padding: 12
      }}
    >
      <Tabs
        defaultActiveKey={activeTab}
        activeKey={activeTab}
        size="small"
        onChange={(v) => setActiveTab(v)}
        items={[
          {
            label: `Headers`,
            key: 'Headers',
            children: <MonacoEditor
              ref={monacoEditorHeadersRef}
              languageSelectVisible={false}
              language={'json'}
              text={headersText}
            />,
          },
          {
            label: `Response`,
            key: 'Response',
            children: <MonacoEditor
              ref={monacoEditorResponseRef}
              language={language}
              text={responseText}
            />,
          },
        ]}
      />
      {/*<MonacoEditor*/}
      {/*  ref={monacoEditorRef}*/}
      {/*  text={responseText}*/}
      {/*  language={language}*/}
      {/*/>*/}
    </Modal>
  </>;
};
