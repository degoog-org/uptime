import { useState, type JSX } from "react";
import { Button } from "./button";

const COPIED_RESET_MS = 2000;

interface CodeSnippetProps {
  code: string;
  label: string;
}

export const CodeSnippet = ({ code, label }: CodeSnippetProps): JSX.Element => {
  const [copied, setCopied] = useState(false);

  const copy = async (): Promise<void> => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <div className="ext-field" data-type="info">
      <div className="flex items-start justify-between gap-3">
        <pre
          className="store-code m-0 min-w-0 overflow-x-auto"
          aria-label={label}
        >
          {code}
        </pre>
        <Button small onClick={() => void copy()}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
};
