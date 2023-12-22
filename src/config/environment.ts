import dotenv from "dotenv";
import path from "path";

export const config: {
    /**
     * Current environment mode
     */
    env: string;

    port: number;

    /**
     * URL the frontend is running on if different
     * Most useful for when in development
     */
    clientAppURL: string;

    /**
     * Secret key for signing the authorization token generation
     */
    jwtSecretKey: string;

    /**
     * Validity time before expiration of the bearer token
     */
    jwtBearerTokenExpiration: string;

    /**
     * Validity time before expiration of the refresh token
     */
    jwtRefreshTokenExpiration: string;

    /**
     * Current mongo database URI
     */
    mongoURI: string;

    /**
     * The express-session Secret
     */
    sessionSecret: string;

    /**
     * Duration of the express-session cookie when set to true
     */
    sessionCookieDuration: number;

    /**
     * Name of the express-session cookie
     */
    sessionCookieName: string;

    /**
     * Maximum number of logs to keep. If not set, no logs will be removed. This can be a number of files or number of days. If using days, add 'd' as the suffix. (default: null)
     */
    winstonLogsMaxFiles: string;

    /**
     * Maximum size of the file after which it will rotate. This can be a number of bytes, or units of kb, mb, and gb. If using the units, add 'k', 'm', or 'g' as the suffix. The units need to directly follow the number. (default: null)
     */
    winstonLogsMaxSize: string;

    /**
     * Path for multer to store uploads
     */
    uploadsPath: string;

    /**
     * Rate limit minutes window for public resources on which
     * the limiter is applied
     */
    rateLimitPublicWindowMinutes: number;

    /**
     * Amount of requests authorized for public
     * resource access on which the limiter is applied
     */
    rateLimitPublicLimitPerWindow: number;

    /**
     * Rate limit minutes window for private resources on which
     * the limiter is applied
     */
    rateLimitPrivateWindowMinutes: number;

    /**
     * Default amount of requests authorized for private
     * resource access on which the limiter is applied
     */
    rateLimitPrivateLimitPerWindowDefault: number;

    /**
     * Default Time to live value for caching in seconds
     */
    cacheBaseTtl: number;

    emails: {
        mailchimp: {
            /**
             * Mailchimp API Key
             */
            mailchimpAPIKey: string;

            /**
             * Mailchimp transactional API Key
             */
            mandrillAPIKey: string;

            /**
             * Mailchimp transactional From Email
             */
            mandrillFromMail: string;

            /**
             * Mailchimp transactional From Name
             */
            mandrillFromName: string;
        };
        nodemailer: {
            service: string;
            user: string;
            pass: string;
        };
    };
    oauth: {
        google: {
            clientID: string;
            clientSecret: string;
            redirectURI: string;
        };
    };
} = {
    env: "development",
    port: 3000,
    clientAppURL: "http://localhost:5173",
    jwtSecretKey: "your-secret-key",
    jwtBearerTokenExpiration: "1h",
    jwtRefreshTokenExpiration: "7d",
    mongoURI: "mongodb://0.0.0.0:27017/base-setup-db",
    sessionSecret: "secret123",
    sessionCookieDuration: 1000 * 60 * 60 * 24 * 30,
    sessionCookieName: "mySessionCookie",
    winstonLogsMaxFiles: "14d",
    winstonLogsMaxSize: "20m",
    uploadsPath: "/public/uploads",
    rateLimitPrivateLimitPerWindowDefault: 100,
    rateLimitPrivateWindowMinutes: 15,
    rateLimitPublicLimitPerWindow: 100,
    rateLimitPublicWindowMinutes: 15,
    cacheBaseTtl: 600,
    emails: {
        mailchimp: {
            mailchimpAPIKey: "",
            mandrillAPIKey: "",
            mandrillFromMail: "",
            mandrillFromName: "",
        },
        nodemailer: {
            service: "gmail",
            user: "",
            pass: "",
        },
    },
    oauth: {
        google: {
            clientID: "",
            clientSecret: "",
            redirectURI: "http://localhost:3000/v1/auth/oauth/google/callback",
        },
    },
};

