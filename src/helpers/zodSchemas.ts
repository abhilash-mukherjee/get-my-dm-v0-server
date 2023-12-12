import {z} from 'zod';
export const influencerSignupSchema = z.object({
    fullName : z.string().min(2).max(30), 
    email : z.string().email().min(5).max(40), 
    password : z.string().min(6).max(30), 
    bio : z.string().min(5).max(40),
    defaultMessage : z.string().min(50).max(2000),
})