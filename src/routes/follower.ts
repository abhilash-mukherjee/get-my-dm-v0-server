import express from "express";
import { followerSignupSchema, userLoginSchema, followerSendSchema } from "../helpers/zodSchemas";
import { Conversation, Message, User } from '../db'
import { UserRole } from "../helpers/enums";
import crypto from 'crypto'
import { generateJWT } from "../helpers/generateJWT";
import { authenticateFollower, authenticateInfluencer } from "../middlewares/auth";
import { handleError, sendErrorResponse } from "../helpers/errorHandler";
export const followerRouter = express.Router();
followerRouter.post('/signup', handleSignup);
followerRouter.post('/login', handleLogin);
followerRouter.post('/send', authenticateFollower, handleSend);

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

async function addNewConvoToDB(defaultMessage : string, influencerId : string, followerId:string){
    var newConvo = new Conversation({
        influencer: influencerId,
        follower: followerId,
        updated_at: Date.now()
    })
    newConvo = await newConvo.save();
    const   newMessage = await addNewMessageToDB(defaultMessage,influencerId, followerId, newConvo.id);
    newConvo.latestMessage = newMessage.id;
    newConvo = await newConvo.save();
    return newConvo;
}

async function addNewMessageToDB(content : string, senderId : string, receiverId :string, convoId : string){
    var newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        content: content,
        timestamp: Date.now(),
        conversation: convoId
    });
    newMessage = await newMessage.save();
    return newMessage;
}