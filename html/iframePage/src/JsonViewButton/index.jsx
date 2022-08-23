import {Modal} from 'antd';
// import ReactJson from 'react-json-view';
import {FormOutlined} from '@ant-design/icons';
import {useEffect, useRef, useState} from 'react';
import './index.css';
import MonacoEditor from "../MonacoEditor";

export default (props) => {
  let monacoEditorRef = useRef(null);
  const {
    request, responseText, onInterfaceListChange = () => {
    }
  } = props;
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState({});
  useEffect(() => {
    try {
      if (responseText) {
        const jsonValue = JSON.parse(responseText);
        if (jsonValue && typeof jsonValue === 'object') {
          setValue(jsonValue);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [responseText]);

  const handleOk = () => {
    const editorValue = monacoEditorRef.current.editorInstance.getValue();
    onInterfaceListChange(editorValue);
    setVisible(false);
  }
  return <>
    <FormOutlined
      onClick={(event) => {
        event.stopPropagation();
        setVisible(true);
      }}
      className="ajax-tools-iframe-resp-textarea-edit"
    />
    <Modal
      title={<span style={{fontSize: 12}}>匹配：{request}</span>}
      width={"98%"}
      visible={visible}
      onOk={handleOk}
      onCancel={() => setVisible(false)}
      okText="保存"
      cancelText="取消"
    >
      {/*<ReactJson*/}
      {/*  src={value}*/}
      {/*  collapsed={1}*/}
      {/*  displayDataTypes={false}*/}
      {/*  collapseStringsAfterLength={12}*/}
      {/*  onAdd={(v) => setValue(v.updated_src)}*/}
      {/*  onDelete={(v) => setValue(v.updated_src)}*/}
      {/*  onEdit={(v) => setValue(v.updated_src)}*/}
      {/*/>*/}
      <MonacoEditor
        ref={monacoEditorRef}
        text={JSON.stringify(value)}
      />
    </Modal>
  </>;
}
