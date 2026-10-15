import { mockSupportTickets, mockTicketMessages } from '@/mocks/support.mock';
import type { SupportTicket, TicketMessage, TicketStatus, TicketPriority } from '@/types';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let ticketStore = [...mockSupportTickets];
let messageStore = [...mockTicketMessages];

export interface TicketListResponse {
  data: SupportTicket[];
  total: number;
}

export async function fetchTickets(
  page: number,
  pageSize: number,
  filters?: {
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
    assignedAgentId?: string;
    unassignedOnly?: boolean;
  },
): Promise<TicketListResponse> {
  await delay(400);
  let filtered = [...ticketStore];

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.user.toLowerCase().includes(q) ||
        t.userEmail.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q),
    );
  }

  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter((t) => t.status === filters.status);
  }

  if (filters?.priority && filters.priority !== 'all') {
    filtered = filtered.filter((t) => t.priority === filters.priority);
  }

  if (filters?.category && filters.category !== 'all') {
    filtered = filtered.filter((t) => t.category === filters.category);
  }

  if (filters?.assignedAgentId) {
    filtered = filtered.filter((t) => t.assignedAgentId === filters.assignedAgentId);
  }

  if (filters?.unassignedOnly) {
    filtered = filtered.filter((t) => t.status === 'unassigned' || !t.assignedAgentId);
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return { data, total };
}

export async function fetchTicketById(id: string): Promise<SupportTicket | null> {
  await delay(300);
  return ticketStore.find((t) => t.id === id) || null;
}

export async function fetchTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  await delay(300);
  return messageStore.filter((m) => m.ticketId === ticketId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export async function sendTicketMessage(
  ticketId: string,
  content: string,
  author: string,
  isInternal: boolean,
): Promise<TicketMessage> {
  await delay(400);
  const message: TicketMessage = {
    id: `msg-${String(messageStore.length + 1).padStart(3, '0')}`,
    ticketId,
    author,
    authorRole: 'agent',
    content,
    timestamp: new Date().toISOString(),
    isInternal,
  };
  messageStore.push(message);

  const ticket = ticketStore.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.updatedAt = new Date().toISOString();
    if (isInternal && ticket.status === 'open') {
      // Keep status as open for internal notes
    } else if (!isInternal) {
      ticket.status = 'awaiting_response';
    }
  }

  return message;
}

export async function assignTicket(ticketId: string, agentId: string, agentName: string): Promise<{ success: boolean; message: string }> {
  await delay(400);
  const ticket = ticketStore.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.assignedAgentId = agentId;
    ticket.assignedAgent = agentName;
    if (ticket.status === 'unassigned') {
      ticket.status = 'open';
    }
    ticket.updatedAt = new Date().toISOString();
    return { success: true, message: `Ticket ${ticketId} assigned to ${agentName}.` };
  }
  return { success: false, message: 'Ticket not found.' };
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus): Promise<{ success: boolean; message: string }> {
  await delay(300);
  const ticket = ticketStore.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    return { success: true, message: `Ticket status updated to ${status.replace(/_/g, ' ')}.` };
  }
  return { success: false, message: 'Ticket not found.' };
}

export async function updateTicketPriority(ticketId: string, priority: TicketPriority): Promise<{ success: boolean; message: string }> {
  await delay(300);
  const ticket = ticketStore.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.priority = priority;
    ticket.updatedAt = new Date().toISOString();
    return { success: true, message: `Ticket priority updated to ${priority}.` };
  }
  return { success: false, message: 'Ticket not found.' };
}

export async function escalateTicket(ticketId: string, reason: string, escalatedBy: string): Promise<{ success: boolean; message: string }> {
  await delay(500);
  const ticket = ticketStore.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.escalated = true;
    ticket.escalationReason = reason;
    ticket.status = 'escalated';
    ticket.updatedAt = new Date().toISOString();
    return { success: true, message: `Ticket ${ticketId} has been escalated.` };
  }
  return { success: false, message: 'Ticket not found.' };
}

export const ticketApi = {
  fetchTickets,
  fetchTicketById,
  fetchTicketMessages,
  sendTicketMessage,
  assignTicket,
  updateTicketStatus,
  updateTicketPriority,
  escalateTicket,
};
