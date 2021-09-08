import * as uuid from 'uuid';

import { useCommand } from './use-command';

export async function rollbackTransaction(branchName: string, fallbackBranchName: string, directory: string) {
    await useCommand('git', ['reset', '--hard']);
    await useCommand('git', ['checkout', fallbackBranchName]);
    await useCommand('git', ['branch', '-D', branchName]);
    await useCommand('rm', ['-rf', directory]);

    throw new Error('Error during transaction... Aborting and rolling back (git-reset)');
}

export async function useTransaction(fallbackBranchName: string, callback: (branchName: string) => Promise<void>) {
    const branchName: string = uuid.v4().replace(/-/g, '').slice(0, 16);

    const branchChanged = await useCommand('git', ['checkout', '-b', branchName]);
    if (branchChanged.success) await callback(branchName).catch((_) => process.stdout.write('Error during transaction!'));
    if (branchChanged.success) await useCommand('git', ['checkout', fallbackBranchName]);
    if (branchChanged.success) await useCommand('git', ['branch', '-D', branchName]);
}
