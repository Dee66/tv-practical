export type ExceptionDetails = object | string | number | null | undefined;

export class AppException extends Error {
    details?: ExceptionDetails;

    constructor(message: string, details?: ExceptionDetails) {
        super(message);
        this.name = "AppException";
        this.details = details;
    }

    static from(err: unknown): AppException {
        if (err instanceof AppException) return err;

        if (err instanceof Error) {
            const baseMsg = err.message || err.constructor.name;

            if ((err as any).response && (err as any).response.data) {
                const data = (err as any).response.data;
                const status = (err as any).response.status;

                // Handle HTTP 429 Too Many Requests
                if (status === 429) {
                    return new AppException(data.message || "Too many requests. Please try again later.", data);
                }

                // Handle other HTTP 4xx errors
                if (status >= 400 && status < 500) {
                    return new AppException(data.message || `An error occurred (HTTP ${status}).`, data);
                }

                if (typeof data === "string") {
                    return new AppException(baseMsg + ": " + data, data);
                }

                if (data && typeof data === "object") {
                    if ("message" in data) {
                        return new AppException(baseMsg + ": " + data.message, data);
                    }
                    return new AppException(baseMsg + ": " + JSON.stringify(data), data);
                }
            }

            return new AppException(baseMsg, err);
        }

        if (typeof err === "string") return new AppException(err);

        if (typeof err === "number" || err == null) {
            return new AppException(String(err));
        }

        if (typeof err === "object") {
            if (err && "message" in err && typeof (err as any).message === "string") {
                return new AppException((err as any).message, err);
            }
            return new AppException(JSON.stringify(err), err);
        }

        return new AppException("Unknown error", err);
    }
}