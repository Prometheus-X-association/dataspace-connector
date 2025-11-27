import {createHash} from "node:crypto";

export const checksum = (data: any) => {
    return createHash('sha256').update(data.toString()).digest('hex');
}