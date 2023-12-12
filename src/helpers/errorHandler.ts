import { Response } from "express";
export function handleError(error: any, res: Response) {
    console.log('inside error handler');
    if (error instanceof Error) {
        res.status(500).json({ error: error.message });
    } else {
        res.status(500).json({ error: 'An unknown error occurred' });
    }
}