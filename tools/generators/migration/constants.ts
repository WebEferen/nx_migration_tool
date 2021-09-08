import { prompt } from 'enquirer';

export const SCRIPT_DIR = __dirname + '/scripts/';
export const GIT_MOVE_SCRIPT = SCRIPT_DIR + 'git-move.sh';
export const GIT_REMOTE_SCRIPT = SCRIPT_DIR + 'git-remote.sh';
export const GIT_ROLLBACK_SCRIPT = SCRIPT_DIR + 'git-rollback.sh';

export interface IPrompts {
    shouldGenerateApplication: boolean;
    tempDirectoryName: string;
    masterRepositoryBranch: string;
    masterRepositoryUrl: string;
    targetRepositoryBranch: string;
    targetRepositoryUrl: string;
    targetApplicationName: string;
    workingBranch: string;
}

export const getPrompts = (): Promise<IPrompts> =>
    prompt([
        {
            message: 'Generate NX application?',
            name: 'shouldGenerateApplication',
            type: 'confirm',
        },
        {
            message: 'Current branch name (working branch to fallback):',
            name: 'workingBranch',
            type: 'input',
            initial: 'master',
        },
        {
            message: 'Target application name:',
            name: 'targetApplicationName',
            type: 'input',
        },
        {
            message: 'Provide target repository (repository url):',
            name: 'targetRepositoryUrl',
            type: 'input',
        },
        {
            message: 'Provide target repository branch (branch name):',
            name: 'targetRepositoryBranch',
            type: 'input',
            initial: 'master',
        },
        {
            message: 'Provide master repository branch (branch name):',
            name: 'masterRepositoryBranch',
            type: 'input',
            initial: 'master',
        },
        {
            message: 'Temporary directory name (to move files to):',
            name: 'tempDirectoryName',
            type: 'input',
            initial: 'tmp',
        },
    ]);
