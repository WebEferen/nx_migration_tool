import { prompt } from 'enquirer';

export interface IPrompts {
  generateApplication: boolean;
  tempDirectoryName: string;
  masterApplicationName: string;
  masterRepositoryBranch: string;
  masterRepositoryUrl: string;
  targetRepositoryBranch: string;
  targetRepositoryUrl: string;
  targetApplicationName: string;
  workingBranch: string;
}

export const getPrompts = (): Promise<IPrompts> => prompt([
  {
    message: 'Generate NX application?',
    name: 'generateApplication',
    type: 'confirm'
  },
  {
    message: 'Current branch name (working branch to fallback):',
    name: 'workingBranch',
    type: 'input',
    initial: 'master'
  },
  {
    message: 'Master application name:',
    name: 'masterApplicationName',
    type: 'input'
  },
  {
    message: 'Target application name:',
    name: 'targetApplicationName',
    type: 'input'
  },
  {
    message: 'Provide target repository (repository url):',
    name: 'targetRepositoryUrl',
    type: 'input'
  },
  {
    message: 'Provide target repository branch (branch name):',
    name: 'targetRepositoryBranch',
    type: 'input',
    initial: 'master'
  },
  {
    message: 'Provide master repository branch (branch name):',
    name: 'masterRepositoryBranch',
    type: 'input',
    initial: 'master'
  },
  {
    message: 'Temporary directory name (to move files to):',
    name: 'tempDirectoryName',
    type: 'input'
  },
]);
