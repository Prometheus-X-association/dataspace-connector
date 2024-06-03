import { Request, Response, NextFunction } from 'express';
import { IUser, User } from '../../../utils/types/user';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';
import fs from 'fs';
import {
    getConsentUri, getRegistrationUri,
    getSecretKey,
    getServiceKey,
} from '../../../libs/loaders/configuration';
import { Logger } from '../../../libs/loggers';
import axios from 'axios';
import { urlChecker } from '../../../utils/urlChecker';
import {consentServiceResume} from "../../../libs/services/consent";

/**
 * Create a user and create a user identifier in the consent manager
 * @param req
 * @param res
 * @param next
 */
export const createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!(await getConsentUri())) {
            return restfulResponse(res, 400, {
                error: 'Please add a consent URI on your config.json or with the configuration route.',
            });
        }

        const verifyUser = await User.find({
            internalID: req.body.internalID,
        }).lean();

        if (verifyUser.length > 0) {
            throw Error('Internal Id already exists.');
        }

        const newUser = await User.create({ ...req.body });

        const user = await User.findById(newUser._id);
        //login
        const consentJWT = await consentManagerLogin();

        const userIdentifier = await createConsentUserIdentifier(
            user,
            consentJWT
        );

        if (userIdentifier?._id) {
            user.userIdentifier = userIdentifier._id;
            user.save();
            return restfulResponse(res, 200, user);
        } else {
            await User.deleteOne({ _id: user._id });
            return restfulResponse(res, 500, {
                message: 'Error when creating the user',
            });
        }
    } catch (err) {
        next(err);
    }
};

/**
 * get all users
 * @param req
 * @param res
 * @param next
 */
export const getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const users = await User.aggregate(
            [
                {
                    $project: {
                        internalID: 1,
                        email: 1,
                        userIdentifier: 1,
                        userId: '$internalID'
                    }
                }
            ]
        );

        return restfulResponse(res, 200, users);
    } catch (err) {
        next(err);
    }
};

/**
 * get a user by id
 * @param req
 * @param res
 * @param next
 */
export const getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(req.params.id).lean();

        return restfulResponse(res, 200, {
            ...user,
            userId: user.internalID
        });
    } catch (err) {
        next(err);
    }
};

/**
 * update a user
 * @param req
 * @param res
 * @param next
 */
export const updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, {
            ...req.body,
        });

        //TODO
        //if update of email create new user
        // if update of id, update of userIdentifier

        return restfulResponse(res, 200, {
            ...user,
            userId: user.internalID
        });
    } catch (err) {
        next(err);
    }
};

/**
 * delete a user
 * @param req
 * @param res
 * @param next
 */
export const deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        //TODO delete the userIdentifier

        return restfulResponse(res, 200, {
            ...user,
            userId: user.internalID
        });
    } catch (err) {
        next(err);
    }
};

/**
 * export a csv template to use in the import route
 * @param req
 * @param res
 * @param next
 */
export const excelExport = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = [['userId', 'email', 'url']];

        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

        // Create a workbook with the worksheet
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        // Convert the workbook to a buffer
        const buffer = XLSX.write(wb, {
            bookType: 'xlsx',
            type: 'buffer',
        });

        // Create a Readable stream from the buffer
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        // Set response headers
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=example.xlsx'
        );
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        // Pipe the stream to the response
        stream.pipe(res);
    } catch (err) {
        next(err);
    }
};

/**
 * import a csv file and create users and user identifier in the consent manager
 * @param req
 * @param res
 * @param next
 */
