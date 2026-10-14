import axios from 'axios';
import { getControlPlaneWebhookUrls } from '../../../libs/loaders/configuration';
import { Logger } from '../../../libs/loggers';
import { IDataExchange } from '../../../utils/types/dataExchange';

export type ControlPlaneEventType =
    | 'exchange.created'
    | 'participant.authorized'
    | 'participant.denied'
    | 'transfer.completed'
    | 'transfer.failed';

const createEventPayload = (
    type: ControlPlaneEventType,
    exchange: IDataExchange
) => ({
    type,
    occurredAt: new Date().toISOString(),
    exchange: {
        id: exchange._id.toString(),
        workflow: exchange.workflow,
        contract: exchange.contract,
        providerEndpoint: exchange.providerEndpoint,
        consumerEndpoint: exchange.consumerEndpoint,
        status: exchange.status,
        providerData: exchange.providerData,
        controlPlane: exchange.controlPlane,
    },
});

export const publishControlPlaneEvent = async (
    type: ControlPlaneEventType,
    exchange: IDataExchange
): Promise<void> => {
    const configuredUrls = await getControlPlaneWebhookUrls();
    const callbackUrl = exchange.controlPlane?.callbackUrl;
    const recipientUrls = Array.from(
        new Set([...configuredUrls, ...(callbackUrl ? [callbackUrl] : [])])
    );

    const eventPayload = createEventPayload(type, exchange);
    const results = await Promise.allSettled(
        recipientUrls.map((recipientUrl) =>
            axios.post(recipientUrl, eventPayload, { timeout: 5000 })
        )
    );

    if (results.some((result) => result.status === 'rejected')) {
        Logger.warn({
            message: `Control-plane ${type} webhook delivery failed`,
            location: 'publishControlPlaneEvent',
        });
    }
};
