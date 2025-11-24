import {BinaryLike, createHash} from "node:crypto";

export const checksum = (data: any) => {
    return createHash('sha256').update(<BinaryLike>data).digest('hex');
}