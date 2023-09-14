import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import MonacoEditor from '../common/MonacoEditor';
import { DECLARATIVE_NET_REQUEST_EXAMPLES } from '../common/value';
import { SaveOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import { popupWindow } from '../main/utils/pictureInPicture';

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  } as T;
}
const Countdown = (props: { seconds: number; }) => {
  let intervalTimer: any = null;
  const [timeRemaining, setTimeRemaining] = useState(props.seconds);

  useEffect(() => {
    if (timeRemaining > 0) {
      intervalTimer = setInterval(() => {
        setTimeRemaining((prevTime: number) => prevTime - 1);
      }, 1000);

      return () => {
        clearInterval(intervalTimer);
      };
    }
  }, [timeRemaining]);

  return <>{timeRemaining}</>;
};

export default () => {
  const delayDoUpdateRulesTimer = useRef<any>({});
  const monacoEditorRef = useRef<any>({});
  const [text, setText] = useState('[]');
  const [saveTextTips, setSaveTextTips] = useState<ReactElement>(<></>);
  useEffect(() => {
    chrome.declarativeNetRequest && chrome.declarativeNetRequest.getDynamicRules( (rulesList)=>{
      setText(JSON.stringify(rulesList, null, 2));
    });
  }, []);

  const updateRules = (rulesStr: string) => {
    clearTimeout(delayDoUpdateRulesTimer.current);
    try {
      setSaveTextTips(<span style={{ color: '#999' }}>Saving ...</span>);
      const rules = JSON.parse(rulesStr);
      chrome.declarativeNetRequest.getDynamicRules(async (rulesList)=>{
        try {
          await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: rulesList.map(v => v.id),
            addRules: rules
          });
          setSaveTextTips(<span style={{ color: '#999' }}>Saved success !</span>);
        } catch (err) {
          console.error(err);
          setSaveTextTips(<span style={{ color: '#ff0000' }}>Save failed !</span>);
        }
      });
    } catch (err) {
      console.error(err);
      setSaveTextTips(<span style={{ color: '#ff0000' }}>Save failed !</span>);
    }
  };

  const delayDoUpdateRules = (rulesStr: string, seconds = 6) => {
    setSaveTextTips(<span style={{ color: '#999' }}>Save in <Countdown seconds={seconds}/> seconds.</span>);
    const timeout = seconds * 1000;
    delayDoUpdateRulesTimer.current = setTimeout(() => {
      updateRules(rulesStr);
    }, timeout);
  };
  const debounceUpdateRules = debounce(delayDoUpdateRules, 1000);
  const onDidChangeContent = useCallback((v: string) => {
    if (delayDoUpdateRulesTimer.current) {
      clearTimeout(delayDoUpdateRulesTimer.current);
    }
    setSaveTextTips(<span style={{ color: '#999' }}>Content is changed. </span>);
    debounceUpdateRules(v);
  }, []);

  const onSave = useCallback(() => {
    const { editorInstance } = monacoEditorRef.current;
    updateRules(editorInstance.getValue());
  }, []);

  return <div>
    <MonacoEditor
      ref={monacoEditorRef}
      theme={'vs'}
      headerStyle={{ background: '#fff', color: '#000', borderColor: '#d1d3d8' }}
      headerLeftNode={
        <>
          <SaveOutlined
            title="save"
            style={{ fontSize: 18, marginRight: 12 }}
            onClick={onSave}
          />
          { saveTextTips }
        </>
      }
      headerRightNode={<a
        title="Document"
        href="https://github.com/PengChen96/ajax-tools#support-blocking-or-modifying-network-requests-using-specified-declarative-rules-through-chromedeclarativenetrequest"
        target="_blank"
        rel="noreferrer"
      >
        Docs
      </a>}
      headerRightRightNode={<i
        className="c-iconfont c-icon-zoomout"
        title="Picture in picture"
        style={{ cursor: 'pointer' }}
        onClick={() => popupWindow({ url: chrome.runtime.getURL('html/iframePage/dist/declarativeNetRequest.html') })}
      />}
      language={'json'}
      languageSelectOptions={[]}
      text={text}
      examples={DECLARATIVE_NET_REQUEST_EXAMPLES}
      editorHeight={document.body.offsetHeight - 50}
      onDidChangeContent={onDidChangeContent}
      onSaveKeyword={onSave}
    />
  </div>;
};
