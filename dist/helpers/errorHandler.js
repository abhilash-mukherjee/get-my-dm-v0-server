"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
function handleError(error, res) {
    console.log('inside error handler');
    if (error instanceof Error) {
        res.status(500).json({ error: error.message });
    }
    else {
        res.status(500).json({ error: 'An unknown error occurred' });
    }
}
exports.handleError = handleError;
