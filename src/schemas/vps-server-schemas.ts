import z from "zod";

export const createVPSServerSchema = z
  .object({
    name: z
      .string({ error: "Name expected a string" })
      .trim()
      .max(255, "Name too long")
      .optional()
      .nullable(),
    username: z
      .string({
        error: (issue) =>
          issue.input == null
            ? "username is required"
            : "username expected a string",
      })
      .trim()
      .min(1, "Username is required")
      .max(255, "Username too long"),
    ipAddress: z
      .string()
      .trim()
      .min(1, "IP Address is required")
      .max(255, "IP Address too long")
      .refine(
        (val) => {
          const ipv4Match = val.match(
            /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
          );
          if (ipv4Match) {
            return ipv4Match.slice(1).every((octet: string) => {
              const n = Number(octet);
              return n >= 0 && n <= 255;
            });
          }
          return false;
        },
        { message: "Invalid IPv4 address" }
      ),
    privateKey: z.string().trim().optional().nullable(),
    password: z.string().trim().optional().nullable(),
    port: z.number().int().min(1).max(65535).optional(),
    domain: z
      .string()
      .trim()
      .max(255, "Domain too long")
      .optional()
      .nullable()
      .refine((val) => !val || /^(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/.test(val), {
        message: "Invalid domain",
      }),
    status: z.boolean().optional(),

    bandwidth: z.bigint().optional().nullable(),
    ramLimit: z.bigint().optional().nullable(),
    cpuLimit: z.bigint().optional().nullable(),
    diskLimit: z.bigint().optional().nullable(),
    bandWidthLimitPerSecond: z.bigint().optional().nullable(),

    healthScore: z.number().min(0).max(100).optional().nullable(),
    cpuUsage: z.number().min(0).max(100).optional().nullable(),
    ramUsage: z.number().min(0).max(100).optional().nullable(),
    diskUsage: z.number().min(0).max(100).optional().nullable(),
    totalMBitPerSecond: z.number().min(0).optional().nullable(),
  })
  .strict();

export const updateVPSServerSchema = z.object({
  name: z
    .string({ error: "Name expected a string" })
    .trim()
    .max(255, "Name too long")
    .optional()
    .nullable(),
  username: z
    .string({ error: "username expected a string" })
    .trim()
    .min(1, "Username is required")
    .max(255, "Username too long")
    .optional(),
  ipAddress: z
    .string()
    .trim()
    .min(1, "IP Address is required")
    .max(255, "IP Address too long")
    .optional()
    .refine(
      (val) => {
        if (val == null) return true;
        const ipv4Match = val.match(
          /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
        );
        if (ipv4Match) {
          return ipv4Match.slice(1).every((octet: string) => {
            const n = Number(octet);
            return n >= 0 && n <= 255;
          });
        }
        return false;
      },
      { message: "Invalid IPv4 address" }
    ),
  privateKey: z.string().trim().optional().nullable(),
  password: z.string().trim().optional().nullable(),
  port: z.number().int().min(1).max(65535).optional(),
  domain: z
    .string()
    .trim()
    .max(255, "Domain too long")
    .optional()
    .nullable()
    .refine((val) => !val || /^(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/.test(val), {
      message: "Invalid domain",
    }),
  status: z.boolean().optional(),

  bandwidth: z.bigint().optional().nullable(),
  ramLimit: z.bigint().optional().nullable(),
  cpuLimit: z.bigint().optional().nullable(),
  diskLimit: z.bigint().optional().nullable(),
  bandWidthLimitPerSecond: z.bigint().optional().nullable(),

  healthScore: z.number().min(0).max(100).optional().nullable(),
  cpuUsage: z.number().min(0).max(100).optional().nullable(),
  ramUsage: z.number().min(0).max(100).optional().nullable(),
  diskUsage: z.number().min(0).max(100).optional().nullable(),
  totalMBitPerSecond: z.number().min(0).optional().nullable(),
});
