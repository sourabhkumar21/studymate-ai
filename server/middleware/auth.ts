import {Request, Response, NextFunction} from 'express';
import { getAuth } from '@clerk/express'; // ✨ 1. Import the TS-friendly helper
import * as Sentry from "@sentry/node";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // ✨ ADD THIS TRACKER:
         console.log("🛡️ BACKEND HEADER:", req.headers.authorization);

         //const{userId} = getAuth(req);
         // 1. Grab the ENTIRE object from Clerk and save it to a temporary variable
         const authObject = getAuth(req);
         
         // 2. Print that whole object to the terminal so we can read it!
         console.log("🕵️ CLERK AUTH DATA:", authObject);
         
         // 3. Now extract the userId just like you did before
         const { userId } = authObject;
         
         if(!userId){
            return res.status(401).json({message: 'Unauthorized'});
         }  
            next();
    } catch (error: any) {
        Sentry.captureException(error);
        return res.status(401).json({message:error.code || error.message});
    }
};