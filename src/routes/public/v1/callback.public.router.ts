import { Router } from 'express';
import {pendingDirectResponseVisualizations} from "../../../libs/loaders/pendingDirectResponseVisualization";
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: DirectResponseVisualization
 *   description: Data preview callback routes
 */

/**
 * @swagger
 * /direct-response-visualization/{directResponseVisualizationId}:
 *   post:
 *     summary: Resolve a pending data preview
 *     description: Callback endpoint used to resolve a pending data preview request identified by its ID.
 *     tags: [DirectResponseVisualization]
 *     parameters:
 *       - in: path
 *         name: directResponseVisualizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the pending data preview
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: The data payload to resolve the preview with
 *     responses:
 *       '200':
 *         description: Data preview successfully resolved
 *       '404':
 *         description: No pending data preview found for the given ID
 */
r.post('/direct-response-visualization/:directResponseVisualizationId', (req, res) => {
    const entry = pendingDirectResponseVisualizations.get(req.params.directResponseVisualizationId);
    if (!entry) return res.sendStatus(404);

    clearTimeout(entry.timer);
    pendingDirectResponseVisualizations.delete(req.params.directResponseVisualizationId);
    entry.resolve(req.body);

    res.sendStatus(200);
});

export default r;
