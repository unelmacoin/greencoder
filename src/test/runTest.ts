import * as path from 'path';
import { glob } from 'glob';

const testsRoot = path.resolve(__dirname, '..');

// Add files to the test suite
glob('**/*.test.ts', { cwd: testsRoot }, (err: Error | null, files: string[]) => {
    if (err) {
        throw err;
    }

    // Run mocha directly
    process.argv.push('--ui', 'tdd');
    process.argv.push('--colors');
    process.argv.push('--require', 'ts-node/register');
    process.argv.push('--recursive');
    process.argv.push('--');
    process.argv.push(...files.map(f => path.resolve(testsRoot, f)));

    require('mocha/bin/mocha');
});
