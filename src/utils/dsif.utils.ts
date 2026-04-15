export const getContractServiceHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'x-ptx-catalog-key': process.env.X_PTX_CONTRACT_CATALOG_KEY,
    };
};
