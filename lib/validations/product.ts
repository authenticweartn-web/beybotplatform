// Zod schemas for product validation

import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
  category: z.string().min(1, "Category is required"),
  sku: z.string().min(1, "SKU is required"),
  status: z.enum(["active", "inactive"]),
})

export const updateProductSchema = productSchema.partial()

export type ProductInput = z.infer<typeof productSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
