import { Tree } from '@nrwl/devkit';
import * as spawn from 'cross-spawn';
import { getPrompts } from './constants';
import { IGeneratorOptions } from './schema';

async function useCommand(commandName: string, commandArgs: string[] = []) {
  const child = spawn(commandName, commandArgs);
  return new Promise<{ success: boolean }>((resolve) => {
    child.stdout.on('data', (data) => process.stdout.write(data));
    child.stderr.on('data', (data) => process.stderr.write(data));

    child.on('close', (code) => resolve({ success: code === 0 }));
    child.on('error', () => resolve({ success: false }));
  });
}

async function rollbackTransaction(branchName: string, fallbackBranchName: string) {
  await useCommand('git', ['reset', '--hard']);
  await useCommand('git', ['checkout', fallbackBranchName]);
  await useCommand('git', ['branch', '-D', branchName]);
  await useCommand('rm', ['-rf', branchName]);

  throw new Error('Error during transaction... Aborting and rolling back (git-reset)');
}

export default async function (tree: Tree, options: IGeneratorOptions) {
  const prompts = await getPrompts();
  const scriptsDir = `${__dirname}/scripts`;

  await useCommand('git', ['checkout', '-b', prompts.tempDirectoryName]);

  // Create NX application using useCommand wrapper
  if (prompts.generateApplication) {
    const appCreationStatus = await useCommand('yarn', ['nx', 'generate', '@nrwl/nest:app', prompts.targetApplicationName]);
    if (!appCreationStatus.success) throw new Error('Error during application creation!');
  }

  // Make sure that there is no temporary directory & no content inside generated application
  await useCommand('rm', ['-rf', prompts.tempDirectoryName]);
  await useCommand('rm', ['-rf', `apps/${prompts.targetApplicationName}`]);
  await useCommand('mkdir', [`apps/${prompts.targetApplicationName}`]);
  await useCommand('mkdir', [prompts.tempDirectoryName]);

  // The core part is done there using our scripts
  const directoryOption = ['-d', prompts.tempDirectoryName];
  const targetNameOption = ['-n', prompts.targetApplicationName];
  const targetRepositoryOption = ['-m', prompts.targetRepositoryUrl];
  const targetBranchOption = ['-b', prompts.targetRepositoryBranch];

  // // Move master repository (main) into temporary directory
  await useCommand('bash', [`${scriptsDir}/git-move.sh`, ...directoryOption]);

  // // Move / commit and rollback changes
  const targetOptions = [`${scriptsDir}/git-remote.sh`, ...targetNameOption, ...targetBranchOption, ...targetRepositoryOption];
  const targetStatus = await useCommand('bash', targetOptions);
  if (!targetStatus.success) await rollbackTransaction(prompts.tempDirectoryName, prompts.workingBranch);

  const moveOptions = [`${scriptsDir}/git-move.sh`, ...directoryOption, '-p'];
  const moveStatus = await useCommand('bash', [...moveOptions, `/apps/${prompts.targetApplicationName}`]);
  if (!moveStatus.success) await rollbackTransaction(prompts.tempDirectoryName, prompts.workingBranch);

  await useCommand('bash', [`${scriptsDir}/git-rollback.sh`, ...directoryOption, '-p', '.']);

  // // Remove old container folder
  await useCommand('rm', ['-rf', prompts.tempDirectoryName]);

  // Replacing steps (targets) in workspace.json file to match our standards (master repo clone)
  // TODO: get application bare options and write them based on master app
  // const masterApplication = readProjectConfiguration(tree, prompts.masterApplicationName);
  // const targetApplication = readProjectConfiguration(tree, prompts.targetApplicationName);
}
