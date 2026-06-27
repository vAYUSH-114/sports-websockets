import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_MODULE_PATH = resolve(__dirname, 'db.js');

/**
 * Spawns a child process that attempts to import db.js with the given
 * DATABASE_URL environment variable. Returns { exitCode, stderr, stdout }.
 */
function importDbWithEnv(env = {}) {
    const result = spawnSync(
        process.execPath,
        ['--input-type=module', '--eval', `import '${DB_MODULE_PATH}'`],
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

describe('db.js - DATABASE_URL validation', () => {
    it('throws when DATABASE_URL is not set', () => {
        const env = { ...process.env };
        delete env.DATABASE_URL;

        const result = spawnSync(
            process.execPath,
            ['--input-type=module', '--eval', `import '${DB_MODULE_PATH}'`],
            { env, encoding: 'utf8' }
        );

        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain('DATABASE_URL is not defined');
    });

    it('throws with message "DATABASE_URL is not defined" when env var is missing', () => {
        const env = { ...process.env };
        delete env.DATABASE_URL;

        const result = spawnSync(
            process.execPath,
            ['--input-type=module', '--eval', `import '${DB_MODULE_PATH}'`],
            { env, encoding: 'utf8' }
        );

        expect(result.stderr).toContain('DATABASE_URL is not defined');
    });

    it('throws when DATABASE_URL is an empty string', () => {
        const result = importDbWithEnv({ DATABASE_URL: '' });
        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain('DATABASE_URL is not defined');
    });

    it('throws when DATABASE_URL does not start with postgres:// or postgresql://', () => {
        const result = importDbWithEnv({ DATABASE_URL: 'mysql://user:pass@localhost/db' });
        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain(
            'DATABASE_URL must be a postgres connection string'
        );
    });

    it('throws with the correct error message for invalid URL prefix', () => {
        const result = importDbWithEnv({ DATABASE_URL: 'mysql://user:pass@localhost/db' });
        expect(result.stderr).toContain('postgresql://');
    });

    it('throws when DATABASE_URL uses http:// scheme', () => {
        const result = importDbWithEnv({ DATABASE_URL: 'http://localhost:5432/db' });
        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain('DATABASE_URL must be a postgres connection string');
    });

    it('throws when DATABASE_URL uses an sqlite:// scheme', () => {
        const result = importDbWithEnv({ DATABASE_URL: 'sqlite:///path/to/db' });
        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain('DATABASE_URL must be a postgres connection string');
    });

    it('throws when DATABASE_URL is a plain string without a scheme', () => {
        const result = importDbWithEnv({ DATABASE_URL: 'localhost:5432/db' });
        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain('DATABASE_URL must be a postgres connection string');
    });

    it('does not throw a "not defined" error when DATABASE_URL starts with postgres://', () => {
        // The process may still fail (no real DB), but the error won't be our validation error
        const result = importDbWithEnv({ DATABASE_URL: 'postgres://user:pass@localhost/db' });
        expect(result.stderr).not.toContain('DATABASE_URL is not defined');
        expect(result.stderr).not.toContain('DATABASE_URL must be a postgres connection string');
    });

    it('does not throw a validation error when DATABASE_URL starts with postgresql://', () => {
        const result = importDbWithEnv({ DATABASE_URL: 'postgresql://user:pass@localhost/db' });
        expect(result.stderr).not.toContain('DATABASE_URL is not defined');
        expect(result.stderr).not.toContain('DATABASE_URL must be a postgres connection string');
    });

    it('accepts postgres:// prefix as valid (no prefix validation error)', () => {
        const result = importDbWithEnv({ DATABASE_URL: 'postgres://host/db' });
        expect(result.stderr).not.toContain('DATABASE_URL must be a postgres connection string');
    });

    it('accepts postgresql:// prefix as valid (no prefix validation error)', () => {
        const result = importDbWithEnv({ DATABASE_URL: 'postgresql://host/db' });
        expect(result.stderr).not.toContain('DATABASE_URL must be a postgres connection string');
    });

    it('rejects a URL that starts with POSTGRES:// (case sensitive check)', () => {
        // The validation is case-sensitive - uppercase POSTGRES should fail
        const result = importDbWithEnv({ DATABASE_URL: 'POSTGRES://user:pass@localhost/db' });
        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain('DATABASE_URL must be a postgres connection string');
    });
});