import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FamilySharingService } from './family-sharing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class PairWithMotherDto {
  pairingCode: string;
  relationship?: string;
}

class UpdatePermissionsDto {
  milestones?: boolean;
  appointments?: boolean;
  kicks?: boolean;
  emergency?: boolean;
}

@Controller('family')
export class FamilySharingController {
  constructor(private readonly familySharingService: FamilySharingService) {}

  /**
   * MOTHER: Get or create active pairing code and see list of connected caregivers
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-code')
  async getMotherCode(@CurrentUser() user: any) {
    const motherId = user?.sub || user?.id;
    return this.familySharingService.getOrCreateMotherCode(motherId);
  }

  /**
   * MOTHER: Generate a fresh pairing code
   */
  @UseGuards(JwtAuthGuard)
  @Post('generate-code')
  async generateNewCode(
    @CurrentUser() user: any,
    @Body('relationship') relationship?: string,
  ) {
    const motherId = user?.sub || user?.id;
    return this.familySharingService.generateNewCode(motherId, relationship);
  }

  /**
   * CAREGIVER: Enter code (e.g. "MOM-8492") to link with mother
   */
  @UseGuards(JwtAuthGuard)
  @Post('pair')
  async pairWithMother(
    @CurrentUser() user: any,
    @Body() dto: PairWithMotherDto,
  ) {
    const caregiverId = user?.sub || user?.id;
    return this.familySharingService.pairWithMother(
      caregiverId,
      dto.pairingCode,
      dto.relationship,
    );
  }

  /**
   * CAREGIVER: Check connection status with mother
   */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getCaregiverStatus(@CurrentUser() user: any) {
    const caregiverId = user?.sub || user?.id;
    return this.familySharingService.getCaregiverStatus(caregiverId);
  }

  /**
   * CAREGIVER: Retrieve ALL live clinical & tracking data of the paired mother directly from Neon DB
   */
  @UseGuards(JwtAuthGuard)
  @Get('mother-data')
  async getMotherData(@CurrentUser() user: any) {
    const caregiverId = user?.sub || user?.id;
    return this.familySharingService.getMotherLiveComprehensiveData(caregiverId);
  }

  /**
   * MOTHER / CAREGIVER: Unlink pairing
   */
  @UseGuards(JwtAuthGuard)
  @Delete('unlink/:id')
  async unlinkPairing(
    @CurrentUser() user: any,
    @Param('id') pairingId: string,
  ) {
    const userId = user?.sub || user?.id;
    return this.familySharingService.unlinkPairing(userId, pairingId);
  }

  /**
   * MOTHER: Accept a pending caregiver link request
   */
  @UseGuards(JwtAuthGuard)
  @Post('requests/:id/accept')
  async acceptRequest(
    @CurrentUser() user: any,
    @Param('id') pairingId: string,
  ) {
    const motherId = user?.sub || user?.id;
    return this.familySharingService.acceptPairingRequest(motherId, pairingId);
  }

  /**
   * MOTHER: Reject a pending caregiver link request
   */
  @UseGuards(JwtAuthGuard)
  @Post('requests/:id/reject')
  async rejectRequest(
    @CurrentUser() user: any,
    @Param('id') pairingId: string,
  ) {
    const motherId = user?.sub || user?.id;
    return this.familySharingService.rejectPairingRequest(motherId, pairingId);
  }

  /**
   * MOTHER / CAREGIVER: Retrieve access & security audit logs
   */
  @UseGuards(JwtAuthGuard)
  @Get('audit-logs')
  async getAuditLogs(@CurrentUser() user: any) {
    const userId = user?.sub || user?.id;
    return this.familySharingService.getAuditLogs(userId);
  }

  /**
   * MOTHER: Update permissions granted to caregiver
   */
  @UseGuards(JwtAuthGuard)
  @Patch('permissions/:id')
  async updatePermissions(
    @CurrentUser() user: any,
    @Param('id') pairingId: string,
    @Body() permissions: UpdatePermissionsDto,
  ) {
    const motherId = user?.sub || user?.id;
    return this.familySharingService.updatePermissions(motherId, pairingId, permissions);
  }
}
