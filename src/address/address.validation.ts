import { z, ZodType } from 'zod';

export class AddressValidation {
  static readonly CREATE: ZodType = z.object({
    street: z.string().min(1).max(100).optional(),
    city: z.string().min(1).max(100).optional(),
    province: z.string().min(1).max(100).optional(),
    contactId: z.string().min(1).max(100).cuid(),
    country: z.string().min(1).max(100),
    postalCode: z.string().min(1).max(100),
  });
}
