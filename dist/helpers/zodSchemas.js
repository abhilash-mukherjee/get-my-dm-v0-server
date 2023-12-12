"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.influencerSignupSchema = void 0;
const zod_1 = require("zod");
exports.influencerSignupSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).max(30),
    email: zod_1.z.string().email().min(5).max(40),
    password: zod_1.z.string().min(6).max(30),
    bio: zod_1.z.string().min(5).max(40),
    defaultMessage: zod_1.z.string().min(50).max(2000),
});
