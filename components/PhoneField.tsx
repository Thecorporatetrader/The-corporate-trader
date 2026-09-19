'use client';
import { countryCodes } from '@/lib/countryCodes';
export function PhoneField({ label = 'Mobile number' }: { label?: string }) {
  return <div className="phonefield">
    {label && <label className="fieldlabel" htmlFor="mobile-number">{label}</label>}
    <div className="phonerow">
      <select name="country" className="input countrycode" defaultValue="+91" aria-label="Country code" autoComplete="tel-country-code">
        {countryCodes.map(c => <option key={c.iso2} value={c.dial}>{c.name} ({c.dial})</option>)}
      </select>
      <input id="mobile-number" name="mobile" className="input phonenumber" type="tel" inputMode="numeric"
        autoComplete="tel-national" placeholder="8–15 digits" required pattern="[0-9]{8,15}" minLength={8} maxLength={15}
        onInput={e => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''); }} />
    </div>
  </div>;
}

