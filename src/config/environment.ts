import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

export const config: {
    /**
     * Current environment mode
     */
    env: string;

    port: number;

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
     * Maximum number of logs to keep. If not set, no logs will be removed. This can be a number of files or number of days. If using days, add 'd' as the suffix. (default: null)
     */
    winstonLogsMaxFiles: string;

    /**
     * Maximum size of the file after which it will rotate. This can be a number of bytes, or units of kb, mb, and gb. If using the units, add 'k', 'm', or 'g' as the suffix. The units need to directly follow the number. (default: null)
     */
    winstonLogsMaxSize: string;

    /**
     * Secret key used for signing internal endpoint authorization tokens.
     */
    jwtInternalSecretKey: string;

    /**
     * config.json to use
     */
    configurationFile: string;

    /**
     * limit of express body size
     */
    limit: string;
} = {
    env: 'development',
    port: 3000,
    jwtSecretKey: 'your-secret-key',
    jwtBearerTokenExpiration: '3h',
    jwtRefreshTokenExpiration: '1d',
    winstonLogsMaxFiles: '14d',
    winstonLogsMaxSize: '20m',
    jwtInternalSecretKey: 'jwt-internal-secret-key',
    configurationFile: 'config.json',
    limit: '2mb',
};

export const setupEnvironment = (customEnv?: string) => {
    const isDist = __dirname.includes(`${path.sep}dist`);
    const baseDirEnv = isDist
        ? path.join(__dirname, '..', '..', '..')
        : path.join(__dirname, '..', '..');
    const baseDirConfig = isDist
        ? path.join(__dirname, '..', '..', 'src')
        : path.join(__dirname, '..');
    let envArg = process.argv.find((arg) => arg.startsWith('--'));
    let envFile = '.env';
    let configFile = 'config.json';

    let env;

    env = dotenv.config({
        path: path.join(baseDirEnv, envFile),
    });

    if (env.error && customEnv) {
        envFile = `.env.${customEnv}`;
        envArg = `--${customEnv}`;
        env = dotenv.config({
            path: path.join(baseDirEnv, envFile),
        });
    } else if (env.error && envArg) {
        const envType = envArg.substring(2);
        envFile = `.env.${envType}`;
        env = dotenv.config({
            path: path.join(baseDirEnv, envFile),
        });
    }

    if (env.error) {
        env = dotenv.config({
            path: path.join(baseDirEnv, '.env'),
        });

        if (env.error) {
            throw new Error(
                `Error initializing environment. Could not find .env file${
                    envArg ? ` or .env.${envArg.substring(2)} file` : ''
                }`
            );
        }
    }

    //Verify if configFile exist
    const customConfigFile = envArg
        ? `config.${envArg.substring(2)}.json`
        : 'config.json';
    const customConfigFilePath = path.join(baseDirConfig, customConfigFile);
    if (fs.existsSync(customConfigFilePath)) {
        configFile = customConfigFile;
    }

    config.env = process.env.NODE_ENV || config.env;
    config.port = parseInt(process.env.PORT) || config.port;
    config.jwtSecretKey = process.env.JWT_SECRET_KEY || config.jwtSecretKey;
    config.jwtInternalSecretKey =
        process.env.JWT_INTERNAL_SECRET_KEY || config.jwtInternalSecretKey;
    config.jwtBearerTokenExpiration =
        process.env.JWT_BEARER_TOKEN_EXPIRATION ||
        config.jwtBearerTokenExpiration;
    config.jwtRefreshTokenExpiration =
        process.env.JWT_REFRESH_TOKEN_EXPIRATION ||
        config.jwtRefreshTokenExpiration;

    config.winstonLogsMaxFiles =
        process.env.WINSTON_LOGS_MAX_FILES || config.winstonLogsMaxFiles;
    config.winstonLogsMaxSize =
        process.env.WINSTON_LOGS_MAX_SIZE || config.winstonLogsMaxSize;
    config.configurationFile = configFile;
};
