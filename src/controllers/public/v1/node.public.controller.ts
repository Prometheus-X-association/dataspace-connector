import { Request, Response } from 'express';
import { Logger } from '../../../libs/loggers';
import { SupervisorContainer } from '../../../libs/loaders/nodeSupervisor';
import { getAppKey } from '../../../libs/loaders/configuration';
import {
    ChainStatus,
    NodeSignal,
    NodeSupervisor,
    PipelineProcessor,
} from 'dpcp-library/lib';
import { nodeResumeService } from '../../../services/public/v1/node.public.service';

/**
 * Set up the node
 * @param req
 * @param res
 */
export const setupNode = async (req: Request, res: Response) => {
    try {
        const nodeSupervisor = await SupervisorContainer.getInstance(
            await getAppKey()
        );
        const { chainId, remoteConfigs } = req.body;
        const nodeId = nodeSupervisor.communicateNode({
            chainId,
            remoteConfigs,
            communicationType: 'setup',
        });
        res.status(201).json({ nodeId });
    } catch (err) {
        const error = err as Error;
        Logger.error({
            message: `Error setting up node: ${error.message}`,
        });
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Run the node
 * @param req
 * @param res
 */
export const runNode = async (req: Request, res: Response) => {
    try {
        const nodeSupervisor = await SupervisorContainer.getInstance(
            await getAppKey()
        );
        const { chainId } = req.body;

        await nodeSupervisor.communicateNode({
            chainId,
            remoteConfigs: req.body,
            communicationType: 'run',
        });

        return res.status(200).json({
            message: 'Data received and processed successfully',
        });
    } catch (err) {
        const error: Error = err as Error;
        Logger.error({
            message: `Error processing received data: ${error.message}`,
        });
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Pause the node
 * @param req
 * @param res
 */
export const pauseNode = async (req: Request, res: Response) => {
    try {
        const nodeSupervisor = await SupervisorContainer.getInstance(
            await getAppKey()
        );
        const { chainId } = req.body;

        await nodeSupervisor.communicateNode({
            chainId,
            communicationType: 'pause',
        });

        return res.status(200).json({
            message: 'Node paused successfully',
        });
    } catch (err) {
        const error: Error = err as Error;
        Logger.error({
            message: `Error processing received data: ${error.message}`,
        });
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Pause the node
 * @param req
 * @param res
 */
export const resumeNode = async (req: Request, res: Response) => {
    try {
        const { hostURI, targetId, chainId, data, params } = req.body;

        const resumeNode = await nodeResumeService({
            hostURI,
            targetId,
            chainId,
            data,
            params,
        });

        if (resumeNode.success) {
            return res.status(200).json({
                message: 'Node resumed successfully',
            });
        } else {
            return res.status(500).json({ error: 'Failed to resume node' });
        }
    } catch (err) {
        const error: Error = err as Error;
        Logger.error({
            message: `Error processing received data: ${error.message}`,
        });
        return res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * notify
 * @param req
 * @param res
 */
export const notify = async (req: Request, res: Response) => {
    try {
        const nodeSupervisor = await SupervisorContainer.getInstance(
            await getAppKey()
        );
        const { chainId, signal } = req.body;

        await nodeSupervisor.communicateNode({
            chainId,
            signal,
            communicationType: 'notify',
        });

        return res.status(200).json({
            message: 'Data received and processed successfully',
        });
    } catch (err) {
        const error: Error = err as Error;
        Logger.error({
            message: `Error processing received data: ${error.message}`,
        });
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * notify
 * @param req
 * @param res
 */
export const preProcess = async (req: Request, res: Response) => {
    try {
        await SupervisorContainer.getInstance(await getAppKey());
        const body = req.body;

        const data = await PipelineProcessor.preProcessorCallback({
            targetId: body.targetId,
            data: body.data,
            nextTargetId: body.nextTargetId,
            previousTargetId: body.previousTargetId,
            nextNodeResolver: body.nextNodeResolver,
            chainId: body.chainId,
            meta: body.services[0].meta,
        });

        res.status(200).json({
            data,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
