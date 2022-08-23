import React, {useEffect, useImperativeHandle, useRef, useState} from "react";
import * as monaco from 'monaco-editor';
// import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
// import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
// import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
// import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker: function (workerId, label) {
    return new jsonWorker();
    // switch (label) {
    //   case 'json':
    //     return new jsonWorker()
    //   case 'css':
    //   case 'scss':
    //   case 'less':
    //     return new cssWorker();
    //   case 'html':
    //   case 'handlebars':
    //   case 'razor':
    //     return new htmlWorker();
    //   case 'typescript':
    //   case 'javascript':
    //     return new tsWorker();
    //   default:
    //     return new editorWorker();
    // }
  }
};

const MonacoEditor = (props, ref) => {
  let editorRef = useRef(null);
  useImperativeHandle(ref, () => ({
    editorInstance: editor,
  }));
  const [editor, setEditor] = useState(null);
  useEffect(() => {
    if (!editor) {
      const editor = monaco.editor.create(editorRef.current, {
        value: '',
        language: 'json',
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
  return <div
    ref={editorRef}
    style={{
      height: 400
    }}
  />
}
export default React.memo(React.forwardRef(MonacoEditor));
