import type { Tree } from '@nrwl/devkit';
import { readProjectConfiguration, generateFiles } from '@nrwl/devkit';
import path from 'path';

type PathType = { name: string; path: string };

export interface IOptions {
    targetName: string;
    targetPaths: PathType[];
    testPaths: PathType[];
}

export function createFiles(tree: Tree, options: IOptions) {
    const projectConfiguration = readProjectConfiguration(tree, options.targetName);
    const targetPaths = options.targetPaths || [];
    const testPaths = options.testPaths || [];

    generateFiles(tree, path.join(__dirname, 'templates'), projectConfiguration.root, {
        js: 'js',
        json: 'json',
        eslintrc: '.eslintrc',
        applicationName: options.targetName,
        // applicationPaths: [{ name: '@common', path: 'src/app/common' }],
        // testPaths: [{ name: '^@common$', path: './src/app/common' }],
        applicationPaths: targetPaths,
        testPaths: testPaths,
    });
}
