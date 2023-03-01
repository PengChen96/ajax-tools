import { Modal } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import MonacoEditor from '../MonacoEditor';
import './index.css';

interface JsonViewButtonProps {
  language: string;
  request: string;
  responseText?: string;
  onInterfaceListChange?: (name: string, value: string) => void;
  onSave?: ({ editorValue, language }:{ editorValue:string, language: string }) => void;
}
export default (props: JsonViewButtonProps) => {
  const monacoEditorRef = useRef<any>(null);
  const {
    language, request, responseText = '',
    onSave = () => {},
  } = props;
  const [visible, setVisible] = useState(false);

  const handleOk = () => {
    const { editorInstance } = monacoEditorRef.current!;
    const editorValue = editorInstance.getValue();
    const language = editorInstance.getModel().getLanguageId();
    onSave({ editorValue, language });
    setVisible(false);
  };
  return <>
    <FormOutlined
      onClick={(event) => {
        event.stopPropagation();
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
      <MonacoEditor
        ref={monacoEditorRef}
        text={responseText}
        language={language}
      />
    </Modal>
  </>;
};
