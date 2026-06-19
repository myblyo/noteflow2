import { formatDbError } from "@/lib/db";

export function internalErrorResponse(error: unknown, logLabel: string) {
  console.error(logLabel, error);
  const message =
    process.env.NODE_ENV === "development"
      ? formatDbError(error)
      : "Error interno";
  const status =
    process.env.NODE_ENV === "development" &&
    error instanceof Error &&
    (error.message.includes("DATABASE_URL") ||
      error.message.includes("does not exist"))
      ? 503
      : 500;
  return { message, status };
}
