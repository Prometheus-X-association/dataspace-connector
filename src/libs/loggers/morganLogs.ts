import { Handler, Request } from 'express';
import morgan from 'morgan';
import { Logger } from './Logger';

const URLS_TO_SKIP = [
    'web',
    'favicon.ico',
    'vt-admin',
    'images',
    'android',
    'css',
    'javascripts',
    'stylesheets',
];

// Override the stream method with Logger
const stream = {
    write: (message: string) => Logger.morganLog(message),
};

// Function to determine if logging is skipped
const skip = (req: Request) => {
    // Skip navigation
    for (const url of URLS_TO_SKIP) {
        if (req.originalUrl.startsWith('/' + url)) return true;
    }

    if (req.originalUrl === '/') return true;
    return false;
};

export const morganLogs: Handler = morgan('combined', { stream, skip });
