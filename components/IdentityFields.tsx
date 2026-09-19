'use client';
import { PhoneField } from './PhoneField';
export function IdentityFields() {
  return <>
    <label className="fieldlabel" htmlFor="full-name">Name</label>
    <input id="full-name" className="input" name="name" autoComplete="name" placeholder="Full name" required maxLength={80}
      onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^\p{L}\p{M} ]/gu, ''); }} />
    <label className="fieldlabel" htmlFor="email">Email</label>
    <input id="email" className="input" name="email" type="email" autoComplete="email" placeholder="name@domain.com" required maxLength={254} />
    <PhoneField />
  </>;
}

