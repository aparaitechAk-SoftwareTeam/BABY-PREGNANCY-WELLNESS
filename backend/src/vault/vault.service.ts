import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface CreateDocumentDto {
  title: string;
  category: string;
  date: string;
  doctorName?: string;
  clinicName?: string;
  notes?: string;
  fileType?: string;
  fileSize?: string;
  fileUrl?: string;
  isSharedWithCaregiver?: boolean;
  appointmentId?: string;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  category?: string;
  dateStr?: string;
  week?: number;
}

@Injectable()
export class VaultService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveUserId(userId?: string): Promise<string | null> {
    if (!userId) return null;
    const user = await (this.prisma as any).user.findFirst({
      where: {
        OR: [{ id: userId }, { email: userId }],
      },
    });
    return user ? user.id : userId;
  }

  // DOCUMENTS
  async getDocuments(userIdOrIdentifier: string) {
    const userId = await this.resolveUserId(userIdOrIdentifier);
    if (!userId) return { success: true, data: [] };

    const records = await (this.prisma as any).medicalDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: records,
    };
  }

  async createDocument(userIdOrIdentifier: string, dto: CreateDocumentDto) {
    const userId = (await this.resolveUserId(userIdOrIdentifier)) || userIdOrIdentifier;

    const record = await (this.prisma as any).medicalDocument.create({
      data: {
        userId,
        title: dto.title,
        category: dto.category || 'ultrasound',
        date: dto.date || new Date().toISOString().slice(0, 10),
        doctorName: dto.doctorName || '',
        clinicName: dto.clinicName || '',
        notes: dto.notes || '',
        fileType: dto.fileType || 'pdf',
        fileSize: dto.fileSize || '1.5 MB',
        fileUrl: dto.fileUrl || '',
        isSharedWithCaregiver: dto.isSharedWithCaregiver ?? true,
        appointmentId: dto.appointmentId,
      },
    });

    return {
      success: true,
      message: 'Medical document uploaded to vault',
      data: record,
    };
  }

  async deleteDocument(userIdOrIdentifier: string, id: string) {
    const userId = await this.resolveUserId(userIdOrIdentifier);
    const existing = await (this.prisma as any).medicalDocument.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Document not found in medical vault');
    }

    await (this.prisma as any).medicalDocument.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Document deleted successfully',
    };
  }

  async toggleCaregiverShare(userIdOrIdentifier: string, id: string) {
    const userId = await this.resolveUserId(userIdOrIdentifier);
    const existing = await (this.prisma as any).medicalDocument.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Document not found in medical vault');
    }

    const updated = await (this.prisma as any).medicalDocument.update({
      where: { id },
      data: { isSharedWithCaregiver: !existing.isSharedWithCaregiver },
    });

    return {
      success: true,
      data: updated,
    };
  }

  // MATERNAL NOTES
  async getNotes(userIdOrIdentifier: string) {
    const userId = await this.resolveUserId(userIdOrIdentifier);
    if (!userId) return { success: true, data: [] };

    const records = await (this.prisma as any).maternalNote.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: records,
    };
  }

  async createNote(userIdOrIdentifier: string, dto: CreateNoteDto) {
    const userId = (await this.resolveUserId(userIdOrIdentifier)) || userIdOrIdentifier;

    const record = await (this.prisma as any).maternalNote.create({
      data: {
        userId,
        title: dto.title,
        content: dto.content,
        category: dto.category || 'Doctor Questions',
        dateStr: dto.dateStr || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        week: Number(dto.week) || 20,
      },
    });

    return {
      success: true,
      message: 'Note saved successfully',
      data: record,
    };
  }

  async deleteNote(userIdOrIdentifier: string, id: string) {
    const userId = await this.resolveUserId(userIdOrIdentifier);
    const existing = await (this.prisma as any).maternalNote.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Note not found');
    }

    await (this.prisma as any).maternalNote.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Note removed successfully',
    };
  }
}
