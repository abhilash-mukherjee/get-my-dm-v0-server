"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConverationRequestParamsSchema = exports.influencerGetConvoSchema = exports.influencerSendSchema = exports.followerGetConvoSchema = exports.followerSendSchema = exports.headerSchema = exports.userLoginSchema = exports.followerSignupSchema = exports.influencerSignupSchema = void 0;
const zod_1 = require("zod");
exports.influencerSignupSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).max(30),
    email: zod_1.z.string().email().min(5).max(40),
    password: zod_1.z.string().min(6).max(30),
    bio: zod_1.z.string().min(5).max(40),
    defaultMessage: zod_1.z.string().min(50).max(2000),
});
exports.followerSignupSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).max(30),
    email: zod_1.z.string().email().min(5).max(40),
    password: zod_1.z.string().min(6).max(30),
});
exports.userLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email().min(5).max(40),
    password: zod_1.z.string().min(6).max(30),
});
exports.headerSchema = zod_1.z.object({
    authorization: zod_1.z.string()
});
exports.followerSendSchema = zod_1.z.object({
    influencerId: zod_1.z.string().max(100),
    content: zod_1.z.string().max(3000)
});
exports.followerGetConvoSchema = zod_1.z.object({
    influencerId: zod_1.z.string().max(100),
});
exports.influencerSendSchema = zod_1.z.object({
    followerId: zod_1.z.string().max(100),
    content: zod_1.z.string().max(3000)
});
exports.influencerGetConvoSchema = zod_1.z.object({
    followerId: zod_1.z.string().max(100),
});
exports.getConverationRequestParamsSchema = zod_1.z.object({
    followerId: zod_1.z.string().min(1).max(50)
});
