import { countryCodes } from '@/lib/countryCodes';

/**
 * Country code dropdown + phone number input, styled as a single field.
 * Defaults to India (+91) since that's TCT's primary market, but every
 * country in the dropdown is selectable for traders outside India.
 * Plain server-rendered markup — no client state needed since these are
 * static mock forms with no submission backend yet.
 */
export function PhoneField({ label = 'Mobile number' }: { label?: string }) {
  return (
    <div className="phonefield">
      {label ? <label className="fieldlabel">{label}</label> : null}
      <div className="phonerow">
        <select className="input countrycode" defaultValue="+91" aria-label="Country code">
          {countryCodes.map((c) => (
            <option key={c.iso2} value={c.dial}>
              {c.name} ({c.dial})
            </option>
          ))}
        </select>
        <input
          className="input phonenumber"
          type="tel"
          inputMode="tel"
          placeholder="Phone number"
          aria-label="Phone number"
        />
      </div>
    </div>
  );
}
