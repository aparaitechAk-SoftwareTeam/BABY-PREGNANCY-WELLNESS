import { apiClient } from './client';
import type { SupportTicket, TicketMessage, TicketStatus, TicketPriority } from '@/types';

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
  try {
    const res = await apiClient.get('/support/tickets', {
      params: {
        page,
        pageSize,
        search: filters?.search,
        status: filters?.status,
        priority: filters?.priority,
        category: filters?.category,
        assignedAgentId: filters?.assignedAgentId,
        unassignedOnly: filters?.unassignedOnly,
      },
    });

    if (res?.data?.success && Array.isArray(res.data.data)) {
      return {
        data: res.data.data,
        total: res.data.total ?? res.data.data.length,
      };
    }
  } catch (e) {
    console.warn('Failed to fetch live tickets from backend:', e);
  }

  return {
    data: [],
    total: 0,
  };
}

export async function fetchTicketById(id: string): Promise<SupportTicket | null> {
  try {
    const res = await apiClient.get(`/support/tickets/${id}`);
    if (res?.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (e) {
    console.warn(`Failed to fetch ticket #${id}:`, e);
  }
  return null;
}

export async function fetchTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  try {
    const res = await apiClient.get(`/support/tickets/${ticketId}`);
    if (res?.data?.success && res.data.data?.messages) {
      return res.data.data.messages.map((m: any) => ({
        id: m.id,
        ticketId: m.ticketId,
        author: m.senderName,
        authorRole: m.senderRole,
        content: m.message,
        timestamp: m.createdAt,
        isInternal: false,
      }));
    }
  } catch (e) {
    console.warn(`Failed to fetch ticket messages #${ticketId}:`, e);
  }
  return [];
}

export async function sendTicketMessage(
  ticketId: string,
  content: string,
  author: string,
  isInternal: boolean = false,
): Promise<TicketMessage> {
  try {
    const res = await apiClient.post(`/support/tickets/${ticketId}/messages`, {
      message: content,
      senderName: author,
      senderRole: 'support',
    });

    if (res?.data?.success && res.data.data) {
      const d = res.data.data;
      return {
        id: d.id,
        ticketId: d.ticketId,
        author: d.senderName,
        authorRole: d.senderRole,
        content: d.message,
        timestamp: d.createdAt,
        isInternal,
      };
    }
  } catch (e) {
    console.warn('Failed to send live ticket message:', e);
  }

  return {
    id: 'msg-' + Date.now(),
    ticketId,
    author,
    authorRole: 'agent',
    content,
    timestamp: new Date().toISOString(),
    isInternal,
  };
}

export async function assignTicket(
  ticketId: string,
  agentId: string,
  agentName: string,
): Promise<{ success: boolean; message: string }> {
  try {
    await apiClient.patch(`/support/tickets/${ticketId}`, {
      assignedAgentId: agentId,
      assignedAgent: agentName,
      status: 'open',
    });
    return { success: true, message: `Ticket ${ticketId} assigned to ${agentName}.` };
  } catch {
    return { success: false, message: 'Failed to assign ticket.' };
  }
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
): Promise<{ success: boolean; message: string }> {
  try {
    await apiClient.patch(`/support/tickets/${ticketId}`, { status });
    return { success: true, message: `Ticket status updated to ${status}.` };
  } catch {
    return { success: false, message: 'Failed to update ticket status.' };
  }
}

export async function updateTicketPriority(
  ticketId: string,
  priority: TicketPriority,
): Promise<{ success: boolean; message: string }> {
  try {
    await apiClient.patch(`/support/tickets/${ticketId}`, { priority });
    return { success: true, message: `Ticket priority updated to ${priority}.` };
  } catch {
    return { success: false, message: 'Failed to update ticket priority.' };
  }
}

export async function escalateTicket(
  ticketId: string,
  reason: string,
  escalatedBy: string,
): Promise<{ success: boolean; message: string }> {
  try {
    await apiClient.patch(`/support/tickets/${ticketId}`, {
      escalated: true,
      status: 'escalated',
      priority: 'urgent',
    });
    return { success: true, message: `Ticket ${ticketId} has been escalated.` };
  } catch {
    return { success: false, message: 'Failed to escalate ticket.' };
  }
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
