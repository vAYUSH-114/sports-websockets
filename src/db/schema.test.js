import { describe, it, expect } from 'vitest';
import { getTableName, getTableColumns } from 'drizzle-orm';
import { matchStatusEnum, matches, commentary } from './schema.js';

describe('matchStatusEnum', () => {
    it('has the correct enum name', () => {
        expect(matchStatusEnum.enumName).toBe('match_status');
    });

    it('contains exactly the three expected status values', () => {
        expect(matchStatusEnum.enumValues).toEqual(['scheduled', 'live', 'finished']);
    });

    it('includes "scheduled" as a valid status', () => {
        expect(matchStatusEnum.enumValues).toContain('scheduled');
    });

    it('includes "live" as a valid status', () => {
        expect(matchStatusEnum.enumValues).toContain('live');
    });

    it('includes "finished" as a valid status', () => {
        expect(matchStatusEnum.enumValues).toContain('finished');
    });

    it('does not include any unexpected values', () => {
        expect(matchStatusEnum.enumValues).toHaveLength(3);
    });
});

describe('matches table', () => {
    it('has the correct table name', () => {
        expect(getTableName(matches)).toBe('matches');
    });

    describe('id column', () => {
        it('is a serial column', () => {
            const cols = getTableColumns(matches);
            expect(cols.id.columnType).toBe('PgSerial');
        });

        it('is the primary key', () => {
            const cols = getTableColumns(matches);
            expect(cols.id.primary).toBe(true);
        });

        it('is not null', () => {
            const cols = getTableColumns(matches);
            expect(cols.id.notNull).toBe(true);
        });

        it('has DB column name "id"', () => {
            const cols = getTableColumns(matches);
            expect(cols.id.name).toBe('id');
        });
    });

    describe('sport column', () => {
        it('is a text column', () => {
            const cols = getTableColumns(matches);
            expect(cols.sport.columnType).toBe('PgText');
        });

        it('is not null', () => {
            const cols = getTableColumns(matches);
            expect(cols.sport.notNull).toBe(true);
        });

        it('has DB column name "sport"', () => {
            const cols = getTableColumns(matches);
            expect(cols.sport.name).toBe('sport');
        });
    });

    describe('homeTeam column', () => {
        it('is a text column', () => {
            const cols = getTableColumns(matches);
            expect(cols.homeTeam.columnType).toBe('PgText');
        });

        it('is not null', () => {
            const cols = getTableColumns(matches);
            expect(cols.homeTeam.notNull).toBe(true);
        });

        it('has DB column name "home_team"', () => {
            const cols = getTableColumns(matches);
            expect(cols.homeTeam.name).toBe('home_team');
        });
    });

    describe('awayTeam column', () => {
        it('is a text column', () => {
            const cols = getTableColumns(matches);
            expect(cols.awayTeam.columnType).toBe('PgText');
        });

        it('is not null', () => {
            const cols = getTableColumns(matches);
            expect(cols.awayTeam.notNull).toBe(true);
        });

        it('has DB column name "away_team"', () => {
            const cols = getTableColumns(matches);
            expect(cols.awayTeam.name).toBe('away_team');
        });
    });

    describe('status column', () => {
        it('is not null', () => {
            const cols = getTableColumns(matches);
            expect(cols.status.notNull).toBe(true);
        });

        it('has DB column name "status"', () => {
            const cols = getTableColumns(matches);
            expect(cols.status.name).toBe('status');
        });

        it('uses the match_status enum type', () => {
            const cols = getTableColumns(matches);
            expect(cols.status.enumValues).toEqual(['scheduled', 'live', 'finished']);
        });
    });

    describe('startTime column', () => {
        it('is a timestamp column', () => {
            const cols = getTableColumns(matches);
            expect(cols.startTime.columnType).toBe('PgTimestamp');
        });

        it('is not null', () => {
            const cols = getTableColumns(matches);
            expect(cols.startTime.notNull).toBe(true);
        });

        it('has DB column name "start_time"', () => {
            const cols = getTableColumns(matches);
            expect(cols.startTime.name).toBe('start_time');
        });
    });

    describe('endTime column', () => {
        it('is a timestamp column', () => {
            const cols = getTableColumns(matches);
            expect(cols.endTime.columnType).toBe('PgTimestamp');
        });

        it('is nullable', () => {
            const cols = getTableColumns(matches);
            expect(cols.endTime.notNull).toBe(false);
        });

        it('has DB column name "end_time"', () => {
            const cols = getTableColumns(matches);
            expect(cols.endTime.name).toBe('end_time');
        });
    });

    describe('homeScore column', () => {
        it('is an integer column', () => {
            const cols = getTableColumns(matches);
            expect(cols.homeScore.columnType).toBe('PgInteger');
        });

        it('is not null', () => {
            const cols = getTableColumns(matches);
            expect(cols.homeScore.notNull).toBe(true);
        });

        it('has a default value of 0', () => {
            const cols = getTableColumns(matches);
            expect(cols.homeScore.default).toBe(0);
        });

        it('has DB column name "home_score"', () => {
            const cols = getTableColumns(matches);
            expect(cols.homeScore.name).toBe('home_score');
        });
    });

    describe('awayScore column', () => {
        it('is an integer column', () => {
            const cols = getTableColumns(matches);
            expect(cols.awayScore.columnType).toBe('PgInteger');
        });

        it('is not null', () => {
            const cols = getTableColumns(matches);
            expect(cols.awayScore.notNull).toBe(true);
        });

        it('has a default value of 0', () => {
            const cols = getTableColumns(matches);
            expect(cols.awayScore.default).toBe(0);
        });

        it('has DB column name "away_score"', () => {
            const cols = getTableColumns(matches);
            expect(cols.awayScore.name).toBe('away_score');
        });
    });

    describe('createdAt column', () => {
        it('is a timestamp column', () => {
            const cols = getTableColumns(matches);
            expect(cols.createdAt.columnType).toBe('PgTimestamp');
        });

        it('is not null', () => {
            const cols = getTableColumns(matches);
            expect(cols.createdAt.notNull).toBe(true);
        });

        it('has a default value (defaultNow)', () => {
            const cols = getTableColumns(matches);
            expect(cols.createdAt.hasDefault).toBe(true);
        });

        it('has DB column name "created_at"', () => {
            const cols = getTableColumns(matches);
            expect(cols.createdAt.name).toBe('created_at');
        });
    });

    it('exposes all expected columns', () => {
        const cols = getTableColumns(matches);
        const colKeys = Object.keys(cols);
        expect(colKeys).toContain('id');
        expect(colKeys).toContain('sport');
        expect(colKeys).toContain('homeTeam');
        expect(colKeys).toContain('awayTeam');
        expect(colKeys).toContain('status');
        expect(colKeys).toContain('startTime');
        expect(colKeys).toContain('endTime');
        expect(colKeys).toContain('homeScore');
        expect(colKeys).toContain('awayScore');
        expect(colKeys).toContain('createdAt');
    });

    it('has exactly 10 columns', () => {
        const cols = getTableColumns(matches);
        expect(Object.keys(cols)).toHaveLength(10);
    });
});