export const setupEnvironment = (customEnv?: string) => {
    const envArg = process.argv.find((arg) => arg.startsWith("--"));
    let envFile = ".env";
    if (customEnv) {
        envFile = `.env.${customEnv}`;
    } else {
        if (envArg) {
            const envType = envArg.substring(2);
            envFile = `.env.${envType}`;
        }
    }

    const env = dotenv.config({
        path: path.join(__dirname, "..", "..", envFile),
    });

    if (env.error) {
        throw new Error(
            "Error initializing environment. Could not find .env file"
        );
    }

    config.env = process.env.NODE_ENV || config.env;
    config.port = parseInt(process.env.PORT) || config.port;
    config.clientAppURL = process.env.CLIENT_APP_URL || config.clientAppURL;
    config.jwtSecretKey = process.env.JWT_SECRET_KEY || config.jwtSecretKey;
    config.jwtBearerTokenExpiration =
        process.env.JWT_BEARER_TOKEN_EXPIRATION ||
        config.jwtBearerTokenExpiration;
    config.jwtRefreshTokenExpiration =
        process.env.JWT_REFRESH_TOKEN_EXPIRATION ||
        config.jwtRefreshTokenExpiration;
    config.mongoURI = process.env.MONGO_URI || config.mongoURI;

    config.sessionSecret = process.env.SESSION_SECRET || config.sessionSecret;
    config.sessionCookieName =
        process.env.SESSION_COOKIE_NAME || config.sessionCookieName;
    config.sessionCookieDuration =
        parseInt(process.env.SESSION_COOKIE_DURATION) ||
        config.sessionCookieDuration;

    config.winstonLogsMaxFiles =
        process.env.WINSTON_LOGS_MAX_FILES || config.winstonLogsMaxFiles;
    config.winstonLogsMaxSize =
        process.env.WINSTON_LOGS_MAX_SIZE || config.winstonLogsMaxSize;

    config.uploadsPath = process.env.MULTER_UPLOADS_PATH || config.uploadsPath;

    config.rateLimitPublicWindowMinutes =
        parseInt(process.env.RATE_LIMIT_PUBLIC_WINDOW_MINUTES) ||
        config.rateLimitPublicWindowMinutes;
    config.rateLimitPublicLimitPerWindow =
        parseInt(process.env.RATE_LIMIT_PUBLIC_LIMIT_PER_WINDOW) ||
        config.rateLimitPublicLimitPerWindow;
    config.rateLimitPrivateWindowMinutes =
        parseInt(process.env.RATE_LIMIT_PRIVATE_WINDOW_MINUTES) ||
        config.rateLimitPrivateWindowMinutes;
    config.rateLimitPrivateLimitPerWindowDefault =
        parseInt(process.env.RATE_LIMIT_PRIVATE_LIMIT_PER_WINDOW_DEFAULT) ||
        config.rateLimitPrivateLimitPerWindowDefault;

    config.cacheBaseTtl =
        parseInt(process.env.CACHE_BASE_TTL) || config.cacheBaseTtl;

    // ---------------------
    // ------ EMAILS -------
    // ---------------------
    config.emails.mailchimp = {
        mailchimpAPIKey:
            process.env.MAILCHIMP_API_KEY ||
            config.emails.mailchimp.mailchimpAPIKey,
        mandrillAPIKey:
            process.env.MANDRILL_API_KEY ||
            config.emails.mailchimp.mandrillAPIKey,
        mandrillFromMail:
            process.env.MANDRILL_FROM_MAIL ||
            config.emails.mailchimp.mandrillFromMail,
        mandrillFromName:
            process.env.MANDRILL_FROM_NAME ||
            config.emails.mailchimp.mandrillFromName,
    };

    config.emails.nodemailer = {
        service:
            process.env.NODEMAILER_SERVICE || config.emails.nodemailer.service,
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    };

    // ---------------------
    // ------ OAUTH -------
    // ---------------------
    config.oauth.google = {
        clientID:
            process.env.GOOGLE_OAUTH_CLIENT_ID || config.oauth.google.clientID,
        clientSecret:
            process.env.GOOGLE_OAUTH_CLIENT_SECRET ||
            config.oauth.google.clientSecret,
        redirectURI:
            process.env.GOOGLE_OAUTH_REDIRECT_URI ||
            config.oauth.google.redirectURI,
    };
};
