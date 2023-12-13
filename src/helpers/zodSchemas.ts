import { z } from 'zod';
export const influencerSignupSchema = z.object({
    fullName: z.string().min(2).max(30),
    email: z.string().email().min(5).max(40),
    password: z.string().min(6).max(30),
    bio: z.string().min(5).max(40),
    defaultMessage: z.string().min(50).max(2000),
})
export const followerSignupSchema = z.object({
    fullName: z.string().min(2).max(30),
    email: z.string().email().min(5).max(40),
    password: z.string().min(6).max(30),
})
export const userLoginSchema = z.object({
    email: z.string().email().min(5).max(40),
    password: z.string().min(6).max(30),
})
export const headerSchema = z.object({
    authorization: z.string()
})
export const followerSendSchema = z.object({
    influencerId: z.string().max(100),
    content: z.string().max(3000)
})

export const followerGetConvoSchema = z.object({
    influencerId: z.string().max(100),
})


export const influencerSendSchema = z.object({
    followerId: z.string().max(100),
    content: z.string().max(3000)
})

export const influencerGetConvoSchema = z.object({
    followerId: z.string().max(100),
})