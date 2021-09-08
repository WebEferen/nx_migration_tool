export interface IGeneratorOptions {
    masterApplicationName: string;
    masterRepository: string;
    masterBranch?: string;

    targetApplicationName: string;
    targetRepository: string;
    targetBranch?: string;

    temporaryDirectory?: string;
}
