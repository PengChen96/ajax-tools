import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from '../common/MonacoEditor';
import { DECLARATIVE_NET_REQUEST_EXAMPLES } from '../common/value';
import { SaveOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  } as T;
}

export default () => {
  const monacoEditorRef = useRef<any>({});
  const [text, setText] = useState('[]');
  useEffect(() => {
    chrome.declarativeNetRequest && chrome.declarativeNetRequest.getDynamicRules( (rulesList)=>{
      setText(JSON.stringify(rulesList, null, 2));
    });
  }, []);

  const updateRules = (rulesStr: string) => {
    try {
      const rules = JSON.parse(rulesStr);
      chrome.declarativeNetRequest.getDynamicRules(async (rulesList)=>{
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: rulesList.map(v => v.id),
          addRules: rules
        });
      });
    } catch (e) {
      console.error(e);
    }
  };

  const debounceUpdateRules = debounce(updateRules, 2000);
  return <div>
    <MonacoEditor
      ref={monacoEditorRef}
      theme={'vs'}
      headerStyle={{ background: '#fff', color: '#000', borderColor: '#d1d3d8' }}
      headerLeftNode={<SaveOutlined
        title="save"
        style={{ fontSize: 18 }}
        onClick={() => {
          const { editorInstance } = monacoEditorRef.current;
          const editorValue = editorInstance.getValue();
          updateRules(editorValue);
        }}
      />}
      headerRightNode={<a
        title="Document"
        href="https://github.com/PengChen96/ajax-tools#support-blocking-or-modifying-network-requests-using-specified-declarative-rules-through-chromedeclarativenetrequest"
        target="_blank"
        rel="noreferrer"
      >
        Docs
      </a>}
      language={'json'}
      languageSelectOptions={[]}
      text={text}
      examples={DECLARATIVE_NET_REQUEST_EXAMPLES}
      editorHeight={document.body.offsetHeight}
      onDidChangeContent={(v) => { debounceUpdateRules(v); }}
    />
  </div>;
};
