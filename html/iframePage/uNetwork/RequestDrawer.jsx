import {Divider, Drawer} from "antd";
import React from "react";
import "./RequestDrawer.css";

export default (props) => {
  const {drawerOpen, record, onClose} = props;
  if (!record) {
    return;
  }

  const title = record && record.request.url.match('[^/]+(?!.*/)');
  return <Drawer
    title={<span style={{fontSize: 12}}>{title}</span>}
    open={drawerOpen}
    onClose={() => onClose()}
    width="80%"
    placement="right"
    mask={false}
    headerStyle={{padding: '8px 12px', fontSize: '14px'}}
    bodyStyle={{padding: '12px 24px'}}
  >
    <h4><strong>General</strong></h4>
    <div className="ajax-tools-devtools-text">
      <strong>Request URL:&nbsp;</strong>
      <span>{record.request.url}</span>
    </div>
    <div className="ajax-tools-devtools-text">
      <strong>Request Method:&nbsp;</strong>
      <span>{record.request.method}</span>
    </div>
    <div className="ajax-tools-devtools-text">
      <strong>Status Code:&nbsp;</strong>
      <span>{record.response.status}</span>
    </div>
    <div className="ajax-tools-devtools-text">
      <strong>Remote Address:&nbsp;</strong>
      <span>{record.serverIPAddress}</span>
    </div>
    {/*<div className="ajax-tools-devtools-text">*/}
    {/*  <strong>Referrer Policy:&nbsp;</strong>*/}
    {/*  <span>xxx</span>*/}
    {/*</div>*/}

    <Divider orientation="left" style={{margin: '12px 0 4px'}}/>
    <h4><strong>Response Headers</strong></h4>
    <div className="ajax-tools-devtools-text">
      <strong>Http Version:&nbsp;</strong>
      <span>{record.response.httpVersion}</span>
    </div>
    {
      record.response.headers.map((v) => {
        return <div className="ajax-tools-devtools-text">
          <strong>{v.name}:&nbsp;</strong>
          <span>{v.value}</span>
        </div>
      })
    }

    <Divider orientation="left" style={{margin: '12px 0 4px'}}/>
    <h4><strong>Request Headers</strong></h4>
    <div className="ajax-tools-devtools-text">
      <strong>Http Version:&nbsp;</strong>
      <span>{record.request.httpVersion}</span>
    </div>
    {
      record.request.headers.map((v) => {
        return <div className="ajax-tools-devtools-text">
          <strong>{v.name}:&nbsp;</strong>
          <span>{v.value}</span>
        </div>
      })
    }
  </Drawer>
}
