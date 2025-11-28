import { expect } from 'chai';
import sinon from 'sinon';
import { triggerInfrastructureFlowService } from '../../services/public/v1/infrastructure.public.service';
import axios from 'axios';
import { ContractServiceChain } from '../../utils/types/contractServiceChain';
import {SupervisorContainer} from "../../libs/loaders/nodeSupervisor";

describe('Infrastructure API tests', () => {
    let axiosGetStub: sinon.SinonStub;
    let dataExchange: any;

    const data = {
        "id": "customer-123456",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "skills": ["skill1", "skill2", "skill3"],
    };

    const serviceChain = {
        catalogId: "1",
        services: [
            {
                service: "https://infrastructure.com",
                participant: "https://participant.com",
                params: { custom: "custom" },
                configuration: "15"
            }
        ],
    } as ContractServiceChain;

    beforeEach(() => {
        // Mock axios.get
        axiosGetStub = sinon.stub(axios, 'get');
        axiosGetStub.withArgs(serviceChain.services[0].participant).resolves({ data: { dataspaceEndpoint: 'https://dataspace.test.com', name: 'participant', _id: 'id123' } });

        // Mock SupervisorContainer and other dependencies if nécessaire
        // Mock DataExchange
        dataExchange = {
            _id: 'dataexid',
            consumerDataExchange: 'ezef854a4fa463a4fa3',
            completeServiceChain: sinon.stub().resolves(),
            serviceChain: { services: [{ service: 'https://infrastructure.com' }] }
        };
    });

    afterEach(() => {
        axiosGetStub.restore();
        sinon.restore();
    });

    describe("triggerInfrastructureFlowService", () => {
        it("Should respond with OK and 200 status code", async () => {
            // Mock SupervisorContainer.getInstance and its methods
            const nodeSupervisorMock = {
                uid: 'mockUid',
                communicateNode: sinon.stub(),
                setup: sinon.stub(),
                processPreChainConverter: sinon.stub(),
                processingChainConfigConverter: sinon.stub().resolves([{
                    services: [],
                    location: 'remote',
                    monitoringHost: 'https://dataspace.test.com',
                    chainId: '',
                }]),
                createAndStartChain: sinon.stub().resolves(true)
            } as unknown as SupervisorContainer;

            sinon.stub(SupervisorContainer, 'getInstance').resolves(nodeSupervisorMock);

            // Mock getAppKey and getEndpoint
            const configLoader = require('../../libs/loaders/configuration');
            sinon.stub(configLoader, 'getAppKey').resolves('appkey');
            sinon.stub(configLoader, 'getEndpoint').resolves('https://dataspace.test.com');

            const response = await triggerInfrastructureFlowService(serviceChain, dataExchange, data);
            expect(response).equal(true);
        });
    });
});
