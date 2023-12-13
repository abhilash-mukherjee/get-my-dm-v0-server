import { Response } from "express";
export function handleError(error: any, res: Response) {
    console.log('inside handleerror')
    if (error instanceof Error) {
        res.status(500).json({ error: error.message });
    } else {
        res.status(500).json({ error: 'An unknown error occurred' });
    }
}

export function sendErrorResponse(res: Response, message: string, status: number) {
    return res.status(status).json({ error: message });
}