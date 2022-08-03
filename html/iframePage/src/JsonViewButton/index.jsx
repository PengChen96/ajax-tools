import {Modal} from 'antd';
import ReactJson from 'react-json-view';
import {FormOutlined} from '@ant-design/icons';
import {useEffect, useState} from 'react';
import './index.css';

export default (props) => {
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
    onInterfaceListChange(JSON.stringify(value));
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
      visible={visible}
      onOk={handleOk}
      onCancel={() => setVisible(false)}
      okText="确定"
      cancelText="取消"
    >
      <ReactJson
        src={value}
        collapsed={1}
        displayDataTypes={false}
        collapseStringsAfterLength={12}
        onAdd={(v) => setValue(v.updated_src)}
        onDelete={(v) => setValue(v.updated_src)}
        onEdit={(v) => setValue(v.updated_src)}
      />
    </Modal>
  </>;
}
