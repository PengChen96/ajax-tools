import { Modal, Tabs } from 'antd';
import React, { ForwardedRef, useImperativeHandle, useRef, useState } from 'react';
import MonacoEditor from '../MonacoEditor';
import './index.css';

export interface ModifyDataModalOnSaveProps {
  groupIndex: number,
  interfaceIndex: number,
  headersEditorValue: string,
  responseEditorValue:string,
  language: string
}
interface ModifyDataModalProps {
  onSave: (
    { groupIndex, interfaceIndex, headersEditorValue, responseEditorValue, language } : ModifyDataModalOnSaveProps
  ) => void;
}
interface OpenModalProps {
  groupIndex: number,
  interfaceIndex: number,
  activeTab: string;
  request: string;
  headersText: string;
  responseLanguage: string;
  responseText: string;
}
const ModifyDataModal = (
  props: ModifyDataModalProps,
  ref: ForwardedRef<{ openModal: (props: OpenModalProps)=>void }>
) => {
  const monacoEditorHeadersRef = useRef<any>({});
  const monacoEditorResponseRef = useRef<any>({});

  const { onSave = () => {} } = props;
  const [visible, setVisible] = useState(false);
  const [groupIndex, setGroupIndex] = useState(0);
  const [interfaceIndex, setInterfaceIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('Response');
  const [request, setRequest] = useState('');
  const [headersText, setHeadersText] = useState('');
  const [responseLanguage, setResponseLanguage] = useState('json');
  const [responseText, setResponseText] = useState('');

  useImperativeHandle(ref, () => ({
    openModal
  }));

  const openModal = (
    { groupIndex, interfaceIndex, activeTab, request, headersText, responseLanguage, responseText } : OpenModalProps
  ) => {
    setGroupIndex(groupIndex);
    setInterfaceIndex(interfaceIndex);
    setActiveTab(activeTab);
    setRequest(request);
    setHeadersText(headersText);
    setResponseLanguage(responseLanguage);
    setResponseText(responseText);
    setVisible(true);
  };

  const handleOk = () => {
    const { editorInstance:headersEditorInstance } = monacoEditorHeadersRef.current;
    const { editorInstance:responseEditorInstance } = monacoEditorResponseRef.current;
    const headersEditorValue = headersEditorInstance?.getValue();
    const responseEditorValue = responseEditorInstance?.getValue();
    const language = responseEditorInstance?.getModel()?.getLanguageId();
    onSave({ groupIndex, interfaceIndex, headersEditorValue, responseEditorValue, language });
    setVisible(false);
  };
  return <>
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
              language={'json'}
              languageSelectOptions={['json']}
              text={headersText}
            />,
          },
          {
            label: `Response`,
            key: 'Response',
            children: <MonacoEditor
              ref={monacoEditorResponseRef}
              language={responseLanguage}
              text={responseText}
            />,
          },
        ]}
      />
    </Modal>
  </>;
};

export default React.memo(React.forwardRef(ModifyDataModal));
