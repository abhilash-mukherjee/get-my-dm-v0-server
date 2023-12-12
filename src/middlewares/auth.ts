import jwt, {JwtPayload } from 'jsonwebtoken';
import { headerSchema } from '../helpers/zodSchemas'; 
import { handleError } from '../helpers/errorHandler';
import {Request, Response, NextFunction} from 'express';
import { User } from '../db';
import { UserRole } from '../helpers/enums';
export async function authenticateInfluencer(req : Request, res: Response, next: NextFunction){
    const parsedHeader = headerSchema.safeParse(req.headers);
    if(!parsedHeader.success){
        return res.status(403).json({error: parsedHeader.error.message})
    }
    const token = getAuthToken(parsedHeader.data.authorization);
    if(!token){
        return res.status(403).json({error: 'Invalid auth token'});
    }
    try {
        if(!process.env.INFLUENCER_SK){
            throw new Error('Secret keys are not set');
        }
        const decoded = jwt.verify(token, process.env.INFLUENCER_SK);
        const  decodedPayload = decoded as JwtPayload;
        if (decodedPayload) {
            console.log(decodedPayload);
            const influencer = await User.findById(decodedPayload.userId);
            if (influencer && influencer.role === UserRole.Influencer) {
                req.headers['influencerId'] = influencer._id.toString();
                next();
            }
            else {
                res.status(403).json({ error: "Couldn't find influencer" });
            }
        }
    }
    catch (error) {
        handleError(error,res);
    }
}

export async function authenticateFollower(req : Request, res: Response, next: NextFunction){
    const parsedHeader = headerSchema.safeParse(req.headers);
    if(!parsedHeader.success){
        return res.status(403).json({error: parsedHeader.error.message})
    }
    const token = getAuthToken(parsedHeader.data.authorization);
    if(!token){
        return res.status(403).json({error: 'Invalid auth token'});
    }
    try {
        if(!process.env.FOLLOWER_SK){
            throw new Error('Secret keys are not set');
        }
        const decoded = jwt.verify(token, process.env.FOLLOWER_SK);
        const  decodedPayload = decoded as JwtPayload;
        if (decodedPayload) {
            console.log(decodedPayload);
            const follower = await User.findById(decodedPayload.userId);
            if (follower && follower.role === UserRole.Follower) {
                req.headers['followerId'] = follower._id.toString();
                next();
            }
            else {
                res.status(403).json({ error: "Couldn't find user" });
            }
        }
    }
    catch (error) {
        handleError(error,res);
    }
}

function getAuthToken(authorization : string) {
    return authorization.split(' ')[1];
}
