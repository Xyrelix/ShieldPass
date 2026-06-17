import { z } from 'zod';
import { ELIGIBLE_COUNTRIES } from './constant';

export const kycSubmitSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(120),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  countryCode: z
    .string()
    .length(2, 'Use a 2-letter country code')
    .toUpperCase()
    .refine((c) => ELIGIBLE_COUNTRIES.includes(c), 'Country not in eligible list'),
});

export const paymentSchema = z.object({
  recipientWallet: z
    .string()
    .min(56, 'Invalid Stellar address')
    .max(56, 'Invalid Stellar address')
    .regex(/^G[A-Z2-7]{55}$/, 'Must be a valid Stellar public key'),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,7})?$/, 'Enter a valid amount')
    .refine((v) => parseFloat(v) > 0, 'Amount must be greater than 0'),
  asset: z.string().min(1),
});

export type KycSubmitInput = z.infer<typeof kycSubmitSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
