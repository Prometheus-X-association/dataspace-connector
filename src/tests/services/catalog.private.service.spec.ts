import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as catalogService from '../../services/private/v1/catalog.private.service';
import { Catalog } from '../../utils/types/catalog';
import * as configLoader from '../../libs/loaders/configuration';
import { expect } from 'chai';
import { AppServer, startServer } from '../../server';
import { config, setupEnvironment } from '../../config/environment';
import sinon from 'sinon';

let mongoServer: MongoMemoryServer;
let serverInstance: AppServer;
process.env.NODE_ENV = 'test';
const originalReadFileSync = require('fs').readFileSync;

before(async () => {
    const file = {
        "endpoint": "https://test.com",
        "serviceKey": "789456123",
        "secretKey": "789456123",
        "catalogUri": "https://test.com",
        "contractUri": "https://test.com",
        "consentUri": "https://test.com",
    }

    require('fs').readFileSync = () => JSON.stringify(file);
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    setupEnvironment();
    serverInstance = await startServer(config.port);
});

after(async () => {
    serverInstance.server.close();
    console.log("Server closed");
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('Catalog Private Service', () => {
  describe('getCatalogService', () => {
    it('should return all catalog items', async () => {
      await Catalog.create([
        { resourceId: '1', type: 'type1', endpoint: 'endpoint1', enabled: true },
        { resourceId: '2', type: 'type2', endpoint: 'endpoint2', enabled: false },
      ]);

      const result = await catalogService.getCatalogService();

      expect(result).to.have.length(2);
      expect(result[0]).to.have.property('resourceId', '1');
      expect(result[1]).to.have.property('resourceId', '2');
    });
  });

  describe('getCatalogByIdService', () => {
    it('should return a catalog item by id', async () => {
      const catalog = await Catalog.create({ resourceId: '1', type: 'type1', endpoint: 'endpoint1', enabled: true });

      const result = await catalogService.getCatalogByIdService(catalog._id.toString());

      expect(result).to.have.property('resourceId', '1');
      expect(result).to.have.property('type', 'type1');
    });

    it('should return null for non-existent id', async () => {
      const result = await catalogService.getCatalogByIdService(new mongoose.Types.ObjectId().toString());

      expect(result).to.be.null;
    });
  });

  describe('updateCatalogByIdService', () => {
    it('should update a catalog item', async () => {
      const catalog = await Catalog.create({ resourceId: '1', type: 'type1', endpoint: 'endpoint1', enabled: true });

      const result = await catalogService.updateCatalogByIdService(catalog._id.toString(), { enabled: false });

      expect(result).to.have.property('enabled', false);
    });
  });

  describe('createCatalogResourceService', () => {
    it('should create a new catalog resource', async () => {
      sinon.stub(configLoader, 'getCatalogUri').resolves('http://example.com');
  
      const result = await catalogService.createCatalogResourceService('1', 'type1');
  
      expect(result).to.have.property('resourceId', '1');
      expect(result).to.have.property('type', 'type1');
      expect(result).to.have.property('endpoint', 'http://example.com/type1/1');
      expect(result).to.have.property('enabled', true);
  
      sinon.restore();
    });
  });
});
