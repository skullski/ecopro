import React from "react";

export interface AddressFormValue {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export function AddressForm({
  value,
  onChange,
}: {
  value: AddressFormValue;
  onChange: (v: AddressFormValue) => void;
}) {
  const set = (k: keyof AddressFormValue) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [k]: e.target.value });

  return (
    <div className="grid grid-cols-1 gap-3">
      <input className="input input-bordered" placeholder="Address line 1" value={value.line1} onChange={set("line1")} />
      <input className="input input-bordered" placeholder="Address line 2 (optional)" value={value.line2 || ""} onChange={set("line2")} />
      <div className="grid grid-cols-2 gap-3">
        <input className="input input-bordered" placeholder="City" value={value.city} onChange={set("city")} />
        <input className="input input-bordered" placeholder="State" value={value.state || ""} onChange={set("state")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className="input input-bordered" placeholder="Postal code" value={value.postalCode} onChange={set("postalCode")} />
        <input className="input input-bordered" placeholder="Country" value={value.country} onChange={set("country")} />
      </div>
      <input className="input input-bordered" placeholder="Phone (optional)" value={value.phone || ""} onChange={set("phone")} />
    </div>
  );
}
