import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type JSX,
  type MouseEvent,
} from "react";
import { DEGOOG_URL } from "../../config";
import {
  EMPTY_DRAFT,
  buildEntry,
  formatJsonEntry,
  formatMarkdownLine,
  markdownSection,
  validateDraft,
  type DraftError,
  type InstanceDraft,
} from "../../lib/instance-entry";
import { Button } from "../ui/button";
import { CodeSnippet } from "../ui/code-snippet";
import { FormField } from "../ui/form-field";

const DIALOG_ID = "add-instance";
const INPUT_CLASSES = "degoog-input ext-field-input";

const ERROR_TEXT: Record<DraftError, string> = {
  name: "Add a name.",
  url: "Use the base URL, like https://search.example.org.",
  country: "Use a two-letter country code, like IT.",
  duplicate: "This instance is already on the list.",
};

interface AddInstanceDialogProps {
  existingIds: ReadonlySet<string>;
  onClose: () => void;
}

export const AddInstanceDialog = ({
  existingIds,
  onClose,
}: AddInstanceDialogProps): JSX.Element => {
  const [draft, setDraft] = useState<InstanceDraft>(EMPTY_DRAFT);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const errors = validateDraft(draft, existingIds);
  const entry = errors.length === 0 ? buildEntry(draft) : null;
  const footerHint = entry
    ? ""
    : draft.name.trim() && draft.url.trim()
      ? "Fix the fields in red"
      : "Add a name and URL";

  const errorFor = (field: DraftError, touched: boolean): string | undefined =>
    touched && errors.includes(field) ? ERROR_TEXT[field] : undefined;

  const set =
    <K extends keyof InstanceDraft>(
      key: K,
      transform: (value: string) => InstanceDraft[K],
    ) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void =>
      setDraft((previous) => ({
        ...previous,
        [key]: transform(event.target.value),
      }));

  const closeOnOverlay = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className="ext-modal-overlay" onClick={closeOnOverlay}>
      <div
        className="ext-modal"
        id={DIALOG_ID}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${DIALOG_ID}-title`}
      >
        <div className="ext-modal-header">
          <h2 className="ext-modal-title" id={`${DIALOG_ID}-title`}>
            Add your instance
          </h2>
          <button
            type="button"
            className="ext-modal-close degoog-icon-btn"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="ext-modal-body">
          <p className="ext-field-desc">
            Your instance needs /readyz and /api/whodis, which recent degoog
            versions have.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Name"
              error={errorFor(
                "name",
                draft.url.length > 0 && draft.name.length === 0,
              )}
            >
              <input
                ref={firstFieldRef}
                className={INPUT_CLASSES}
                value={draft.name}
                onChange={set("name", (value) => value)}
                placeholder="My search"
              />
            </FormField>
            <FormField
              label="URL"
              error={
                errorFor("url", draft.url.length > 0) ??
                errorFor("duplicate", true)
              }
            >
              <input
                className={INPUT_CLASSES}
                value={draft.url}
                onChange={set("url", (value) => value)}
                placeholder="https://search.example.org"
                inputMode="url"
              />
            </FormField>
            <FormField
              label="Country (optional)"
              error={errorFor("country", draft.country.length > 0)}
            >
              <input
                className={INPUT_CLASSES}
                value={draft.country}
                onChange={set("country", (value) =>
                  value.toUpperCase().slice(0, 2),
                )}
                placeholder="IT"
                maxLength={2}
              />
            </FormField>
            <FormField label="Behind Cloudflare">
              <span className="degoog-select-wrap">
                <select
                  className={INPUT_CLASSES}
                  value={draft.cloudflare}
                  onChange={set("cloudflare", (value) =>
                    value === "yes" || value === "no" ? value : "unknown",
                  )}
                >
                  <option value="unknown">Not sure</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </span>
            </FormField>
            <FormField label="Appearance">
              <span className="degoog-select-wrap">
                <select
                  className={INPUT_CLASSES}
                  value={draft.appearance}
                  onChange={set("appearance", (value) =>
                    value === "custom" ? "custom" : "default",
                  )}
                >
                  <option value="default">Default degoog look</option>
                  <option value="custom">Custom theme</option>
                </select>
              </span>
            </FormField>
            {draft.appearance === "custom" && (
              <FormField label="Theme name (optional)">
                <input
                  className={INPUT_CLASSES}
                  value={draft.theme}
                  onChange={set("theme", (value) => value)}
                  placeholder="Zen"
                />
              </FormField>
            )}
          </div>

          {entry && (
            <>
              <div className="ext-field">
                <span className="ext-field-label">1. instances.json</span>
                <p className="ext-field-desc">
                  Paste at the end of the <code>instances</code> array, with a
                  comma after the previous entry.{" "}
                  <a
                    href={`${DEGOOG_URL}/edit/main/instances.json`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Edit on GitHub
                  </a>
                </p>
                <CodeSnippet
                  label="instances.json entry"
                  code={formatJsonEntry(entry)}
                />
              </div>
              <div className="ext-field">
                <span className="ext-field-label">2. PUBLIC_INSTANCES.md</span>
                <p className="ext-field-desc">
                  Paste under "{markdownSection(entry)}".{" "}
                  <a
                    href={`${DEGOOG_URL}/edit/main/PUBLIC_INSTANCES.md`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Edit on GitHub
                  </a>
                </p>
                <CodeSnippet
                  label="PUBLIC_INSTANCES.md line"
                  code={formatMarkdownLine(entry)}
                />
              </div>
              <div className="ext-field">
                <span className="ext-field-label">3. Pull request</span>
                <p className="ext-field-desc">
                  Commit both files to the same branch of your fork and open one
                  pull request.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="ext-modal-footer">
          <span className="ext-modal-status">{footerHint}</span>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};
