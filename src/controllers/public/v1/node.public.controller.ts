import { CallbackPayload, NodeSignal, NodeSupervisor, SupervisorPayloadSetup } from 'dpcp-library';
import { Request, Response, NextFunction } from 'express';
import { NodeSupervisorInstance } from '../../../libs/loaders/nodeSupervisor';
import { Logger } from '../../../libs/loggers/Logger';

/**
 * A template method just to show the convention used
 */
export const setupNode = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { chainId, remoteConfigs } = req.body;
        const nodeId = await NodeSupervisorInstance.getInstance().handleRequest({
          signal: NodeSignal.NODE_SETUP,
          config: { ...remoteConfigs, chainId },
        } as SupervisorPayloadSetup);
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
 * A template method just to show the convention used
 */
export const runNode = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Run node based on chain ID and target ID
        NodeSupervisorInstance.getInstance().runNodeByRelation(req.body as CallbackPayload);
        res
          .status(200)
          .json({ message: 'Data received and processed successfully' });
      } catch (err) {
        const error: Error = err as Error;
        Logger.error({
          message: `Error processing received data: ${error.message}`,
        });
        res.status(500).json({ error: 'Internal server error' });
      }
};
