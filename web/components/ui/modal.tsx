import {
  useEffect,
  useRef,
  type JSX,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Button } from "./button";

interface ModalProps {
  id: string;
  title: string;
  status?: string;
  onClose: () => void;
  children: ReactNode;
}

export const Modal = ({
  id,
  title,
  status = "",
  onClose,
  children,
}: ModalProps): JSX.Element => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!dialogRef.current?.contains(document.activeElement)) {
      closeRef.current?.focus();
    }
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const closeOnOverlay = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className="ext-modal-overlay" onClick={closeOnOverlay}>
      <div
        ref={dialogRef}
        className="ext-modal"
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
      >
        <div className="ext-modal-header">
          <h2 className="ext-modal-title" id={`${id}-title`}>
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="ext-modal-close degoog-icon-btn"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="ext-modal-body">{children}</div>
        <div className="ext-modal-footer">
          <span className="ext-modal-status">{status}</span>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};
