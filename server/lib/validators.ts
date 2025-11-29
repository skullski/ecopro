import { z } from "zod";

export const reviewBodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

export const orderCreateSchema = z.object({
  productId: z.string().min(1),
  shippingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().optional(),
  }),
});

export const messageBodySchema = z.object({
  body: z.string().min(1).max(2000),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  addresses: z
    .array(
      z.object({
        id: z.string().optional(),
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string().optional(),
        postalCode: z.string(),
        country: z.string(),
        phone: z.string().optional(),
      })
    )
    .optional(),
  defaultAddressId: z.string().optional(),
});
