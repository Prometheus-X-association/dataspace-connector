import { createHash } from 'node:crypto';
import { Readable } from 'stream';

export const checksum = (data: any) => {
    if (data instanceof Readable) {
        throw new Error('Unable to calculate hash for flowing readable stream');
    }

    let dataToHash: Buffer;

    if (Buffer.isBuffer(data)) {
        dataToHash = data;
    } else if (typeof data === 'string') {
        dataToHash = Buffer.from(data, 'utf-8');
    } else if (typeof data === 'object') {
        const jsonString = JSON.stringify(data);
        dataToHash = Buffer.from(jsonString, 'utf-8');
    } else {
        dataToHash = Buffer.from(data.toString(), 'utf-8');
    }

    return createHash('sha256')
        .update(dataToHash as any)
        .digest('hex');
};
