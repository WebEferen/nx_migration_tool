import type { Tree } from '@nrwl/devkit';

import { getPrompts, GIT_MOVE_SCRIPT, GIT_ROLLBACK_SCRIPT, GIT_REMOTE_SCRIPT, GIT_OTHERS_SCRIPT } from './constants';
import type { IPrompts } from './constants';
import type { IGeneratorOptions } from './schema';
import { manageDirectories, rollbackTransaction, useCommand, useTransaction } from './utils';
import { createFiles } from './utils/create-files';

function getTargetOptions(options: IPrompts) {
    const targetNameOption = ['-n', options.targetApplicationName];
    const targetRepositoryOption = ['-m', options.targetRepositoryUrl];
    const targetBranchOption = ['-b', options.targetRepositoryBranch];

    return [...targetNameOption, ...targetBranchOption, ...targetRepositoryOption];
}

export default async function (tree: Tree, _: IGeneratorOptions) {
    const prompts = await getPrompts();
    const { shouldGenerateApplication, workingBranch, targetApplicationName, tempDirectoryName } = prompts;

    await useTransaction(workingBranch, async (branchName) => {
        const directoryOption = ['-d', tempDirectoryName];

        // Create NX application using useCommand wrapper
        if (shouldGenerateApplication) {
            const appCreationStatus = await useCommand('yarn', ['nx', 'generate', '@nrwl/nest:app', targetApplicationName]);
            if (!appCreationStatus.success) throw new Error('Error during application creation!');
        }

        // Make sure that there is no temporary directory & no content inside generated application
        await manageDirectories(tempDirectoryName, targetApplicationName);

        // Move master repository (main) into temporary directory
        await useCommand('bash', [GIT_MOVE_SCRIPT, ...directoryOption]);

        // Move / commit and rollback changes
        const targetStatus = await useCommand('bash', [GIT_REMOTE_SCRIPT, ...getTargetOptions(prompts)]);
        if (!targetStatus.success) await rollbackTransaction(branchName, workingBranch, tempDirectoryName);

        // Fetch / merge and move target repository into monorepo
        const moveStatus = await useCommand('bash', [GIT_MOVE_SCRIPT, ...directoryOption, '-p', `/apps/${targetApplicationName}`]);
        if (!moveStatus.success) await rollbackTransaction(branchName, workingBranch, tempDirectoryName);

        // Fetch / merge and move target repository into monorepo
        const moveOthersStatus = await useCommand('bash', [GIT_OTHERS_SCRIPT, '-d', `apps/${targetApplicationName}`]);
        if (!moveOthersStatus.success) await rollbackTransaction(branchName, workingBranch, tempDirectoryName);

        // Move back master repository (from temporary directory)
        const rollbackStatus = await useCommand('bash', [GIT_ROLLBACK_SCRIPT, ...directoryOption, '-p', '.']);
        if (!rollbackStatus.success) await rollbackTransaction(branchName, workingBranch, tempDirectoryName);

        // Remove old container folder
        await useCommand('rm', ['-rf', tempDirectoryName]);

        // Replacing steps (targets) in workspace.json file to match our standards (master repo clone)
        createFiles(tree, {
            targetName: prompts.targetApplicationName,
            targetPaths: [],
            testPaths: [],
        });
    });
}
