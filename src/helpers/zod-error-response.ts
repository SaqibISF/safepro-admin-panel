import { ZodError, ZodIssue } from "zod";

const formatZodErrors = (issues: ZodIssue[]) => {
  const errorMap: Record<string, string[]> = {};

  issues.forEach((issue) => {
    const key = String(issue.path[0]);
    if (!errorMap[key]) {
      errorMap[key] = [];
    }
    errorMap[key].push(issue.message);
  });

  return Object.entries(errorMap).map(([key, messages]) => ({
    key,
    messages,
  }));
};

export const ZodErrorResponse = (error: ZodError) => {
  const messages: string[] = [];
  const errors: { key: string; messages: string[] }[] = [];

  const issues = error.issues;

  const requiredKeysErrors = formatZodErrors(
    issues.filter((issue) => issue.code === "invalid_type")
  );

  if (requiredKeysErrors.length > 0) {
    const keys = requiredKeysErrors.map((err) => err.key);
    messages.push(
      `${keys.join(", ")} ${keys.length > 1 ? "keys are" : "key is"} required`
    );
    errors.push(...requiredKeysErrors);
  }

  const invalidKeysErrors = formatZodErrors(
    issues.filter(
      (issue) =>
        issue.code !== "invalid_type" && issue.code !== "unrecognized_keys"
    )
  );

  if (invalidKeysErrors.length > 0) {
    const keys = invalidKeysErrors.map((err) => err.key);
    messages.push(
      `${keys.join(", ")} ${
        keys.length > 1 ? "are invalid input values" : "is invalid input value"
      }`
    );
    errors.push(...invalidKeysErrors);
  }

  const unknownKeys = issues
    .filter((issue) => issue.code === "unrecognized_keys")
    .flatMap((issue) => issue.keys);

  if (unknownKeys.length > 0) {
    messages.push(
      `${unknownKeys.join(", ")} ${
        unknownKeys.length > 1 ? "are extra keys" : "is extra key"
      } not allowed`
    );
    errors.push(
      ...unknownKeys.map((key) => ({
        key,
        messages: [`${key} is not allowed`],
      }))
    );
  }

  return Response.json(
    {
      success: false,
      message: messages.join(" and "),
      errors,
    },
    { status: 400 }
  );
};
