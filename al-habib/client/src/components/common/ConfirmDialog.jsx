import { useEffect, useRef } from 'react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const ref = useRef(null);
  useEffect(() => { const d = ref.current; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  return (
    <dialog ref={ref} onCancel={onCancel} className="w-[90%] max-w-md rounded-2xl p-6 backdrop:bg-deep/60">
      <h2 className="text-2xl">{title}</h2>
      <p className="mt-2 text-choc/80">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-outline !py-2" onClick={onCancel}>Cancel</button>
        <button className="btn !py-2 bg-bad text-white" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </dialog>
  );
}
