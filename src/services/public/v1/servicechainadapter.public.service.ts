import {
    getRepresentation,
    postOrPutRepresentation,
} from '../../../libs/loaders/representationFetcher';
import {
    getPayloadType,
    postOrPutPayloadType,
} from '../../../utils/types/representationFetcherType';
import { nodeResumeService } from './node.public.service';
import {Logger} from "../../../libs/loggers";

/**
 * Service Chain Adapter Service
 */
export class ServiceChainAdapterService {
    payload: getPayloadType | postOrPutPayloadType;

    constructor(payload: getPayloadType | postOrPutPayloadType) {
        this.payload = payload;

    }

    /**
     * Process GET representation flow
     */
    async processGetRepresentationFlow(): Promise<{ status: number; message: string }> {
        const response = getRepresentation(this.payload as getPayloadType);

        setTimeout(() => this.resumeNode(response), 100);

        return this.response();
    }

    /**
     * Process POST or PUT representation flow
     */
    async processPotsOrPutRepresentationFlow(): Promise<{ status: number; message: string }> {
        const response = await postOrPutRepresentation(
            this.payload as postOrPutPayloadType
        );

        setTimeout(() => this.resumeNode(response), 100);

        return this.response();
    }

    /**
     * Resume the node processing
     * @param response
     */
    resumeNode(response: any): void {
        const targetId = this.payload.targetId || '';
        const chainId = this.payload.chainId || '';

        if (response) {
            nodeResumeService({
                targetId,
                chainId,
                data: response?.data || response,
                params: response?.params || "",
            }).then((res) => {
                if(res.success) Logger.log({ message: `Chain Id: ${chainId} resumed successfully for target Id ${targetId}` });
                else Logger.error({ message: `Error resuming chain Id: ${chainId} for target Id ${targetId}` });
            }).catch((error) => {
                Logger.error({ message: `Error resuming chain Id: ${chainId} for target Id ${targetId}` });
                Logger.error({ message: error });
            });
        }
    }

    /**
     * Standard ACK response
     */
    response() {
        return { status: 200, message: 'ACK' };
    }
}
