import { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ELIGIBLE_COUNTRIES } from '../../utils/constant';
import { kycSubmitSchema } from '../../utils/validators';
import type { KycSubmitPayload } from '../../types/api.types';

interface KycFormProps {
  onSubmit: (data: KycSubmitPayload) => void;
  loading?: boolean;
}

export function KycForm({ onSubmit, loading = false }: KycFormProps) {
  const [fields, setFields] = useState({ fullName: '', dateOfBirth: '', countryCode: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = kycSubmitSchema.safeParse(fields);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors({
        fullName: flat.fullName?.[0] ?? '',
        dateOfBirth: flat.dateOfBirth?.[0] ?? '',
        countryCode: flat.countryCode?.[0] ?? '',
      });
      return;
    }
    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="fullName"
        label="Full name"
        placeholder="Maria González"
        value={fields.fullName}
        onChange={handleChange}
        error={errors.fullName}
        autoComplete="name"
      />
      <Input
        name="dateOfBirth"
        label="Date of birth"
        type="date"
        value={fields.dateOfBirth}
        onChange={handleChange}
        error={errors.dateOfBirth}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="countryCode" className="text-sm font-medium text-gray-700">
          Country
        </label>
        <select
          id="countryCode"
          name="countryCode"
          value={fields.countryCode}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select a country</option>
          {ELIGIBLE_COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.countryCode && <p className="text-xs text-red-600">{errors.countryCode}</p>}
      </div>
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Submit
      </Button>
    </form>
  );
}
