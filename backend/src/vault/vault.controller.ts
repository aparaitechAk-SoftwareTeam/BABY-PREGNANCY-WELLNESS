import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { VaultService, CreateDocumentDto, CreateNoteDto } from './vault.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @UseGuards(JwtAuthGuard)
  @Get('documents')
  async getDocuments(@CurrentUser() user: any, @Req() req: any) {
    const userId =
      user?.sub ||
      user?.id ||
      req.query?.userId ||
      req.query?.email ||
      req.headers['x-user-id'] ||
      req.headers['x-user-email'];
    return this.vaultService.getDocuments(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('documents')
  async createDocument(
    @CurrentUser() user: any,
    @Body() dto: CreateDocumentDto,
    @Req() req: any,
  ) {
    const userId =
      user?.sub ||
      user?.id ||
      req.query?.userId ||
      req.query?.email ||
      req.headers['x-user-id'] ||
      req.headers['x-user-email'];
    return this.vaultService.createDocument(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('documents/:id')
  async deleteDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId =
      user?.sub ||
      user?.id ||
      req.query?.userId ||
      req.query?.email ||
      req.headers['x-user-id'] ||
      req.headers['x-user-email'];
    return this.vaultService.deleteDocument(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('documents/:id/share')
  async toggleCaregiverShare(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId =
      user?.sub ||
      user?.id ||
      req.query?.userId ||
      req.query?.email ||
      req.headers['x-user-id'] ||
      req.headers['x-user-email'];
    return this.vaultService.toggleCaregiverShare(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('notes')
  async getNotes(@CurrentUser() user: any, @Req() req: any) {
    const userId =
      user?.sub ||
      user?.id ||
      req.query?.userId ||
      req.query?.email ||
      req.headers['x-user-id'] ||
      req.headers['x-user-email'];
    return this.vaultService.getNotes(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('notes')
  async createNote(
    @CurrentUser() user: any,
    @Body() dto: CreateNoteDto,
    @Req() req: any,
  ) {
    const userId =
      user?.sub ||
      user?.id ||
      req.query?.userId ||
      req.query?.email ||
      req.headers['x-user-id'] ||
      req.headers['x-user-email'];
    return this.vaultService.createNote(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('notes/:id')
  async deleteNote(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId =
      user?.sub ||
      user?.id ||
      req.query?.userId ||
      req.query?.email ||
      req.headers['x-user-id'] ||
      req.headers['x-user-email'];
    return this.vaultService.deleteNote(userId, id);
  }
}
