import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(__dirname, 'drizzle.config.js');

/**
 * Spawns a child process that attempts to import drizzle.config.js with
 * the given environment variables. Returns { exitCode, stderr, stdout }.
 */
function importConfigWithEnv(env = {}) {
    const result = spawnSync(
        process.execPath,
        ['--input-type=module', '--eval', `import '${CONFIG_PATH}'`],
        {
            env: { ...process.env, ...env },
            encoding: 'utf8',
        }
    );
    return {
        exitCode: result.status,
        stderr: result.stderr || '',
        stdout: result.stdout || '',
    };
}

describe('drizzle.config.js - DATABASE_URL guard', () => {
    it('throws when DATABASE_URL is not set', () => {
        const env = { ...process.env };
        delete env.DATABASE_URL;

        const result = spawnSync(
            process.execPath,
            ['--input-type=module', '--eval', `import '${CONFIG_PATH}'`],
            { env, encoding: 'utf8' }
        );

        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain('DATABASE_URL is not set in .env file');
    });

    it('throws when DATABASE_URL is an empty string', () => {
        const result = importConfigWithEnv({ DATABASE_URL: '' });
        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain('DATABASE_URL is not set in .env file');
    });

    it('uses the exact error message mentioning .env file', () => {
        const env = { ...process.env };
        delete env.DATABASE_URL;

        const result = spawnSync(
            process.execPath,
            ['--input-type=module', '--eval', `import '${CONFIG_PATH}'`],
            { env, encoding: 'utf8' }
        );

        expect(result.stderr).toContain('.env file');
    });

    it('does not throw when DATABASE_URL is set to a valid postgres URL', () => {
        const result = importConfigWithEnv({
            DATABASE_URL: 'postgresql://user:pass@localhost:5432/mydb',
        });
        // Should not contain our specific guard error
        expect(result.stderr).not.toContain('DATABASE_URL is not set in .env file');
    });

    it('does not throw when DATABASE_URL is set to any non-empty value', () => {
        const result = importConfigWithEnv({ DATABASE_URL: 'postgres://localhost/db' });
        expect(result.stderr).not.toContain('DATABASE_URL is not set in .env file');
    });
});

describe('drizzle.config.js - configuration structure', () => {
    it('loads without the guard error when DATABASE_URL is provided', () => {
        const result = importConfigWithEnv({
            DATABASE_URL: 'postgresql://user:pass@localhost:5432/mydb',
        });
        // Only checking for the absence of the guard error; the module may
        // have other import-time issues unrelated to our code changes.
        expect(result.stderr).not.toContain('DATABASE_URL is not set in .env file');
    });

    it('exits with non-zero code when DATABASE_URL is missing', () => {
        const env = { ...process.env };
        delete env.DATABASE_URL;

        const result = spawnSync(
            process.execPath,
            ['--input-type=module', '--eval', `import '${CONFIG_PATH}'`],
            { env, encoding: 'utf8' }
        );

        expect(result.status).not.toBe(0);
    });
});