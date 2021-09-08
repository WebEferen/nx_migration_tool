import { Algorithm, sign, SignOptions } from 'jsonwebtoken';
import { JWE, JWK } from 'node-jose';
const privateKEY =
    '-----BEGIN PRIVATE KEY-----\nMIIEwAIBADANBgkqhkiG9w0BAQEFAASCBKowggSmAgEAAoIBAQDfI7BEpJZukwGG\nJUAff6ZpFts6QMKwVn4CXV1rQE3GwhSqPJsY9nMidduIop/bM6rKeiiuTudSZV9I\ntz8xPW5FkzSzfZgD9TSmjNccrfWiKSOb3lbtaQN9TBRJ1mGcZWuoEWr049Vu4+ve\nB1o3mna2RutFUYtVKYdJTJFOH/AWya1lsTF31mzXLv77kmjTRGN+jzmw81gR/XCC\nQqNvW9CPdtaYRzWqcnDQmCLNEpEkYP0eFgRoGm8uxTO05m22pyBD1skkE8OYyCva\nmtz4ra7ZI6wD+bWG4HxAjyTTcidCokA2henyL7AJP+W9DTFmOROsobyuQr/H+WHn\nH+vVa73xAgMBAAECggEBAI4h/Hhs4kmCqDjbZ3Ho7IYKAhCkCZ8rKM62y/eyGRie\nrW0Wd7C54vKzYegxtmN5ELQyhdEp/1zTp5L47m6d86yrrKkcOgVjXmssUSU6hbkK\nPV1ejb5h4tAf8thpjvmA/McseRWOPniJA8gEpOnAIRfQKrKX04mmjz8YX4IFA/hu\nw6CYc3yD29V3YgLfllzRr1XGagsrcI7JI3ogL+Oje9LFPkp/g4mMzWCrajxKJGua\n7qLVjP3hMfTvnYUgJexnyr1IyNLVv5PR1h9+JcGJ4sK/+OeRPyg2SfWKwMW3UbTx\n5DKoOlF/SSZxjjx9tN1JGz9QE54j3t/t+brv6fOoWDUCgYEA+P5C0VWp4plWK2Z4\nSZXP2UYYvUUHEwn5ET+k4+2V9lNoBTaCN/mg4XeimO+EG6L18K9XI2BbmZJDlYDH\nFZyaetQGQm60yPupV9rljJF8/s1vhBb8JVyo0bMcRVOz9L2NbNy1apEfIIS3qkFr\nf09UjhY/myAlDTJotrAqEoavXtsCgYEA5WsteAzi1OopdZzt9e3i2ZDW47tSvSDU\ntw6jskx0cn1ysOGji1T9J/gzyKCBYuhFEZXWx0C6Kyomj20KOT7zQcV5z/m2wbHe\nwzZXPY3Fkem5sIeD+4LREBOd3zuAERJdGh2+iSTMFNuQ5LO5xpP7pOQg+Vfb6hvd\n/TTUE/kxMiMCgYEAtNaF1N+wiQDw0oiTqG4EDTuZ0C0IHE3L9TkSGvB9T+/3xoF2\nRg0pSVfIYebjPec3VF0knm7nWDwglb532Txp/fdrrGgXKTmOHl6/BT7NV4oBCiBf\ndQs9GUBKshc+xeu9gWky4XkQ8F8zvZXR6x7EvIVwIMxR3KnV34lGpTnouK0CgYEA\nxr8V0eWf8IG3TwuXXrEqD/8ZGoqif/PcM4W8LG9the3FmRSwgLks4x5zhf/+dvfv\nNe/P9CfP4CsQ4rm83KD7TeRMxe53888qw4TlCQ8ztFd9pT+RCCdpA/tqjgRWyvNU\nspZIBTlaj0szd913OF/k5hE3u6rwehyQMJY+j9sWUm8CgYEAhkVCbAjJDmKY+2Vm\ng4bDsa2m4P35Dy3h8lXKDFTU60xLq/g3mULEzxZI6DvXyU7XagpMGXOQ8uQh5rdW\nPmJpMydMEmKd2rhPhXcmj1aO99wfAoL03tV0hYjhaKPO6J9AAYlUAECVdDUh4VSP\nAh92D9YwjjzVvfiWqWYHkPVLjc4=\n-----END PRIVATE KEY-----';

// Public key can be found in vcap services for xsuaa

const signOptions: SignOptions = {
    expiresIn: '24h',
    algorithm: 'RS256' as Algorithm,
    issuer: 'papm-spreadsheet-service',
};

export function generateTokenForXsuaa(payload: Record<string, unknown>) {
    return sign(payload, privateKEY, signOptions);
}

const ENCRYPTION_ALGORITHM = 'RSA-OAEP-256';
const ENCODING_ALGORITHM = 'A256GCM';

export const decryptPayload = async (privateKey: string, payload: string): Promise<string> => {
    const key = await JWK.asKey(`-----BEGIN PRIVATE KEY-----${privateKey}-----END PRIVATE KEY-----`, 'pem', {
        alg: ENCRYPTION_ALGORITHM,
        enc: ENCODING_ALGORITHM,
    });
    const decrypt = await JWE.createDecrypt(key).decrypt(payload);
    const result = decrypt.plaintext.toString();
    return result;
};

export const encryptPayload = async (publicKey: string, payload: string): Promise<string> => {
    const key = await JWK.asKey(`-----BEGIN PUBLIC KEY-----${publicKey}-----END PUBLIC KEY-----`, 'pem', {
        alg: ENCRYPTION_ALGORITHM,
    });
    const options = {
        contentAlg: ENCODING_ALGORITHM,
        compact: true,
        fields: { iat: Math.round(Date.now() / 1000) },
    };
    const result = await JWE.createEncrypt(options, key).update(Buffer.from(payload, 'utf8')).final();
    return result;
};
