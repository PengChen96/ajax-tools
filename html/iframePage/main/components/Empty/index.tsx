import React from 'react';
import { Button, Result } from 'antd';

import {  DropboxOutlined, UploadOutlined } from '@ant-design/icons';

interface EmptyPorps {
  onGroupAdd: () => void;
  onImportClick: () => void;
}

const Empty = (props: EmptyPorps) => {
  
  const { onGroupAdd, onImportClick } = props;
  return (<Result
    icon={<DropboxOutlined style={{ color: '#c1d0dd' }}/>}
    title={'Ohhh... nothing here'}
    subTitle={<>
        Create a rule by clicking the <Button size="small" type="primary" onClick={onGroupAdd}>Add Group</Button> button <br/>
        Or importing a <strong>.json</strong> file by clicking the <Button size="small" style={{ marginTop: 6 }} onClick={onImportClick}><UploadOutlined/>Import</Button> button<br/>
        Or F12 opens devtools and selects the U-Network panel to get started quickly.
    </>}
  />);
};
export default Empty;