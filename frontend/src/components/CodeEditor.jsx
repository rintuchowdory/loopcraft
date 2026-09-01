import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { javascript } from '@codemirror/lang-javascript';

const LANGS = {
  python: python(),
  java: java(),
  c: cpp(),
  javascript: javascript()
};

export default function CodeEditor({ value, onChange, language }) {
  return (
    <CodeMirror
      value={value}
      height="100%"
      theme="dark"
      extensions={[LANGS[language] ?? python()]}
      onChange={onChange}
      basicSetup={{ lineNumbers: true, foldGutter: true }}
    />
  );
}
