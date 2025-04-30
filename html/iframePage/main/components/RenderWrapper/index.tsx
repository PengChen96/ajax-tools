import React from 'react';
import Empty from '../Empty';

interface IRenderWrapper {
  children: React.ReactNode
   ajaxDataList: any[]
   onGroupAdd: () => void
   onImportClick: () => void
}

const RenderWrapper = ({ children, ajaxDataList, onGroupAdd, onImportClick }:IRenderWrapper) => {
  
  if(ajaxDataList.length < 1) {

    return <Empty onGroupAdd={onGroupAdd} onImportClick={onImportClick}/>;
  }
  
  
  return (
    children
  );
};

export default RenderWrapper;