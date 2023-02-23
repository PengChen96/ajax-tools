import React, { ForwardedRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Select } from 'antd';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// @ts-ignore
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// @ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
// import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
// import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
// editor.all中可查看完整的
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution'; // 代码高亮&提示
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'; // 代码高亮&提示
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution'; // 代码高亮&提示
import 'monaco-editor/esm/vs/language/json/monaco.contribution'; // 代码高亮&提示
import 'monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu.js'; // 右键显示菜单
import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js'; // 折叠
import 'monaco-editor/esm/vs/editor/contrib/format/browser/formatActions.js'; // 格式化代码
import 'monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController.js'; // 代码联想提示
import 'monaco-editor/esm/vs/editor/contrib/tokenization/browser/tokenization.js'; // 代码联想提示

self.MonacoEnvironment = {
  getWorker: function (workerId, label) {
    switch (label) {
      case 'json':
        return new jsonWorker();
      //   case 'css':
      //   case 'scss':
      //   case 'less':
        //     return new cssWorker();
        //   case 'html':
        //   case 'handlebars':
        //   case 'razor':
        //     return new htmlWorker();
      case 'typescript':
      case 'javascript':
        return new tsWorker();
      default:
        return new editorWorker();
    }
  }
};

interface MonacoEditorProps {
  languageSelectVisible?: boolean;
  editorHeight?: number;
  language?: string;
  text?: string;
}
const MonacoEditor = (props: MonacoEditorProps, ref: ForwardedRef<{ editorInstance: any }>) => {
  const editorRef = useRef(null);
  useImperativeHandle(ref, () => ({
    editorInstance: editor,
  }));
  const { languageSelectVisible = true, editorHeight = 400 } = props;
  const [editor, setEditor] = useState<any>(null);
  const [language, setLanguage] = useState<string>(props.language || 'json');
  useEffect(() => {
    if (!editor) {
      const editor = monaco.editor.create(editorRef.current!, {
        value: '',
        language,
        theme: 'vs-dark',
        scrollBeyondLastLine: false,
        tabSize: 2
      });
      // editor.getModel().onDidChangeContent((event,a,b) => {
      //   console.log(editor, editor.getValue());
      //   // editor.getAction('editor.action.formatDocument').run();
      // });
      setEditor(editor);
    }
  }, []);
  useEffect(() => {
    if (editor) {
      editor.getModel().setValue(props.text);
      setTimeout(() => {
        // 格式化代码
        editor.getAction('editor.action.formatDocument').run();
      }, 300);
    }
  }, [editor, props.text]);

  const onLanguageChange = (_language: string) => {
    if (editor) {
      setLanguage(_language);
      monaco.editor.setModelLanguage(editor.getModel(), _language); // 切换语言
    }
  };
  return <>
    {
      languageSelectVisible && <Select
        value={language}
        onChange={onLanguageChange}
        style={{
          width: 160,
          marginBottom: 8
        }}
      >
        <Select.Option value="json">json</Select.Option>
        <Select.Option value="javascript">javascript</Select.Option>
      </Select>
    }
    <div
      ref={editorRef}
      style={{
        height: editorHeight
      }}
    />
  </>;
};
export default React.memo(React.forwardRef(MonacoEditor));
