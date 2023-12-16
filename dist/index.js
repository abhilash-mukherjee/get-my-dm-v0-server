"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const influencer_1 = require("./routes/influencer");
const follower_1 = require("./routes/follower");
require('dotenv').config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use('/influencer', influencer_1.influencerRouter);
app.use('/follower', follower_1.followerRouter);
app.get('/', (req, res) => { res.json({ message: 'Hello World!!!' }); });
if (process.env.MONGODB_URL) {
    mongoose_1.default.connect(process.env.MONGODB_URL).then(() => {
        console.log('connected to DB');
        app.listen(port, () => { console.log(`Example app listening on port ${port}`); });
    });
}
else {
    throw new Error('MONGODB_URL is not set');
}
