import express from "express";
import { influencerSignupSchema, influencerLoginSchema } from "../helpers/zodSchemas";
import { User } from '../db'
import { UserRole } from "../helpers/enums";
import crypto from 'crypto'
import { generateJWT } from "../helpers/generateJWT";
export const influencerRouter = express.Router();
influencerRouter.get('/me', (req, res) => {
    res.json({ message: 'Hello. its me' });
})
influencerRouter.post('/signup', handleSignup);
influencerRouter.post('/login', handleLogin);

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
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
}

async function handleLogin(req: express.Request, res: express.Response) {
    const parsedInput = influencerLoginSchema.safeParse(req.body);
    if(!parsedInput.success){
        return res.status(422).json({ error: parsedInput.error.message });
    }
    const data = parsedInput.data;
    const existingInfluencer = await User.findOne({email:data.email, role: UserRole.Influencer}).exec();
    if(!existingInfluencer){
        return res.status(403).json({error: 'No user exists with given email'});
    }
    try{
        const token = generateJWT(existingInfluencer._id.toString(),UserRole.Influencer);
        res.json({
            message: `Influencer successfully loggedin`,
            influencer: existingInfluencer,
            token
        })
    }
    catch (error){
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
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