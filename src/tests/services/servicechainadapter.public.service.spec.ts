import { expect } from 'chai';
import sinon from 'sinon';
import { ServiceChainAdapterService } from '../../services/public/v1/servicechainadapter.public.service';
import { Logger } from '../../libs/loggers';
import axios from "axios";

describe('ServiceChainAdapterService', () => {
    let payload: any;

    before(async () => {
        payload = {
            targetId: 'https://domain.com/v1/catalog/infrastructureservices/673cbc792180f6c65a503f11"',
            chainId: '@supervisor:68ff613bea7a56c751b61556-1761567035943-8fddeb34',
            representationUrl: 'https://representation.url'
        };

        sinon.stub(axios, 'get').callsFake(async (url: string) => {
            if (url === 'https://representation.url') {
                return { data: { mock: 'response' }, status: 200 };
            }
            throw new Error('URL not mocked');
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('Should return ACK for processGetRepresentationFlow and call resumeNode', async () => {
        const getRepresentationStub = sinon.stub(require('../../libs/loaders/representationFetcher'), 'getRepresentation').resolves({ foo: 'bar' });
        const resumeNodeSpy = sinon.spy(ServiceChainAdapterService.prototype, 'resumeNode');

        const service = new ServiceChainAdapterService(payload);
        const result = await service.processGetRepresentationFlow();

        expect(result).to.deep.equal({ status: 200, message: 'ACK' });
        expect(getRepresentationStub.calledOnce).to.be.true;
        await new Promise(res => setTimeout(res, 10));
        expect(resumeNodeSpy.calledOnce).to.be.true;
    });

    it('Should return ACK for processPotsOrPutRepresentationFlow and call resumeNode', async () => {
        const postOrPutStub = sinon.stub(require('../../libs/loaders/representationFetcher'), 'postOrPutRepresentation').resolves({ foo: 'bar' });
        const resumeNodeSpy = sinon.spy(ServiceChainAdapterService.prototype, 'resumeNode');

        const service = new ServiceChainAdapterService(payload);
        const result = await service.processPotsOrPutRepresentationFlow();

        expect(result).to.deep.equal({ status: 200, message: 'ACK' });
        expect(postOrPutStub.calledOnce).to.be.true;
        await new Promise(res => setTimeout(res, 10));
        expect(resumeNodeSpy.calledOnce).to.be.true;
    });

    it('Should call nodeResumeService and log when success', async () => {
        const nodeResumeStub = sinon.stub(require('../../services/public/v1/node.public.service'), 'nodeResumeService').resolves({ success: true });
        const logSpy = sinon.spy(Logger, 'log');
        const service = new ServiceChainAdapterService(payload);

        service.resumeNode({ foo: 'bar' });
        await new Promise(res => setTimeout(res, 10));
        expect(nodeResumeStub.calledOnce).to.be.true;
        expect(logSpy.calledOnce).to.be.true;
    });

    it('Should log an error if node resume fail', async () => {
        const nodeResumeStub = sinon.stub(require('../../services/public/v1/node.public.service'), 'nodeResumeService').rejects(new Error('fail'));
        const errorSpy = sinon.spy(Logger, 'error');
        const service = new ServiceChainAdapterService(payload);

        service.resumeNode({ foo: 'bar' });
        await new Promise(res => setTimeout(res, 10));
        expect(nodeResumeStub.calledOnce).to.be.true;
        expect(errorSpy.called).to.be.true;
    });

    it('Should return ACK for response()', () => {
        const service = new ServiceChainAdapterService(payload);
        expect(service.response()).to.deep.equal({ status: 200, message: 'ACK' });
    });
});
