import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import { CreateMurmurDto } from './dto/create-murmur.dto';
import { PaginationDto } from './dto/pagination.dto';
import { MurmursService } from './murmurs.service';

@Controller()
export class MurmursController {
    constructor(private readonly murmursService: MurmursService) {}

    @Get('murmurs')
    async findAll(@Query() query: PaginationDto, @CurrentUser() userId?: string) {
        return this.murmursService.findAll(userId, query);
    }

    @Get('murmurs/:id')
    async findOne(@Param('id') id: string, @CurrentUser() userId?: string) {
        return this.murmursService.findOne(id, userId);
    }

    @Get('users/:userId/murmurs')
    async findByUser(@Param('userId') userId: string, @Query() query: PaginationDto, @CurrentUser() currentUserId?: string) {
        return this.murmursService.findByUser(userId, currentUserId, query);
    }
    @UseGuards(AccessTokenGuard)
    @Get('me/timeline')
    async findTimeline(@CurrentUser() userId: string, @Query('page') page: string = '1', @Query('limit') limit: string = '10') {
        try {
            const parsedPage = parseInt(page, 10);
            const parsedLimit = parseInt(limit, 10);

            const query: PaginationDto = {
                page: isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage,
                limit: isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100 ? 10 : parsedLimit,
            };

            return await this.murmursService.findTimeline(userId, query);
        } catch (error) {
            console.error('Timeline controller error:', error);
            throw error;
        }
    }

    @UseGuards(AccessTokenGuard)
    @Post('me/murmurs')
    async create(@CurrentUser() userId: string, @Body() createMurmurDto: CreateMurmurDto) {
        return this.murmursService.create(userId, createMurmurDto);
    }

    @UseGuards(AccessTokenGuard)
    @Delete('me/murmurs/:id')
    async remove(@CurrentUser() userId: string, @Param('id') id: string) {
        await this.murmursService.remove(id, userId);
        return { success: true };
    }

    @UseGuards(AccessTokenGuard)
    @Post('murmurs/:id/like')
    async like(@CurrentUser() userId: string, @Param('id') id: string) {
        return this.murmursService.like(id, userId);
    }

    @UseGuards(AccessTokenGuard)
    @Delete('murmurs/:id/like')
    async unlike(@CurrentUser() userId: string, @Param('id') id: string) {
        return this.murmursService.unlike(id, userId);
    }

    @UseGuards(AccessTokenGuard)
    @Post('users/:id/follow')
    async follow(@CurrentUser() userId: string, @Param('id') followingId: string) {
        await this.murmursService.follow(followingId, userId);
        return { success: true };
    }

    @UseGuards(AccessTokenGuard)
    @Delete('users/:id/follow')
    async unfollow(@CurrentUser() userId: string, @Param('id') followingId: string) {
        await this.murmursService.unfollow(followingId, userId);
        return { success: true };
    }

    @Get('users/:userId/follow-counts')
    async getFollowCounts(@Param('userId') userId: string) {
        return this.murmursService.getFollowCounts(userId);
    }

    @UseGuards(AccessTokenGuard)
    @Get('users/:userId/is-following')
    async isFollowing(@CurrentUser() currentUserId: string, @Param('userId') userId: string) {
        return this.murmursService.isFollowing(currentUserId, userId);
    }
}
