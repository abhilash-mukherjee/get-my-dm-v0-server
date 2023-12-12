import jwt from 'jsonwebtoken'
import { UserRole } from './enums'
require('dotenv').config();

export function generateJWT(userId:string, role: UserRole) :string
{
    if(!process.env.INFLUENCER_SK || !process.env.FOLLOWER_SK){
        throw new Error('Secret keys are not set');
    }
    const token = jwt.sign({userId, role}, role === UserRole.Influencer ? process.env.INFLUENCER_SK : process.env.FOLLOWER_SK, { expiresIn: '5h' });
    return token;
}