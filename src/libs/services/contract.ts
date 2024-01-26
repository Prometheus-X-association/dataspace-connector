import axios from 'axios';

export const getContract = async (contractUri: string) => {
    return await axios.get(contractUri);
};
