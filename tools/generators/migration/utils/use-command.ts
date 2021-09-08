import * as spawn from 'cross-spawn';

export async function useCommand(commandName: string, commandArgs: string[] = []) {
    const child = spawn(commandName, commandArgs);
    return new Promise<{ success: boolean }>((resolve) => {
        // child.stdout.on('data', (data) => process.stdout.write(data));
        child.stderr.on('data', (data) => process.stderr.write(data));

        child.on('close', (code) => resolve({ success: code === 0 }));
        child.on('error', () => resolve({ success: false }));
    });
}
