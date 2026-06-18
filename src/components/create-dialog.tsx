"use client";

import { type ReactNode, useRef } from "react";

type CreateDialogProps = {
  buttonLabel: string;
  title: string;
  children: ReactNode;
};

export function CreateDialog({ buttonLabel, title, children }: CreateDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        aria-label={buttonLabel}
        className="fab"
        type="button"
        onClick={() => dialogRef.current?.showModal()}
      >
        +
      </button>
      <dialog className="modal" ref={dialogRef}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            aria-label="Fermer"
            className="icon-button"
            type="button"
            onClick={() => dialogRef.current?.close()}
          >
            x
          </button>
        </div>
        {children}
      </dialog>
    </>
  );
}
