import { useCommand } from './use-command';

export async function manageDirectories(tempDir: string, targetDir: string) {
    await useCommand('rm', ['-rf', tempDir]);
    await useCommand('mkdir', [tempDir]);

    await useCommand('rm', ['-rf', `apps/${targetDir}`]);

    await useCommand('mkdir', [`apps/${targetDir}`]);
    await useCommand('mkdir', [`apps/${targetDir}/_to_manual_check_`]);
}
