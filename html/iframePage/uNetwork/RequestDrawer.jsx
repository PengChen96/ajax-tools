import {Divider, Drawer, Input, Tabs} from "antd";
import React from "react";
import "./RequestDrawer.css";

const {TextArea} = Input;
export default (props) => {
  const {drawerOpen, record, onClose} = props;
  if (!record) {
    return;
  }

  const Headers = () => {
    return <>
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
          return <div className="ajax-tools-devtools-text" key={v.name}>
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
          return <div className="ajax-tools-devtools-text" key={v.name}>
            <strong>{v.name}:&nbsp;</strong>
            <span>{v.value}</span>
          </div>
        })
      }
    </>
  }
  const Payload = () => {
    const postData = record.request.postData || {};
    const getPostDataText = (value) => {
      let text = value;
      try {
        text = JSON.stringify(JSON.parse(value), null, 4);
      } catch (e) {
        text = value;
      }
      return text;
    }

    return <>
      <h4><strong>Query String Parameters</strong></h4>
      {
        record.request.queryString.map((v) => {
          return <div className="ajax-tools-devtools-text" key={v.name}>
            <strong>{v.name}:&nbsp;</strong>
            <span>{v.value}</span>
          </div>
        })
      }
      <Divider orientation="left" style={{margin: '12px 0 4px'}}/>
      <h4><strong>Request Payload</strong></h4>
      <div className="ajax-tools-devtools-text">
        <strong>mimeType:&nbsp;</strong>
        <span>{postData.mimeType}</span>
      </div>
      <div className="ajax-tools-devtools-text">
        <strong>text:&nbsp;</strong>
        <TextArea
          value={getPostDataText(postData.text)}
          bordered={false}
          placeholder="response text"
          autoSize={{
            minRows: 3,
            maxRows: 5,
          }}
        />
      </div>

      {
        postData.params && <div className="ajax-tools-devtools-text">
          <strong>Params:&nbsp;</strong>
          {
            (postData.params || []).map((v) => {
              return <div className="ajax-tools-devtools-text" key={v.name}>
                <strong>{v.name}:&nbsp;</strong>
                <span>{v.value}</span>
              </div>
            })
          }
        </div>
      }
    </>
  }

  const Wrapper = (props) => {
    return <div style={{height: 'calc(100vh - 160px)', overflow: 'auto'}}>
      {props.children}
    </div>
  }

  const title = record && record.request.url.match('[^/]+(?!.*/)');
  return <Drawer
    title={<span style={{fontSize: 12}}>{title}</span>}
    open={drawerOpen}
    onClose={() => onClose()}
    width="80%"
    placement="right"
    mask={false}
    headerStyle={{padding: '8px 12px', fontSize: '14px', wordBreak: 'break-all'}}
    bodyStyle={{padding: '6px 24px'}}
  >
    <Tabs
      defaultActiveKey="1"
      size="small"
      // onChange={onChange}
      items={[
        {
          label: `Headers`,
          key: '1',
          children: <Wrapper><Headers/></Wrapper>,
        },
        {
          label: `Payload`,
          key: '2',
          children: <Wrapper><Payload/></Wrapper>,
        },
        {
          label: `Response`,
          key: '3',
          children: `Content of Tab Pane 3`,
        },
      ]}
    />
  </Drawer>
}
