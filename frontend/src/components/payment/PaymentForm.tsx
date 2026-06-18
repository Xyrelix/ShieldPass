import { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { paymentSchema } from '../../utils/validators';
import type { PaymentInput } from '../../utils/validators';

interface PaymentFormProps {
  onSubmit: (data: PaymentInput) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function PaymentForm({ onSubmit, loading = false, disabled = false }: PaymentFormProps) {
  const [fields, setFields] = useState({ recipientWallet: '', amount: '', asset: 'USDC' });
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentInput, string>>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = paymentSchema.safeParse(fields);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors({
        recipientWallet: flat.recipientWallet?.[0],
        amount: flat.amount?.[0],
      });
      return;
    }
    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="recipientWallet"
        label="Recipient Stellar address"
        placeholder="G…"
        value={fields.recipientWallet}
        onChange={handleChange}
        error={errors.recipientWallet}
        disabled={disabled}
        autoComplete="off"
      />
      <div className="flex gap-3">
        <Input
          name="amount"
          label="Amount"
          placeholder="10.00"
          value={fields.amount}
          onChange={handleChange}
          error={errors.amount}
          disabled={disabled}
          className="flex-1"
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Asset</label>
          <div className="flex h-[38px] items-center rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
            USDC
          </div>
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full" loading={loading} disabled={disabled}>
        Continue to proof generation
      </Button>
    </form>
  );
}
