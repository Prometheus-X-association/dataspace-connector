import { Logger } from '../libs/loggers/Logger';
import { LeftOperand } from './types/leftOperand';

const processCount = async (
    contractId: string,
    resourceId: string
): Promise<void> => {
    try {
        await LeftOperand.findOneAndUpdate(
            {
                name: 'count',
                contractId,
                resourceId,
            },
            {
                $inc: { value: 1 },
            },
            {
                upsert: true,
                new: true,
            }
        );
    } catch (error) {
        Logger.error({
            location: error.stack,
            message: error.message,
        });
    }
};

export const processLeftOperands = async (
    names: string[],
    contractId: string,
    resourceId: string
): Promise<void> => {
    for (const name of names) {
        if (name === 'count') {
            await processCount(contractId, resourceId);
        }
    }
};
