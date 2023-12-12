import express from "express";
import { followerSignupSchema, userLoginSchema } from "../helpers/zodSchemas";
import { User } from '../db'
import { UserRole } from "../helpers/enums";
import crypto from 'crypto'
import { generateJWT } from "../helpers/generateJWT";
import { authenticateInfluencer } from "../middlewares/auth";
import { handleError } from "../helpers/errorHandler";
export const followerRouter = express.Router();
followerRouter.post('/signup', handleSignup);
followerRouter.post('/login', handleLogin);

async function handleSignup(req: express.Request, res: express.Response) {
    const parsedInput = followerSignupSchema.safeParse(req.body);
    if (!parsedInput.success) {
        return res.status(422).json({ error: parsedInput.error.message });
    }
    try {
        const data = parsedInput.data;
        const existingFollower = await User.findOne({ email: data.email, role: UserRole.Follower }).exec();
        if (existingFollower) {
            return res.status(403).json({ error: 'User with same email already exists' })
        }
        const hashedPassword = crypto.createHash('sha256').update(data.password).digest('hex');
        const newFollower = new User({
            fullName: data.fullName,
            email: data.email,
            hashedPassword,
            role: UserRole.Follower
        })
        await newFollower.save();
        try {
            var token = generateJWT(newFollower._id.toString(), UserRole.Follower);
            res.json({
                message: `Follower successfully created`,
                follower: newFollower,
                token
            })
        }
        catch (error) {
            handleError(error, res);
        }
    }
    catch (error) {
        handleError(error, res);
    }
}

async function handleLogin(req: express.Request, res: express.Response) {
    const parsedInput = userLoginSchema.safeParse(req.body);
    if (!parsedInput.success) {
        return res.status(422).json({ error: parsedInput.error.message });
    }
    const data = parsedInput.data;
    const existingFollower = await User.findOne({ email: data.email, role: UserRole.Follower }).exec();
    if (!existingFollower) {
        return res.status(403).json({ error: 'No user exists with given email' });
    }
    try {
        const hashedPassword = crypto.createHash('sha256').update(data.password).digest('hex');
        if (hashedPassword !== existingFollower.hashedPassword) {
            return res.status(403).json({ error: 'Wrong password' });
        }
        const token = generateJWT(existingFollower._id.toString(), UserRole.Follower);
        res.json({
            message: `Follower successfully loggedin`,
            follower: existingFollower,
            token
        })
    }
    catch (error) {
        handleError(error, res);
    }
}