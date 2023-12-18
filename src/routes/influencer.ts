import express from "express";
import { influencerSendSchema, influencerSignupSchema, userLoginSchema, getConverationRequestParamsSchema } from "../helpers/zodSchemas";
import { Conversation, Message, User } from '../db'
import { UserRole } from "../helpers/enums";
import crypto from 'crypto'
import { generateJWT } from "../helpers/generateJWT";
import { authenticateInfluencer } from "../middlewares/auth";
import { handleError, sendErrorResponse } from "../helpers/errorHandler";
import { addNewMessageToDB } from "../helpers/messageHelper";
export const influencerRouter = express.Router();

influencerRouter.post('/signup', handleSignup);
influencerRouter.post('/login', handleLogin);
influencerRouter.get('/me', authenticateInfluencer, handleMe);
influencerRouter.post('/send', authenticateInfluencer, handleSend);
influencerRouter.get('/conversations', authenticateInfluencer, handleConversations);
influencerRouter.get('/conversations/:followerId', authenticateInfluencer, handleConversationsId);
influencerRouter.get('/:slug', handleSlug);
async function handleSignup(req: express.Request, res: express.Response) {
    const parsedInput = influencerSignupSchema.safeParse(req.body);
    if (!parsedInput.success) {
        return res.status(422).json({ error: parsedInput.error.message });
    }
    try {
        const data = parsedInput.data;
        const existingUser = await User.findOne({ email: data.email, role: UserRole.Influencer }).exec();
        if (existingUser) {
            return res.status(403).json({ error: 'User with same email already exists' })
        }
        const slug = await getSlugFromName(data.fullName);
        const hashedPassword = crypto.createHash('sha256').update(data.password).digest('hex');
        const newInfluencer = new User({
            fullName: data.fullName,
            email: data.email,
            hashedPassword,
            role: UserRole.Influencer,
            bio: data.bio,
            defaultMessage: data.defaultMessage,
            slug
        })
        await newInfluencer.save();
        try {
            var token = generateJWT(newInfluencer._id.toString(), UserRole.Influencer);
            res.json({
                message: `Influencer successfully created`,
                newInfluencer,
                token
            })
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'An unknown error occurred' });
            }
        }

    }
    catch (error) {
        handleError(error, res);
    }
}

async function handleLogin(req: express.Request, res: express.Response) {
    const parsedInput = userLoginSchema.safeParse(req.body);
    if (!parsedInput.success) {
        return sendErrorResponse(res,"User doesn't exist", 422);
    }
    const data = parsedInput.data;
    const existingInfluencer = await User.findOne({ email: data.email, role: UserRole.Influencer }).exec();
    if (!existingInfluencer) {
        return res.status(403).json({ error: 'No user exists with given email' });
    }
    try {
        const hashedPassword = crypto.createHash('sha256').update(data.password).digest('hex');
        if (hashedPassword !== existingInfluencer.hashedPassword) {
            return res.status(403).json({ error: 'Wrong password' });
        }
        const token = generateJWT(existingInfluencer._id.toString(), UserRole.Influencer);
        res.json({
            message: `Influencer successfully loggedin`,
            influencer: existingInfluencer,
            token
        })
    }
    catch (error) {
        handleError(error, res);
    }
}

async function handleMe(req: express.Request, res: express.Response) {
    try {
        const influencer = await User.findById(req.headers.influencerId);
        res.json({
            fullName: influencer?.fullName,
            id: influencer?.id,
            slug: influencer?.slug
        })
    }
    catch (error) {
        handleError(error, res);
    }
}
async function handleSlug(req: express.Request, res: express.Response) {
    try {
        const influencer = await User.findOne({ slug: req.params.slug, role: UserRole.Influencer }).exec();
        if (influencer) {
            res.json({
                fullName: influencer.fullName,
                bio: influencer.bio,
                defaultMessage: influencer.defaultMessage,
                id: influencer.id
            })
        }
        else {
            res.status(403).json({ error: 'influencer not found' })
        }
    }
    catch (error) {
        handleError(error, res);
    }
}

async function handleSend(req: express.Request, res: express.Response) {
    try {
        const parsedInput = influencerSendSchema.safeParse(req.body);
        if (!parsedInput.success) return sendErrorResponse(res, parsedInput.error.message, 422);
        const influencerId = req.headers.influencerId as string;
        const { followerId, content } = parsedInput.data;
        const follower = await User.findById(followerId);
        if (!follower || follower.role !== UserRole.Follower) {
            return sendErrorResponse(res, 'Follower does not exist', 403);
        }
        var convo = await Conversation.findOne({
            influencer: influencerId,
            follower: followerId
        });
        if (!convo) {
            return sendErrorResponse(res, 'Cant send first message as influencer', 403);
        }
        const newMessage = await addNewMessageToDB(content, influencerId, followerId, convo.id);
        convo.latestMessage = newMessage.id;
        convo = await convo.save();
        const messages = await Message.find({ conversation: convo.id }).sort({ timestamp: 1 });
        res.json({ messages });

    }
    catch (error) {
        handleError(error, res);
    }
}


async function getSlugFromName(fullname: string): Promise<string> {
    var slug = fullname.toLowerCase().replace(/\s+/g, '-');
    const existingUser = await User.findOne({ slug }).exec();
    if (existingUser) {
        return slug + Date.now();
    }
    else return slug;
}

async function handleConversations(req: express.Request, res: express.Response) {
    try {
        const influencerId = req.headers.influencerId as string;
        var conversations = await Conversation.find({
            influencer: influencerId,
        }).sort({ updated_at: 1 });
        if (!conversations || conversations.length === 0) {
            return sendErrorResponse(res, 'No conversations yet', 404);
        }
        const formattedConversationsPromises = conversations.map(async (c) => {
            if (!c.latestMessage) {
                return {
                    conversation: c,
                    latestMessage: null
                }
            }
            const msg = await Message.findById(c.latestMessage._id);
            const follower = await User.findById(c.follower);
            return {
                conversation: c,
                latestMessage: msg,
                follower
            }
        })
        const formattedConversations = await Promise.all(formattedConversationsPromises);
        res.json({ conversations: formattedConversations });
    }
    catch (error) {
        handleError(error, res);
    }
}


async function handleConversationsId(req: express.Request, res: express.Response) {
    try {
        const parsedParams = getConverationRequestParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            console.log('inside parsedparams error');
            return sendErrorResponse(res, parsedParams.error.message, 422);
        }
        const influencerId = req.headers.influencerId as string;
        const followerId = parsedParams.data.followerId;
        const convo = await Conversation.findOne({
            influencer: influencerId,
            follower: followerId
        });
        if (!convo) return sendErrorResponse(res, 'Convo doesnt exist', 404);
        const messages = await Message.find({
            conversation: convo.id
        }).sort({ timestamp: 1 });
        res.json({ messages });
    }
    catch (error) {
        handleError(error, res);
    }
}