describe('commentary table', () => {
    it('has the correct table name', () => {
        expect(getTableName(commentary)).toBe('commentary');
    });

    describe('id column', () => {
        it('is a serial column', () => {
            const cols = getTableColumns(commentary);
            expect(cols.id.columnType).toBe('PgSerial');
        });

        it('is the primary key', () => {
            const cols = getTableColumns(commentary);
            expect(cols.id.primary).toBe(true);
        });

        it('is not null', () => {
            const cols = getTableColumns(commentary);
            expect(cols.id.notNull).toBe(true);
        });
    });

    describe('matchId column', () => {
        it('is an integer column', () => {
            const cols = getTableColumns(commentary);
            expect(cols.matchId.columnType).toBe('PgInteger');
        });

        it('is not null', () => {
            const cols = getTableColumns(commentary);
            expect(cols.matchId.notNull).toBe(true);
        });

        it('has DB column name "match_id"', () => {
            const cols = getTableColumns(commentary);
            expect(cols.matchId.name).toBe('match_id');
        });
    });

    describe('minute column', () => {
        it('is an integer column', () => {
            const cols = getTableColumns(commentary);
            expect(cols.minute.columnType).toBe('PgInteger');
        });

        it('is nullable', () => {
            const cols = getTableColumns(commentary);
            expect(cols.minute.notNull).toBe(false);
        });
    });

    describe('sequence column', () => {
        it('is an integer column', () => {
            const cols = getTableColumns(commentary);
            expect(cols.sequence.columnType).toBe('PgInteger');
        });

        it('is nullable', () => {
            const cols = getTableColumns(commentary);
            expect(cols.sequence.notNull).toBe(false);
        });
    });

    describe('period column', () => {
        it('is a text column', () => {
            const cols = getTableColumns(commentary);
            expect(cols.period.columnType).toBe('PgText');
        });

        it('is nullable', () => {
            const cols = getTableColumns(commentary);
            expect(cols.period.notNull).toBe(false);
        });
    });

    describe('eventType column', () => {
        it('is a text column', () => {
            const cols = getTableColumns(commentary);
            expect(cols.eventType.columnType).toBe('PgText');
        });

        it('is not null', () => {
            const cols = getTableColumns(commentary);
            expect(cols.eventType.notNull).toBe(true);
        });

        it('has DB column name "event_type"', () => {
            const cols = getTableColumns(commentary);
            expect(cols.eventType.name).toBe('event_type');
        });
    });

    describe('actor column', () => {
        it('is a text column', () => {
            const cols = getTableColumns(commentary);
            expect(cols.actor.columnType).toBe('PgText');
        });

        it('is nullable', () => {
            const cols = getTableColumns(commentary);
            expect(cols.actor.notNull).toBe(false);
        });
    });

    describe('team column', () => {
        it('is a text column', () => {
            const cols = getTableColumns(commentary);
            expect(cols.team.columnType).toBe('PgText');
        });

        it('is nullable', () => {
            const cols = getTableColumns(commentary);
            expect(cols.team.notNull).toBe(false);
        });
    });

    describe('message column', () => {
        it('is a text column', () => {
            const cols = getTableColumns(commentary);
            expect(cols.message.columnType).toBe('PgText');
        });

        it('is not null', () => {
            const cols = getTableColumns(commentary);
            expect(cols.message.notNull).toBe(true);
        });
    });

    describe('metadata column', () => {
        it('is a jsonb column', () => {
            const cols = getTableColumns(commentary);
            expect(cols.metadata.columnType).toBe('PgJsonb');
        });

        it('is nullable', () => {
            const cols = getTableColumns(commentary);
            expect(cols.metadata.notNull).toBe(false);
        });
    });

    describe('tags column', () => {
        it('is an array column', () => {
            const cols = getTableColumns(commentary);
            expect(cols.tags.columnType).toBe('PgArray');
        });

        it('is nullable', () => {
            const cols = getTableColumns(commentary);
            expect(cols.tags.notNull).toBe(false);
        });
    });

    describe('createdAt column', () => {
        it('is a timestamp column', () => {
            const cols = getTableColumns(commentary);
            expect(cols.createdAt.columnType).toBe('PgTimestamp');
        });

        it('is not null', () => {
            const cols = getTableColumns(commentary);
            expect(cols.createdAt.notNull).toBe(true);
        });

        it('has a default value (defaultNow)', () => {
            const cols = getTableColumns(commentary);
            expect(cols.createdAt.hasDefault).toBe(true);
        });

        it('has DB column name "created_at"', () => {
            const cols = getTableColumns(commentary);
            expect(cols.createdAt.name).toBe('created_at');
        });
    });

    it('exposes all expected columns', () => {
        const cols = getTableColumns(commentary);
        const colKeys = Object.keys(cols);
        expect(colKeys).toContain('id');
        expect(colKeys).toContain('matchId');
        expect(colKeys).toContain('minute');
        expect(colKeys).toContain('sequence');
        expect(colKeys).toContain('period');
        expect(colKeys).toContain('eventType');
        expect(colKeys).toContain('actor');
        expect(colKeys).toContain('team');
        expect(colKeys).toContain('message');
        expect(colKeys).toContain('metadata');
        expect(colKeys).toContain('tags');
        expect(colKeys).toContain('createdAt');
    });

    it('has exactly 12 columns', () => {
        const cols = getTableColumns(commentary);
        expect(Object.keys(cols)).toHaveLength(12);
    });
});