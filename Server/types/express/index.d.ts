import * as express from 'express';
import { Multer } from 'multer'; // Import Multer types

declare global {
    namespace Express {
        interface Request {
            file?: Multer.File; // Add the file property
            files?: { [fieldname: string]: Multer.File[] }; // For multiple files
            user?: { // Add user property
                _id: string;
                name: string;
                role: string; // Add role property
                // Add any other user properties as needed
            };
        }
    }
}
