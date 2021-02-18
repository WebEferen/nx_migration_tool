import { IXsuaaService } from '@sap/xssec';
import { Dictionary } from 'lodash';

export interface IServiceTypeXsuaa {
    xsuaa: IXsuaaService;
}

export interface ITokenPayload {
    zdn: string; //subdomain / org
    sub: string;
    jti: string;
    scope: string[];
    given_name: string;
    family_name: string;
    ext_attr: Dictionary<unknown>;
    'xs.system.attributes': Dictionary<unknown>;
    'xs.user.attributes': Dictionary<unknown>;
    client_id: string;
    cid: string;
    azp: string;
    grant_type: string;
    user_id: string;
    origin: string;
    user_name: string;
    email: string;
    auth_time: number;
    rev_sig: string;
    iat: number;
    exp: number;
    iss: string;
    zid: string;
    aud: string[];
}

export interface IGetUserAuthInfoRequest extends Request {
    tokenInfo?: {
        getPayload: () => ITokenPayload;
    };
    authInfo?: {
        getEmail: () => string;
        getUserName: () => string;
        checkLocalScope: (scope: string) => boolean;
    };
}

export enum AuthMethod {
    JWT = 'jwt',
    BASIC = 'basic',
    NONE = 'none',
}
