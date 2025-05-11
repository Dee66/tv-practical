/**
 * Extracts a human-readable error message from an error object.
 * @param err - The error object or string.
 * @returns A string representing the error message.
 */
export function extractErrorMessage(err: any): string {
    if (!err) return "An unknown error occurred.";
    if (typeof err === "string") return err;
    if (typeof err.message === "string") return err.message;
    if (Array.isArray(err.message)) return err.message.join(", ");
    if (typeof err.message === "object") return JSON.stringify(err.message);
    return JSON.stringify(err);
}