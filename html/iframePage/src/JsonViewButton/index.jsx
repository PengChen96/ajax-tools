import {Modal} from 'antd';
import {FormOutlined} from '@ant-design/icons';
import {useRef, useState} from 'react';
import MonacoEditor from "../MonacoEditor";
import './index.css';

export default (props) => {
  let monacoEditorRef = useRef(null);
  const {
    request, responseText = "", onInterfaceListChange = () => {}
  } = props;
  const [visible, setVisible] = useState(false);

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
      <MonacoEditor
        ref={monacoEditorRef}
        text={responseText}
      />
    </Modal>
  </>;
}
