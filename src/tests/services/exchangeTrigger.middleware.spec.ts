import { expect } from 'chai';
import { Request, Response, NextFunction } from 'express';
import sinon from 'sinon';
import { exchangeTriggerMiddleware } from '../../routes/middlewares/exchangeTrigger.middleware';
import { Logger } from '../../libs/loggers';

describe('exchangeTriggerMiddleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: sinon.SinonStub;
    let loggerErrorStub: sinon.SinonStub;
    let jsonStub: sinon.SinonStub;
    let statusStub: sinon.SinonStub;

    beforeEach(() => {
        req = {
            headers: {},
        };

        jsonStub = sinon.stub();
        statusStub = sinon.stub().returns({ json: jsonStub });

        res = {
            status: statusStub,
            json: jsonStub,
        };

        next = sinon.stub();
        loggerErrorStub = sinon.stub(Logger, 'error');
    });

    afterEach(() => {
        loggerErrorStub.restore();
        delete process.env.EXCHANGE_TRIGGER_API_KEY;
    });

    describe('Valid API Key', () => {
        it('should call next() when API key is valid', () => {
            process.env.EXCHANGE_TRIGGER_API_KEY = 'valid-api-key-123';
            req.headers!['x-exchange-trigger-api-key'] = 'valid-api-key-123';

            exchangeTriggerMiddleware(req as Request, res as Response, next as NextFunction);

            expect(next.callCount).to.equal(1);
            expect(statusStub.callCount).to.equal(0);
        });
    });

    describe('Missing Configuration', () => {
        it('should return 500 when EXCHANGE_TRIGGER_API_KEY is not configured', () => {
            delete process.env.EXCHANGE_TRIGGER_API_KEY;
            req.headers!['x-exchange-trigger-api-key'] = 'some-key';

            exchangeTriggerMiddleware(req as Request, res as Response, next as NextFunction);

            expect(statusStub.callCount).to.equal(1);
            expect(statusStub.firstCall.args[0]).to.equal(500);
            expect(jsonStub.callCount).to.equal(1);
            expect(jsonStub.firstCall.args[0]).to.deep.equal({
                error: 'Connector configuration error',
            });
            expect(loggerErrorStub.callCount).to.equal(1);
            expect(loggerErrorStub.firstCall.args[0]).to.equal(
                'EXCHANGE_TRIGGER_API_KEY is not configured'
            );
            expect(next.callCount).to.equal(0);
        });
    });

    describe('Missing API Key', () => {
        it('should return 401 when API key is not provided', () => {
            process.env.EXCHANGE_TRIGGER_API_KEY = 'valid-api-key-123';

            exchangeTriggerMiddleware(req as Request, res as Response, next as NextFunction);

            expect(statusStub.callCount).to.equal(1);
            expect(statusStub.firstCall.args[0]).to.equal(401);
            expect(jsonStub.callCount).to.equal(1);
            expect(jsonStub.firstCall.args[0]).to.deep.equal({
                error: 'API key is required',
                message:
                    'Please provide an API key in the x-exchange-trigger-api-key header',
            });
            expect(next.callCount).to.equal(0);
        });

        it('should return 401 when API key header is empty string', () => {
            process.env.EXCHANGE_TRIGGER_API_KEY = 'valid-api-key-123';
            req.headers!['x-exchange-trigger-api-key'] = '';

            exchangeTriggerMiddleware(req as Request, res as Response, next as NextFunction);

            expect(statusStub.callCount).to.equal(1);
            expect(statusStub.firstCall.args[0]).to.equal(401);
            expect(jsonStub.callCount).to.equal(1);
            expect(jsonStub.firstCall.args[0]).to.deep.equal({
                error: 'API key is required',
                message:
                    'Please provide an API key in the x-exchange-trigger-api-key header',
            });
            expect(next.callCount).to.equal(0);
        });
    });

    describe('Invalid API Key', () => {
        it('should return 403 when API key is invalid', () => {
            process.env.EXCHANGE_TRIGGER_API_KEY = 'valid-api-key-123';
            req.headers!['x-exchange-trigger-api-key'] = 'invalid-api-key';

            exchangeTriggerMiddleware(req as Request, res as Response, next as NextFunction);

            expect(statusStub.callCount).to.equal(1);
            expect(statusStub.firstCall.args[0]).to.equal(403);
            expect(jsonStub.callCount).to.equal(1);
            expect(jsonStub.firstCall.args[0]).to.deep.equal({
                error: 'Invalid API key',
                message: 'The provided API key is not valid',
            });
            expect(next.callCount).to.equal(0);
        });

        it('should return 403 when API key has different case', () => {
            process.env.EXCHANGE_TRIGGER_API_KEY = 'valid-api-key-123';
            req.headers!['x-exchange-trigger-api-key'] = 'VALID-API-KEY-123';

            exchangeTriggerMiddleware(req as Request, res as Response, next as NextFunction);

            expect(statusStub.callCount).to.equal(1);
            expect(statusStub.firstCall.args[0]).to.equal(403);
            expect(next.callCount).to.equal(0);
        });
    });

    describe('Error Handling', () => {
        it('should return 500 and log error when an exception occurs', () => {
            process.env.EXCHANGE_TRIGGER_API_KEY = 'valid-api-key-123';
            req.headers!['x-exchange-trigger-api-key'] = 'valid-api-key-123';

            const error = new Error('Unexpected error');
            const nextStub = sinon.stub().throws(error);

            exchangeTriggerMiddleware(
                req as Request,
                res as Response,
                nextStub
            );

            expect(statusStub.callCount).to.equal(1);
            expect(statusStub.firstCall.args[0]).to.equal(500);
            expect(jsonStub.callCount).to.equal(1);
            expect(jsonStub.firstCall.args[0]).to.deep.equal({
                error: 'Internal server error',
            });
            expect(loggerErrorStub.callCount).to.equal(1);
            expect(loggerErrorStub.firstCall.args[0]).to.deep.equal({
                message: error.message,
                location: error.stack,
            });
        });
    });
});
