export class NexaError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status = 400, code = "BAD_REQUEST") {
    super(message);
    this.name = "NexaError";
    this.status = status;
    this.code = code;
  }
}

export function isNexaError(err: unknown): err is NexaError {
  return err instanceof NexaError;
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message === "Unauthorized") return "Please sign in to continue.";
  if (err instanceof NexaError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Try again.";
}

export function isUnauthorized(err: unknown): boolean {
  return (
    (err instanceof Error && err.message === "Unauthorized") ||
    (err instanceof NexaError && err.status === 401)
  );
}
