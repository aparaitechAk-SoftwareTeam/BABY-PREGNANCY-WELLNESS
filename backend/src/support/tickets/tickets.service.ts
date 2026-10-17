import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

export interface TicketFilterDto {
  page?: number;
  pageSize?: number;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  assignedAgentId?: string;
  unassignedOnly?: boolean;
}

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  private get ticketModel(): any {
    return (this.prisma as any).supportTicket;
  }

  private get messageModel(): any {
    return (this.prisma as any).ticketMessage;
  }

  async getTickets(filters: TicketFilterDto = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const pageSize = Math.max(1, Number(filters.pageSize) || 20);
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { subject: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { userName: { contains: q, mode: 'insensitive' } },
        { userEmail: { contains: q, mode: 'insensitive' } },
        { ticketNumber: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (filters.status && filters.status !== 'all') {
      where.status = filters.status;
    }

    if (filters.priority && filters.priority !== 'all') {
      where.priority = filters.priority;
    }

    if (filters.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    if (filters.assignedAgentId) {
      where.assignedAgentId = filters.assignedAgentId;
    }

    if (filters.unassignedOnly) {
      where.OR = [{ status: 'unassigned' }, { assignedAgentId: null }];
    }

    const [total, tickets] = await Promise.all([
      this.ticketModel.count({ where }),
      this.ticketModel.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: tickets.map((t: any) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        description: t.description,
        status: t.status,
        priority: t.priority,
        category: t.category,
        userId: t.userId,
        user: t.userName || 'Anonymous Mother',
        userEmail: t.userEmail || '',
        assignedAgent: t.assignedAgent,
        assignedAgentId: t.assignedAgentId,
        escalated: t.escalated,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        messagesCount: t.messages?.length || 0,
      })),
      total,
      page,
      pageSize,
    };
  }

  async getTicketById(id: string) {
    const ticket = await this.ticketModel.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} not found`);
    }

    return {
      success: true,
      data: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        userId: ticket.userId,
        user: ticket.userName || ticket.user?.name || 'Mother',
        userEmail: ticket.userEmail || ticket.user?.email || '',
        assignedAgent: ticket.assignedAgent,
        assignedAgentId: ticket.assignedAgentId,
        escalated: ticket.escalated,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        messages: (ticket.messages || []).map((m: any) => ({
          id: m.id,
          ticketId: m.ticketId,
          senderName: m.senderName,
          senderRole: m.senderRole,
          senderId: m.senderId,
          message: m.message,
          createdAt: m.createdAt.toISOString(),
        })),
      },
    };
  }

  async createTicket(dto: {
    subject: string;
    description: string;
    category?: string;
    priority?: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
  }) {
    const count = await this.ticketModel.count();
    const ticketNumber = `TIC-${String(count + 1001).padStart(5, '0')}`;

    const created = await this.ticketModel.create({
      data: {
        ticketNumber,
        subject: dto.subject,
        description: dto.description,
        category: dto.category || 'general',
        priority: dto.priority || 'medium',
        status: 'open',
        userId: dto.userId || null,
        userName: dto.userName || 'Mother',
        userEmail: dto.userEmail || '',
      },
    });

    return {
      success: true,
      message: 'Support ticket registered successfully',
      data: created,
    };
  }

  async addMessage(ticketId: string, dto: {
    message: string;
    senderName: string;
    senderRole?: string;
    senderId?: string;
  }) {
    const ticket = await this.ticketModel.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const createdMessage = await this.messageModel.create({
      data: {
        ticketId,
        message: dto.message,
        senderName: dto.senderName,
        senderRole: dto.senderRole || 'support',
        senderId: dto.senderId || null,
      },
    });

    // Automatically touch updatedAt and optionally transition status
    await this.ticketModel.update({
      where: { id: ticketId },
      data: {
        status: dto.senderRole === 'user' ? 'open' : 'awaiting_response',
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      data: createdMessage,
    };
  }

  async updateTicket(id: string, updates: {
    status?: string;
    priority?: string;
    assignedAgent?: string;
    assignedAgentId?: string;
    escalated?: boolean;
  }) {
    const ticket = await this.ticketModel.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const updated = await this.ticketModel.update({
      where: { id },
      data: updates,
    });

    return {
      success: true,
      data: updated,
    };
  }

  async getEscalations() {
    const escalations = await this.ticketModel.findMany({
      where: {
        OR: [{ escalated: true }, { priority: 'urgent' }],
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    return {
      success: true,
      data: escalations,
    };
  }

  async getStats() {
    const [total, open, unassigned, escalated, resolved] = await Promise.all([
      this.ticketModel.count(),
      this.ticketModel.count({ where: { status: 'open' } }),
      this.ticketModel.count({ where: { OR: [{ status: 'unassigned' }, { assignedAgentId: null }] } }),
      this.ticketModel.count({ where: { OR: [{ escalated: true }, { priority: 'urgent' }] } }),
      this.ticketModel.count({ where: { status: 'resolved' } }),
    ]);

    return {
      success: true,
      data: {
        total,
        open,
        unassigned,
        escalated,
        resolved,
      },
    };
  }
}
