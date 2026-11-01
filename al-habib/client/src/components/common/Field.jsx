import { cloneElement, useId } from 'react';

export const inputCls = 'w-full min-h-[44px] rounded-xl border border-beige bg-white px-3 py-2 focus:border-caramel aria-[invalid=true]:border-bad';

export default function Field({ label, error, hint, children }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-bold">{label}</label>
      {cloneElement(children, { id, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-e` : undefined, className: inputCls })}
      {hint && !error && <p className="mt-1 text-sm text-choc/70">{hint}</p>}
      {error && <p id={`${id}-e`} role="alert" className="mt-1 text-sm text-bad">{error}</p>}
    </div>
  );
}
