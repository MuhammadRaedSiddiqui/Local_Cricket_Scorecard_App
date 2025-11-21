import { z } from 'zod';

export const recordBallSchema = z.object({
  outcome: z.enum(['0', '1', '2', '3', '4', '5', '6', 'W', 'WD', 'NB', 'B', 'LB']),
  extraRuns: z.number().int().min(0).max(7).optional(),
});

export const tossSchema = z.object({
  tossWinner: z.string().min(1),
  tossDecision: z.enum(['bat', 'bowl']),
});

export const playerSelectionSchema = z.object({
  batsman1: z.string().min(1),
  batsman2: z.string().min(1),
  bowler: z.string().min(1),
});

export const createMatchSchema = z.object({
  venue: z.string().min(2).max(100),
  overs: z.number().int().min(1).max(100),
  startTime: z.string().datetime(),
  teamOne: z.object({
    name: z.string().min(2).max(50),
    players: z.array(
      z.object({
        name: z.string().min(2).max(50),
        is_captain: z.boolean(),
        is_keeper: z.boolean(),
      })
    ).min(2).max(15),
  }),
  teamTwo: z.object({
    name: z.string().min(2).max(50),
    players: z.array(
      z.object({
        name: z.string().min(2).max(50),
        is_captain: z.boolean(),
        is_keeper: z.boolean(),
      })
    ).min(2).max(15),
  }),
  isPrivate: z.boolean(),
});