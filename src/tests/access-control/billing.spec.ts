import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { providerExportService } from '../../services/public/v1/provider.public.service';
import { expect } from 'chai';
import dotenv from 'dotenv';
import { DataExchange, IData } from '../../utils/types/dataExchange';
import { DataExchangeStatusEnum } from '../../utils/enums/dataExchangeStatusEnum';
import {
    bilateralUrls,
    consumerDataExchanges,
    consumerEndpoints,
    consumerIds,
    mockBilateral,
} from './utils/fixture';
import { readBillingUri } from '../../access-control/Billing';
import axios from 'axios';
import { Logger } from '../../libs/loggers/Logger';
import { PEP } from '../../access-control/PolicyEnforcementPoint';

dotenv.config({ path: '.env.test' });
PEP.showLog = true;

const consumerId: string = consumerIds._a;
const consumerDataExchange: string = consumerDataExchanges._a;
const consumerEndpoint: string = consumerEndpoints._a;
const serviceOffering: string = 'target_a'; // 'http://target/target_a';

let subscriptionIds: string[] = [];
const billingInit = async () => {
    try {
        const billingUri = await readBillingUri();
        const url = `${billingUri}/sync/subscriptions`;
        const response = await axios.post(url, [
            {
                isActive: true,
                participantId: consumerId,
                subscriptionType: 'payAmount',
                resourceId: serviceOffering,
                details: {
                    payAmount: 100,
                    startDate: new Date(
                        new Date().setDate(new Date().getDate() - 1)
                    ),
                    endDate: new Date(
                        new Date().setMonth(new Date().getMonth() + 1)
                    ),
                },
            },
        ]);
        if (response.status !== 201) {
            throw new Error(`Unexpected status code: ${response.status}`);
        }
        subscriptionIds = response.data.map(
            (item: { _id: string }) => item._id
        );
    } catch (error) {
        Logger.error({
            location: error.stack,
            message: error.message,
        });
    }
};

const billingClean = async () => {
    try {
        for (const id of subscriptionIds) {
            const billingUri = await readBillingUri();
            const url = `${billingUri}/sync/subscriptions/${id}`;
            const response = await axios.delete(url);
            if (response.status !== 204) {
                throw new Error(`Unexpected status code: ${response.status}`);
            }
        }
    } catch (error) {
        Logger.error({
            location: error.stack,
            message: error.message,
        });
    }
};

describe('Billing Access Control Test Cases', function () {
    let mongoServer: MongoMemoryServer;

    before(async function () {
        this.timeout(10000);
        try {
            mongoServer = await MongoMemoryServer.create();
            const uri = mongoServer.getUri();
            await mongoose.connect(uri);
        } catch (e) {
            Logger.error({
                message: e.message,
                location: e.stack,
            });
        }
        mockBilateral();
        const resource: IData = {
            serviceOffering,
            resource: '',
        };
        await DataExchange.create({
            consumerId,
            providerEndpoint: '',
            resource,
            purposeId: '',
            contract: bilateralUrls._a.join(''),
            consumerEndpoint,
            consumerDataExchange,
            status: DataExchangeStatusEnum.PENDING,
            createdAt: new Date(),
        });
        await billingInit();
    });

    after(async function () {
        await mongoose.disconnect();
        await mongoServer.stop();
        await billingClean();
    });

    it('Should ping PTX Billing Component', async function () {
        const billingUri = await readBillingUri();
        const url = `${billingUri}/ping`;
        const response = await axios.get(url);
        expect(response.status, 'Expected billing response to be 200').to.equal(
            200
        );
    });

    it('Should provide an export service for a consumer with a bilateral contract', async function () {
        const result = await providerExportService(consumerDataExchange);
        expect(
            result.status,
            'Expected export service status to be "EXPORT_SUCCESS"'
        ).to.equal('EXPORT_SUCCESS');
    });
});
