export class ExchangeError extends Error {
    location: string;
    isExchangeError: boolean;
    statusCode: number;

    constructor(message = '', location: string = null, statusCode = 500) {
        super(message);
        this.isExchangeError = true;
        this.location = location;
        this.statusCode = statusCode;
    }
}
