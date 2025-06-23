import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { users } from '../db/schema/auth.schema';
import { follows, likes, murmurs } from '../db/schema/murmur.schema';
import { DRIZZLE_ORM } from '../drizzle/constants';
import { DrizzleService } from '../drizzle/drizzle.provider';
import { CreateMurmurDto } from './dto/create-murmur.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class MurmursService {
    constructor(@Inject(DRIZZLE_ORM) private readonly db: DrizzleService) {}

    async create(userId: string, dto: CreateMurmurDto) {
        const id = nanoid();
        await this.db
            .insert(murmurs)
            .values({
                id,
                content: dto.content,
                authorId: userId,
            })
            .execute();

        return this.findOne(id, userId);
    }

    async findAll(userId: string | undefined, { page, limit }: PaginationDto) {
        const offset = (page - 1) * limit;

        const [murmursResult, totalCount] = await Promise.all([
            this.db
                .select({
                    murmur: {
                        id: murmurs.id,
                        content: murmurs.content,
                        authorId: murmurs.authorId,
                        createdAt: murmurs.createdAt,
                        updatedAt: murmurs.updatedAt,
                        likeCount: murmurs.likeCount,
                    },
                    author: {
                        id: users.id,
                        name: users.name,
                        image: users.image,
                    },
                    isLiked: userId
                        ? sql`EXISTS (
                SELECT 1 FROM ${likes}
                WHERE ${likes.murmurId} = ${murmurs.id}
                AND ${likes.userId} = ${userId}
              )`
                        : sql`false`,
                })
                .from(murmurs)
                .innerJoin(users, eq(users.id, murmurs.authorId))
                .orderBy(desc(murmurs.createdAt))
                .limit(limit)
                .offset(offset),

            this.db
                .select({ count: sql<number>`count(*)` })
                .from(murmurs)
                .execute()
                .then((result) => result[0].count),
        ]);

        return {
            murmurs: murmursResult.map((row) => ({
                ...row.murmur,
                author: row.author,
                isLiked: row.isLiked,
            })),
            pagination: {
                total: totalCount,
                page,
                limit,
                pages: Math.ceil(totalCount / limit),
            },
        };
    }

    async findOne(id: string, userId: string | undefined) {
        const result = await this.db
            .select({
                murmur: {
                    id: murmurs.id,
                    content: murmurs.content,
                    authorId: murmurs.authorId,
                    createdAt: murmurs.createdAt,
                    updatedAt: murmurs.updatedAt,
                    likeCount: murmurs.likeCount,
                },
                author: {
                    id: users.id,
                    name: users.name,
                    image: users.image,
                },
                isLiked: userId
                    ? sql`EXISTS (
              SELECT 1 FROM ${likes}
              WHERE ${likes.murmurId} = ${murmurs.id}
              AND ${likes.userId} = ${userId}
            )`
                    : sql`false`,
            })
            .from(murmurs)
            .innerJoin(users, eq(users.id, murmurs.authorId))
            .where(eq(murmurs.id, id))
            .execute();

        if (!result.length) {
            throw new NotFoundException('Murmur not found');
        }

        const row = result[0];
        return {
            ...row.murmur,
            author: row.author,
            isLiked: row.isLiked,
        };
    }

    async findByUser(userId: string, currentUserId: string | undefined, { page, limit }: PaginationDto) {
        const offset = (page - 1) * limit;

        const [murmursResult, totalCount] = await Promise.all([
            this.db
                .select({
                    murmur: {
                        id: murmurs.id,
                        content: murmurs.content,
                        authorId: murmurs.authorId,
                        createdAt: murmurs.createdAt,
                        updatedAt: murmurs.updatedAt,
                        likeCount: murmurs.likeCount,
                    },
                    author: {
                        id: users.id,
                        name: users.name,
                        image: users.image,
                    },
                    isLiked: currentUserId
                        ? sql`EXISTS (
                SELECT 1 FROM ${likes}
                WHERE ${likes.murmurId} = ${murmurs.id}
                AND ${likes.userId} = ${currentUserId}
              )`
                        : sql`false`,
                })
                .from(murmurs)
                .innerJoin(users, eq(users.id, murmurs.authorId))
                .where(eq(murmurs.authorId, userId))
                .orderBy(desc(murmurs.createdAt))
                .limit(limit)
                .offset(offset),

            this.db
                .select({ count: sql<number>`count(*)` })
                .from(murmurs)
                .where(eq(murmurs.authorId, userId))
                .execute()
                .then((result) => result[0].count),
        ]);

        return {
            murmurs: murmursResult.map((row) => ({
                ...row.murmur,
                author: row.author,
                isLiked: row.isLiked,
            })),
            pagination: {
                total: totalCount,
                page,
                limit,
                pages: Math.ceil(totalCount / limit),
            },
        };
    }
    async findTimeline(userId: string, { page, limit }: PaginationDto) {
        try {
            const offset = (page - 1) * limit;

            const [murmursResult, totalCount] = await Promise.all([
                this.db
                    .select({
                        murmur: {
                            id: murmurs.id,
                            content: murmurs.content,
                            authorId: murmurs.authorId,
                            createdAt: murmurs.createdAt,
                            updatedAt: murmurs.updatedAt,
                            likeCount: murmurs.likeCount,
                        },
                        author: {
                            id: users.id,
                            name: users.name,
                            image: users.image,
                        },
                        isLiked: sql`EXISTS (
              SELECT 1 FROM ${likes}
              WHERE ${likes.murmurId} = ${murmurs.id}
              AND ${likes.userId} = ${userId}
            )`,
                    })
                    .from(murmurs)
                    .innerJoin(users, eq(users.id, murmurs.authorId))
                    .orderBy(desc(murmurs.createdAt))
                    .limit(limit)
                    .offset(offset),
                this.db
                    .select({ count: sql<number>`count(*)` })
                    .from(murmurs)
                    .execute()
                    .then((result) => result[0]?.count || 0),
            ]);

            return {
                murmurs: murmursResult.map((row) => ({
                    ...row.murmur,
                    author: row.author,
                    isLiked: row.isLiked,
                })),
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    pages: Math.ceil(totalCount / limit),
                },
            };
        } catch (error) {
            console.error('Error in findTimeline:', error);
            throw new Error('Failed to fetch timeline');
        }
    }

    async remove(id: string, userId: string) {
        const murmur = await this.db.select().from(murmurs).where(eq(murmurs.id, id)).execute();

        if (!murmur.length) {
            throw new NotFoundException('Murmur not found');
        }

        if (murmur[0].authorId !== userId) {
            throw new NotFoundException('Murmur not found');
        }

        await this.db.delete(murmurs).where(eq(murmurs.id, id)).execute();
    }

    async like(murmurId: string, userId: string) {
        const murmur = await this.db.select().from(murmurs).where(eq(murmurs.id, murmurId)).execute();

        if (!murmur.length) {
            throw new NotFoundException('Murmur not found');
        }

        await this.db.transaction(async (tx) => {
            await tx.insert(likes).values({
                murmurId,
                userId,
            });

            await tx
                .update(murmurs)
                .set({
                    likeCount: sql`${murmurs.likeCount} + 1`,
                })
                .where(eq(murmurs.id, murmurId))
                .execute();
        });

        return this.findOne(murmurId, userId);
    }

    async unlike(murmurId: string, userId: string) {
        const murmur = await this.db.select().from(murmurs).where(eq(murmurs.id, murmurId)).execute();

        if (!murmur.length) {
            throw new NotFoundException('Murmur not found');
        }

        await this.db.transaction(async (tx) => {
            await tx
                .delete(likes)
                .where(and(eq(likes.murmurId, murmurId), eq(likes.userId, userId)))
                .execute();

            await tx
                .update(murmurs)
                .set({
                    likeCount: sql`${murmurs.likeCount} - 1`,
                })
                .where(eq(murmurs.id, murmurId))
                .execute();
        });

        return this.findOne(murmurId, userId);
    }

    async follow(followingId: string, followerId: string) {
        if (followingId === followerId) {
            throw new NotFoundException('User not found');
        }

        const user = await this.db.select().from(users).where(eq(users.id, followingId)).execute();
        if (!user.length) {
            throw new NotFoundException('User not found');
        }

        // Check if already following
        const existing = await this.db
            .select()
            .from(follows)
            .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
            .execute();
        if (existing.length > 0) {
            // Already following, do nothing (idempotent)
            return;
        }

        await this.db.insert(follows).values({
            followerId,
            followingId,
        });
    }

    async unfollow(followingId: string, followerId: string) {
        await this.db
            .delete(follows)
            .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
            .execute();
    }

    async getFollowCounts(userId: string) {
        // Count followers (users who follow this user)
        const followersResult = await this.db
            .select({ count: sql<number>`count(*)` })
            .from(follows)
            .where(eq(follows.followingId, userId))
            .execute();
        const followersCount = followersResult[0]?.count || 0;

        // Count following (users this user follows)
        const followingResult = await this.db
            .select({ count: sql<number>`count(*)` })
            .from(follows)
            .where(eq(follows.followerId, userId))
            .execute();
        const followingCount = followingResult[0]?.count || 0;

        return { followersCount, followingCount };
    }

    async isFollowing(followerId: string, followingId: string) {
        const result = await this.db
            .select()
            .from(follows)
            .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
            .execute();

        return { isFollowing: result.length > 0 };
    }
}
