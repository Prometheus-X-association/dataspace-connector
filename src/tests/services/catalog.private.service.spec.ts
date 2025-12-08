import sinon from 'sinon';
import * as catalogService from '../../services/private/v1/catalog.private.service';
import { Catalog } from '../../utils/types/catalog';
import * as configLoader from '../../libs/loaders/configuration';
import { expect } from 'chai';

describe('Catalog Private Service', () => {
    afterEach(() => {
        sinon.restore();
    });

    describe('getCatalogService', () => {
        it('should return all catalog items', async () => {
            const fakeCatalog = [
                { resourceId: '1', type: 'type1', endpoint: 'endpoint1', enabled: true },
                { resourceId: '2', type: 'type2', endpoint: 'endpoint2', enabled: false },
            ];
            sinon.stub(Catalog, 'find').returns({ select: () => ({ lean: () => fakeCatalog }) } as any);

            const result = await catalogService.getCatalogService();
            expect(result).to.deep.equal(fakeCatalog);
        });
    });

    describe('getCatalogByIdService', () => {
        it('should return a catalog item by id', async () => {
            const fakeItem = { resourceId: '1', type: 'type1', endpoint: 'endpoint1', enabled: true };
            sinon.stub(Catalog, 'findById').returns({ select: () => ({ lean: () => fakeItem }) } as any);

            const result = await catalogService.getCatalogByIdService('someid');
            expect(result).to.deep.equal(fakeItem);
        });

        it('should return null for non-existent id', async () => {
            sinon.stub(Catalog, 'findById').returns({ select: (): { lean: () => null } => ({ lean: () => null }) } as any);

            const result = await catalogService.getCatalogByIdService('badid');
            expect(result).to.be.null;
        });
    });

    describe('updateCatalogByIdService', () => {
        it('should update a catalog item', async () => {
            const updated = { resourceId: '1', type: 'type1', endpoint: 'endpoint1', enabled: false };
            sinon.stub(Catalog, 'findByIdAndUpdate').returns({ select: () => ({ lean: () => updated }) } as any);

            const result = await catalogService.updateCatalogByIdService('someid', { enabled: false });
            expect(result).to.deep.equal(updated);
        });
    });

    describe('createCatalogResourceService', () => {
        it('should create a new catalog resource', async () => {
            sinon.stub(configLoader, 'getCatalogUri').resolves('http://example.com');
            const created = { resourceId: '1', type: 'type1', endpoint: 'http://example.com/type1/1', enabled: true };
            sinon.stub(Catalog, 'create').resolves(created as any);

            const result = await catalogService.createCatalogResourceService('1', 'type1');
            expect(result).to.deep.equal(created);
        });
    });
});
