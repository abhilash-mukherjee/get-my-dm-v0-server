import express from "express";
import { influencerSignupSchema } from "../helpers/zodSchemas";
import {User} from '../db'
import { UserRole } from "../helpers/enums";
import crypto from 'crypto'
export const influencerRouter = express.Router();
influencerRouter.get('/me', (req, res) => {
    res.json({ message: 'Hello. its me' });
})
influencerRouter.post('/signup',handleSignup);

async function handleSignup(req :express.Request, res : express.Response) {
    const parsedInput = influencerSignupSchema.safeParse(req.body);
    if(!parsedInput.success){
        return res.status(422).json({error:parsedInput.error.message});
    }
    try{
        const data = parsedInput.data;
        const slug = getSlugFromName(data.fullName);
        const hashedPassword = crypto.createHash('sha256').update(data.password).digest('hex');
        const newInfluencer= new User({
            fullName: data.fullName,
            email: data.email,
            hashedPassword,
            role: UserRole.Influencer,
            bio: data.bio,
            defaultMessage: data.defaultMessage,
            slug
        })
        await newInfluencer.save();
        res.json({
            message: `Influencer successfully created`,
            newInfluencer
        })

    }
    catch(error){
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
}


function getSlugFromName(fullname:string) : string {
    return fullname.toLowerCase().replace(/\s+/g, '-');
}