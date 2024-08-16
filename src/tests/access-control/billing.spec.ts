import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { providerExportService } from '../../services/public/v1/provider.public.service';
import dotenv from 'dotenv';
import { DataExchange, IDataExchange } from '../../utils/types/dataExchange';
import { DataExchangeStatusEnum } from '../../utils/enums/dataExchangeStatusEnum';

dotenv.config({ path: '.env.test' });

describe('Billing access control test cases', function () {
    let mongoServer: MongoMemoryServer;
    before(async function () {
        this.timeout(10000);
        mongoServer = await MongoMemoryServer.create();
        const dataExchange: IDataExchange = await DataExchange.create({
            providerEndpoint: '',
            resource: '',
            purposeId: '',
            contract: '',
            status: DataExchangeStatusEnum.PENDING,
            createdAt: new Date(),
        });
    });
    after(async function () {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('Should ...', async function () {
        providerExportService('consumer_1');
    });
});
