import React from "react";

export interface AddressFormValue {
  name: string;
  email?: string;
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
      <input className="input input-bordered" name="name" placeholder="Full Name" value={value.name} onChange={set("name")} required />
      <input className="input input-bordered" name="email" placeholder="Email (optional)" value={value.email || ""} onChange={set("email")} />
      <input className="input input-bordered" name="line1" placeholder="Address line 1" value={value.line1} onChange={set("line1")} />
      <input className="input input-bordered" name="line2" placeholder="Address line 2 (optional)" value={value.line2 || ""} onChange={set("line2")} />
      <div className="grid grid-cols-2 gap-3">
        <input className="input input-bordered" name="city" placeholder="City" value={value.city} onChange={set("city")} />
        <input className="input input-bordered" name="state" placeholder="State" value={value.state || ""} onChange={set("state")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className="input input-bordered" name="postalCode" placeholder="Postal code" value={value.postalCode} onChange={set("postalCode")} />
        <input className="input input-bordered" name="country" placeholder="Country" value={value.country} onChange={set("country")} />
      </div>
      <input className="input input-bordered" name="phone" placeholder="Phone (optional)" value={value.phone || ""} onChange={set("phone")} />
    </div>
  );
}
