import { Tree } from '@nrwl/devkit';

import { getPrompts, GIT_MOVE_SCRIPT, GIT_ROLLBACK_SCRIPT, GIT_REMOTE_SCRIPT, IPrompts } from './constants';
import { IGeneratorOptions } from './schema';
import { manageDirectories, rollbackTransaction, useCommand, useTransaction } from './utils';

function getTargetOptions(options: IPrompts) {
  const targetNameOption = ['-n', options.targetApplicationName];
  const targetRepositoryOption = ['-m', options.targetRepositoryUrl];
  const targetBranchOption = ['-b', options.targetRepositoryBranch];

  return [...targetNameOption, ...targetBranchOption, ...targetRepositoryOption];
}

export default async function (tree: Tree, options: IGeneratorOptions) {
  const prompts = await getPrompts();
  const scriptsDir = `${__dirname}/scripts`;

  await useTransaction(async (branchName) => {
    const { generateApplication, workingBranch, targetApplicationName, tempDirectoryName } = prompts;
    const directoryOption = ['-d', tempDirectoryName];

    // Create NX application using useCommand wrapper
    if (generateApplication) {
      const appCreationStatus = await useCommand('yarn', ['nx', 'generate', '@nrwl/nest:app', targetApplicationName]);
      if (!appCreationStatus.success) throw new Error('Error during application creation!');
    }

    // Make sure that there is no temporary directory & no content inside generated application
    await manageDirectories(tempDirectoryName, targetApplicationName);

    // Move master repository (main) into temporary directory
    await useCommand('bash', [GIT_MOVE_SCRIPT, ...directoryOption]);

    // Move / commit and rollback changes
    const targetStatus = await useCommand('bash', [GIT_REMOTE_SCRIPT, ...getTargetOptions(prompts)]);
    if (!targetStatus.success) await rollbackTransaction(branchName, workingBranch);

    // Fetch / merge and move target repository into monorepo
    const moveStatus = await useCommand('bash', [GIT_MOVE_SCRIPT, ...directoryOption, '-p', `/apps/${targetApplicationName}`]);
    if (!moveStatus.success) await rollbackTransaction(branchName, workingBranch);

    // Move back master repository (from temporary directory)
    const rollbackStatus = await useCommand('bash', [GIT_ROLLBACK_SCRIPT, ...directoryOption, '-p', '.']);
    if (!rollbackStatus.success) await rollbackTransaction(branchName, workingBranch);

    // Remove old container folder
    await useCommand('rm', ['-rf', tempDirectoryName]);

    // Replacing steps (targets) in workspace.json file to match our standards (master repo clone)
    // TODO: get application bare options and write them based on master app
    // const masterApplication = readProjectConfiguration(tree, prompts.masterApplicationName);
    // const targetApplication = readProjectConfiguration(tree, prompts.targetApplicationName);
  });
}
