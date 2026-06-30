import express from 'express';
import { db } from '../db/db.js';
import { commentary } from '../db/schema.js';
import { createCommentarySchema, listCommentaryQuerySchema } from '../validation/commentary.js';
import { matchIdParamSchema } from '../validation/matches.js';
import { desc, eq } from 'drizzle-orm';


export const commentryRouter = express.Router({
    mergeParams: true,  // we have allowed that id which we have (/matches/:id/commentry) written in index.js file can be accesible here, so that we can parsed it
});

commentryRouter.get('/', async (req, res) => {
    try {
        const paramsParsed = matchIdParamSchema.safeParse(req.params);
        if (!paramsParsed.success) {
            return res.status(400).json({ error: 'Invalid match id.', details: paramsParsed.error.issues });
        }

        const queryParsed = listCommentaryQuerySchema.safeParse(req.query);
        if (!queryParsed.success) {
            return res.status(400).json({ error: 'Invalid query.', details: queryParsed.error.issues });
        }

        const { id: matchId } = paramsParsed.data; //taking in ID
        const { defaultLimit = 10 } = queryParsed.data;
        const maxLimit = 100;
        const limit = Math.min(defaultLimit, maxLimit);


        const data = await db
            .select()
            .from(commentary)
            .where(eq(commentary.matchId, matchId))
            .orderBy(desc(commentary.createdAt))
            .limit(limit);

        return res.status(200).json({ data });
    } catch (e) {
        console.error('Failed to fetch commentary:', e);
        return res.status(500).json({ error: 'Failed to fetch commentary.' });
    }
});

commentryRouter.post('/', async (req, res) => {

    // console.log(req.params);
    // res.send("hii");
    try {

        const paramsParsed = matchIdParamSchema.safeParse(req.params);

        if (!paramsParsed.success) {
            return res.status(400).json({ error: 'Invalid match id.', details: paramsParsed.error.issues });
        }

        const bodyParsed = createCommentarySchema.safeParse(req.body);
        if (!bodyParsed.success) {
            return res.status(400).json({ error: 'Invalid payload.', details: bodyParsed.error.issues });
        }

        const { id: matchId } = paramsParsed.data;
        const data = bodyParsed.data;

        const [created] = await db.insert(commentary).values({
            ...data,
            matchId,
            minute: data.minute ?? null,
            sequence: data.sequence ?? null,
            period: data.period ?? null,
            actor: data.actor ?? null,
            team: data.team ?? null,
            metadata: data.metadata ?? null,
            tags: data.tags ?? null,
        }).returning();

        if (res.app.locals.broadcastCommentry) {
            res.app.locals.broadcastCommentry(created.matchId,created)
        }

        return res.status(201).json({ data: created });
    } catch (e) {
        console.error('Failed to create commentary:', e);
        return res.status(500).json({ error: 'Failed to create commentary.' });
    }
});

