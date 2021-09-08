/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@sap/xssec' {
    type ErrorCallback = (error: any) => void;

    interface IXsuaaService {
        tenantmode: string;
        sburl: string;
        subaccountid: string;
        clientid: string;
        xsappname: string;
        clientsecret: string;
        url: string;
        uaadomain: string;
        trustedclientidsuffix: string;
        verificationkey: string;
        apiurl: string;
        identityzone: string;
        identityzoneid: string;
        tenantid: string;
        zoneid: string;
    }

    function createSecurityContext(token: string, service: IXsuaaService, error: ErrorCallback): void;

    class JWTStrategy {
        constructor(service: IXsuaaService);
    }
}
