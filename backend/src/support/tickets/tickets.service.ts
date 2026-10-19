import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
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
export class TicketsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedInitialTicketsIfEmpty();
  }

  private async seedInitialTicketsIfEmpty() {
    try {
      const count = await this.ticketModel.count();
      if (count === 0) {
        const seedTickets = [
          {
            ticketNumber: 'TICK-1001',
            subject: 'Caregiver pairing code not showing on partner device',
            description: 'My partner entered the MOM-XXXX pairing code but got a network retry prompt. Can you verify if our pairing link is active?',
            status: 'open',
            priority: 'high',
            category: 'technical',
            userName: 'Emma Watson',
            userEmail: 'emma.watson@gmail.com',
            assignedAgent: 'Maria Garcia',
            escalated: false,
          },
          {
            ticketNumber: 'TICK-1002',
            subject: 'How to export clinical doctor consultation PDF report',
            description: 'I need to provide my OB/GYN with my blood pressure and weight trend logs before next Tuesday appointment.',
            status: 'awaiting_response',
            priority: 'medium',
            category: 'app_usage',
            userName: 'Priya Sharma',
            userEmail: 'priya.sharma@gmail.com',
            assignedAgent: 'Maria Garcia',
            escalated: false,
          },
          {
            ticketNumber: 'TICK-1003',
            subject: 'Kick counter session recorded 12 kicks instead of 10',
            description: 'Can support adjust my morning kick count log session for yesterday? I accidentally tapped twice.',
            status: 'resolved',
            priority: 'low',
            category: 'clinical',
            userName: 'Jessica Alba',
            userEmail: 'jessica@gmail.com',
            assignedAgent: 'Maria Garcia',
            escalated: false,
          },
          {
            ticketNumber: 'TICK-1004',
            subject: 'Subscription billing invoice request for hospital reimbursement',
            description: 'I purchased the Maternal Premium plan and need a formal tax invoice with GSTIN for health insurance claim.',
            status: 'open',
            priority: 'urgent',
            category: 'billing',
            userName: 'Elena Rostova',
            userEmail: 'elena@gmail.com',
            assignedAgent: null,
            escalated: false,
          },
          {
            ticketNumber: 'TICK-1005',
            subject: 'Bluetooth sync disconnects during 3rd trimester sleep session',
            description: 'Caregiver device stopped receiving maternal sleep vitals after the latest OS update. Please advise.',
            status: 'escalated',
            priority: 'high',
            category: 'technical',
            userName: 'Ananya Patel',
            userEmail: 'ananya@gmail.com',
            assignedAgent: 'Maria Garcia',
            escalated: true,
          },
        ];

        for (const t of seedTickets) {
          await this.ticketModel.create({ data: t });
        }
      }
    } catch (e) {
      // quiet fallback
    }
  }

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
