export class ExchangeError extends Error {
    location: string;
    isVisionsError: boolean;
    statusCode: number;

    constructor(message = '', location: string = null, statusCode = 500) {
        super(message);
        this.isVisionsError = true;
        this.location = location;
        this.statusCode = statusCode;
    }
}
