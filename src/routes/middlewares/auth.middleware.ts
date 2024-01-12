import { NextFunction, Request, Response } from "express";
import {verifyToken} from "../../libs/jwt";

/**
 * Checks the validation pipeline of express-validator
 */
export const auth = async (req: Request, res: Response, next: NextFunction) => {
    if(!req.header('Authorization')) return res.status(401).json("You need to be authenticated");
    const jwt = await verifyToken(req.header('Authorization') );
    if(!jwt) return res.status(401).json("You need to be Authenticated");
    else next();
};