export const excelImport = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!(await getConsentUri())) {
            return restfulResponse(res, 400, {
                error: 'Please add a consent URI on your config.json or with the configuration route.',
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileContent = fs.readFileSync(req.file.path);

        // Parse the Excel file
        const workbook: XLSX.WorkBook = XLSX.read(fileContent, {
            type: 'buffer',
        });

        // Assume the first sheet contains the data
        const sheetName = workbook.SheetNames[0];
        const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

        // Convert sheet to array of objects
        const data: any[] = XLSX.utils.sheet_to_json(sheet);

        const headerRow = data[0];

        if (!headerRow.email || !headerRow.userId) {
            throw Error('Column error in file.');
        }

        //login
        const consentJWT = await consentManagerLogin();

        const userIdentifiers = await createConsentUserIdentifiers(
            data,
            consentJWT
        );

        const users = [];
        // Process each row and create a user (you can replace this with your actual user creation logic)
        for (const row of data) {
            const verifyUser = await User.find({
                internalID: row.userId,
            }).lean();

            if (verifyUser.length === 0) {
                const user = await User.findOneAndUpdate(
                    {
                        internalID: row.userId,
                    },
                    {
                        ...row,
                    },
                    {
                        upsert: true,
                        new: true,
                    }
                );

                user.userIdentifier = userIdentifiers.find(
                    (element: any) => element.identifier === row.userId
                )._id;
                user.save();

                users.push(user);
            }
        }

        fs.unlinkSync(req.file.path);

        return restfulResponse(res, 200, users);
    } catch (error) {
        next(error);
    }
};

/**
 * create the user identifier in the consent manager
 * @param user
 * @param jwt
 */
const createConsentUserIdentifier = async (user: IUser, jwt: string) => {
    try {
        if (!(await getConsentUri())) {
            throw Error('Consent URI not setup.');
        }
        const res = await axios.post(
            urlChecker(await getConsentUri(), 'users/register'),
            {
                email: user.email,
                identifier: user.internalID,
                url: user.url,
            },
            {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            }
        );

        if (!res) {
            throw Error('User registration error.');
        }

        return res.data;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });
    }
};

/**
 * create user identifiers in the consent manager
 * @param data
 * @param jwt
 */
const createConsentUserIdentifiers = async (data: IUser[], jwt: string) => {
    try {
        data.map(user => {
                user.internalID = user.userId;
                return user;
            }
        )

        if (!(await getConsentUri())) {
            throw Error('Consent URI not setup.');
        }
        const res = await axios.post(
            urlChecker(await getConsentUri(), 'users/registers'),
            {
                users: data,
            },
            {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            }
        );

        if (!res) {
            throw Error('Users registration error.');
        }

        return res.data;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });
    }
};

/**
 * Login the participant into the consent Manager
 * @return string
 */
export const consentManagerLogin = async (): Promise<string> => {
    try {
        if (!(await getConsentUri())) {
            throw Error('Consent URI not setup.');
        }

        const res = await axios.post(
            urlChecker(await getConsentUri(), 'participants/login'),
            {
                clientID: await getServiceKey(),
                clientSecret: await getSecretKey(),
            }
        );
        if (!res) {
            throw Error('Consent login error.');
        }

        return res.data.jwt;
    } catch (e) {
        Logger.error(e);
    }
};

/**
 * Create a user from the consent manager
 * @param req
 * @param res
 * @param next
 */
export const createUserFromConsent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const newUser = await User.create({ ...req.body });

        return restfulResponse(res, 200, newUser);
    } catch (err) {
        next(err);
    }
};

/**
 * Create a user from the consent manager
 * @param req
 * @param res
 * @param next
 */
export const createUserToApp = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const registrationEndpoint = await getRegistrationUri();

        if(registrationEndpoint){
            const registrationResponse = await axios.post(registrationEndpoint, {...req.body});

            if(registrationResponse.status === 200 && registrationResponse.data){
                let user;
                const params = {
                    email: req.body.email,
                    internalID: registrationResponse.data?.id || registrationResponse.data?._id || registrationResponse.data?.userId || registrationResponse.data?.internalID
                }

                if(!params.internalID) return restfulResponse(res, 500, {message: 'Registration Error.'});

                const verifyUser = await User.findOne({
                    email: req.body.email,
                });

                if(!verifyUser){
                    user = new User(params);
                    await user.save();


                } else {
                    user= verifyUser;
                }

                await consentServiceResume(user.internalID, req.body.consentID);

                return restfulResponse(res, 200, user);
            } else {
                return restfulResponse(res, 500, {message: 'Registration Error.'});
            }
        } else {
            return restfulResponse(res, 404, {message: 'RegistrationUri not configured.'});
        }
    } catch (err) {
        next(err);
    }
};
