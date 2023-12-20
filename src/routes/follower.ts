import express from "express";
import { followerSignupSchema, userLoginSchema, followerSendSchema, followerGetConvoSchema, updateMessageStatusSchema } from "../helpers/zodSchemas";
import { Conversation, Message, User } from '../db'
import { UserRole } from "../helpers/enums";
import { addNewMessageToDB, addNewConvoToDB, updateMessageStatus } from "../helpers/messageHelper";
import crypto from 'crypto'
import { generateJWT } from "../helpers/generateJWT";
import { authenticateFollower, authenticateInfluencer } from "../middlewares/auth";
import { handleError, sendErrorResponse } from "../helpers/errorHandler";
export const followerRouter = express.Router();
followerRouter.post('/signup', handleSignup);
followerRouter.post('/login', handleLogin);
followerRouter.post('/send', authenticateFollower, handleSend);
followerRouter.get('/conversation', authenticateFollower, handleConversation);
followerRouter.patch('/updateMessage', authenticateFollower, handleUpdateMessage);

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
        return sendErrorResponse(res,"User doesn't exist", 422);
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

async function handleSend(req: express.Request, res: express.Response) {
    try {
        const parsedInput = followerSendSchema.safeParse(req.body);
        if (!parsedInput.success) return sendErrorResponse(res, parsedInput.error.message, 422);
        const followerId = req.headers.followerId as string;
        const { influencerId, content } = parsedInput.data;
        const influencer = await User.findById(influencerId);
        if(!influencer || influencer.role !== UserRole.Influencer || !influencer.defaultMessage){
            return sendErrorResponse(res, 'Influencer does not exist', 403);
        }
        var convo = await Conversation.findOne({
            influencer: influencerId,
            follower: followerId
        });
        if(!convo){
            convo = await addNewConvoToDB(influencer.defaultMessage, influencerId, followerId);
        }
        const newMessage = await addNewMessageToDB(content,followerId,influencerId,convo.id);
        convo.latestMessage = newMessage.id;
        convo = await convo.save();
        const messages = await Message.find({conversation: convo.id}).sort({ timestamp: 1 });
        res.json({ messages  });

    }
    catch (error) {
        handleError(error, res);
    }
}

async function handleConversation(req: express.Request, res: express.Response) {
    try {
        const parsedInput = followerGetConvoSchema.safeParse(req.body);
        if (!parsedInput.success) return sendErrorResponse(res, parsedInput.error.message, 422);
        const followerId = req.headers.followerId as string;
        const influencerId = parsedInput.data.influencerId;
        const convo = await Conversation.findOne({
            influencer: influencerId,
            follower: followerId
        })
        if(!convo) return sendErrorResponse(res, 'No conversation yet', 404);
        const messages = await Message.find({conversation: convo.id}).sort({ timestamp: 1 });
        res.json({ messages  });
    }
    catch (error) {
        handleError(error, res);
    }
}

async function handleUpdateMessage(req: express.Request, res: express.Response) {
    try {
        const parsedInput = updateMessageStatusSchema.safeParse(req.body);
        if (!parsedInput.success) return sendErrorResponse(res, parsedInput.error.message, 422);
        const followerId = req.headers.followerId as string;
        const { messageId, newStatus } = parsedInput.data;
        const message = await Message.findById(messageId)
        if (!message) {
            return sendErrorResponse(res, 'Message not found', 404);
        }
        if(message.receiver.toString() !== followerId){
            return sendErrorResponse(res, 'Cant change status of this message', 403);
        }
        const updatedMessage = await updateMessageStatus(messageId,newStatus);
        res.json({
            message: 'message status updated',
            updatedMessage
        });
    }
    catch (error) {
        handleError(error, res);
    }
}