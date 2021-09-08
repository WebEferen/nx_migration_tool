declare module '@dynatrace/oneagent' {
    type OneAgentOptions = {
        environmentid: string;
        apitoken: string;
        endpoint: string;
    };
    function OneAgentLoader(options?: OneAgentOptions): void;
    export = OneAgentLoader;
}
