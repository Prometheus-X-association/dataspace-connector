export type CustomErrorOptions = {
    location?: string;
    message?: string;
};

export class CustomError extends Error {
    location: string;
    isCustomError: boolean;

    constructor(options: {
        message?: string;
        location?: string;
    }) {
        super(options.message);
        this.isCustomError = true;
        this.location = options.location || "";
    }
}
