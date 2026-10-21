import { apiClient } from './client';
import type { PregnancyContent, ContentStatus, ContentType } from '@/types';

export interface ContentListResponse {
  data: PregnancyContent[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchContent(
  page: number,
  pageSize: number,
  search?: string,
  statusFilter?: string,
  typeFilter?: string,
  weekFilter?: number | null,
): Promise<ContentListResponse> {
  try {
    const res = await apiClient.get('/pregnancy-content/admin/list', {
      params: {
        page,
        pageSize,
        search,
        status: statusFilter,
        type: typeFilter,
        week: weekFilter,
      },
    });

    if (res?.data?.success && Array.isArray(res.data.data)) {
      const items: PregnancyContent[] = res.data.data.map((c: any) => ({
        id: c.id,
        title: c.title,
        week: c.week,
        type: (c.category || 'baby_development') as ContentType,
        status: (c.status || 'published') as ContentStatus,
        author: c.author || 'Clinical Obstetric Board',
        source: 'ACOG / Obstetric Guidelines',
        version: 1,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        body: c.body || c.summary || '',
        summary: c.summary || '',
        babySize: c.babySize || '',
        babyLength: c.babyLength || '',
        babyWeight: c.babyWeight || '',
        fetalHighlight: c.fetalHighlight || '',
        maternalTip: c.maternalTip || '',
      }));

      return {
        data: items,
        total: res.data.total ?? items.length,
        page: res.data.page ?? page,
        pageSize: res.data.pageSize ?? pageSize,
      };
    }
  } catch (e) {
    console.warn('Failed to fetch live content from backend:', e);
  }

  return {
    data: [],
    total: 0,
    page,
    pageSize,
  };
}

export async function fetchContentById(id: string): Promise<PregnancyContent | null> {
  try {
    const res = await apiClient.get(`/pregnancy-content/week/${id}`);
    if (res?.data?.success && res.data.data) {
      const c = res.data.data;
      return {
        id: c.id || String(c.week),
        title: c.title,
        week: c.week,
        type: 'baby_development',
        status: (c.status || 'published') as ContentStatus,
        author: c.author || 'Clinical Obstetric Board',
        source: 'ACOG Guidelines',
        version: 1,
        createdAt: c.createdAt || new Date().toISOString(),
        updatedAt: c.updatedAt || new Date().toISOString(),
        body: c.body || c.fetalHighlight || c.summary || '',
        summary: c.summary || '',
        babySize: c.babySize || '',
        babyLength: c.babyLength || '',
        babyWeight: c.babyWeight || '',
        fetalHighlight: c.fetalHighlight || '',
        maternalTip: c.maternalTip || '',
      };
    }
  } catch (e) {
    console.warn(`Failed to fetch content #${id}:`, e);
  }
  return null;
}

export async function createContent(
  data: Omit<PregnancyContent, 'id' | 'createdAt' | 'updatedAt' | 'version'>,
): Promise<PregnancyContent> {
  try {
    const res = await apiClient.post('/pregnancy-content/admin/upsert', {
      week: data.week,
      title: data.title,
      summary: data.summary,
      body: data.body,
      babySize: data.babySize,
      babyLength: data.babyLength,
      babyWeight: data.babyWeight,
      fetalHighlight: data.fetalHighlight || data.body,
      maternalTip: data.maternalTip,
      status: data.status,
      category: data.type,
      author: data.author,
    });

    if (res?.data?.success && res.data.data) {
      const c = res.data.data;
      return {
        ...data,
        id: c.id,
        version: 1,
        createdAt: c.createdAt || new Date().toISOString(),
        updatedAt: c.updatedAt || new Date().toISOString(),
      };
    }
  } catch (e) {
    console.warn('Failed to upsert live content:', e);
  }

  return {
    ...data,
    id: `c-${Date.now()}`,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function updateContent(
  id: string,
  data: Partial<PregnancyContent>,
): Promise<PregnancyContent | null> {
  try {
    await apiClient.post('/pregnancy-content/admin/upsert', {
      id,
      week: data.week,
      title: data.title,
      summary: data.summary,
      body: data.body,
      babySize: data.babySize,
      babyLength: data.babyLength,
      babyWeight: data.babyWeight,
      fetalHighlight: data.fetalHighlight || data.body,
      maternalTip: data.maternalTip,
      status: data.status,
    });
  } catch (e) {
    console.warn('Failed to update live content:', e);
  }

  return {
    id,
    title: data.title || '',
    week: data.week || 20,
    type: data.type || 'baby_development',
    status: data.status || 'published',
    author: data.author || 'Clinical Obstetric Board',
    source: 'ACOG Guidelines',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    body: data.body || '',
    summary: data.summary || '',
    babySize: data.babySize || '',
    babyLength: data.babyLength || '',
    babyWeight: data.babyWeight || '',
    fetalHighlight: data.fetalHighlight || '',
    maternalTip: data.maternalTip || '',
  };
}

export async function submitForReview(id: string): Promise<{ success: boolean; message: string }> {
  try {
    await updateContent(id, { status: 'review' });
    return { success: true, message: 'Content submitted for review.' };
  } catch {
    return { success: false, message: 'Failed to submit.' };
  }
}

export async function publishContent(id: string): Promise<{ success: boolean; message: string }> {
  try {
    await updateContent(id, { status: 'published' });
    return { success: true, message: 'Content published successfully.' };
  } catch {
    return { success: false, message: 'Failed to publish.' };
  }
}

export async function fetchTasksForWeek(week: number): Promise<any[]> {
  try {
    const res = await apiClient.get(`/pregnancy-content/public/tasks/week/${week}`);
    if (res?.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (e) {
    console.warn(`Failed to fetch tasks for week ${week}:`, e);
  }
  return [];
}

export async function fetchAdminTasks(params?: {
  week?: number;
  category?: string;
  userId?: string;
  search?: string;
}): Promise<any[]> {
  try {
    const res = await apiClient.get('/pregnancy-content/admin/tasks/list', { params });
    if (res?.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (e) {
    console.warn('Failed to fetch admin tasks:', e);
  }
  return [];
}

export async function createWeeklyTask(dto: {
  week: number;
  title: string;
  category: string;
  timeStr?: string;
  timeOfDay?: string;
  emoji?: string;
  description?: string;
  clinicalRationale?: string;
  userId?: string | null;
}): Promise<any> {
  const res = await apiClient.post('/pregnancy-content/admin/tasks/create', dto);
  return res?.data?.data;
}

export async function updateWeeklyTask(
  taskId: string,
  dto: {
    week?: number;
    title?: string;
    category?: string;
    timeStr?: string;
    timeOfDay?: string;
    emoji?: string;
    description?: string;
    clinicalRationale?: string;
    userId?: string | null;
  },
): Promise<any> {
  const res = await apiClient.post(`/pregnancy-content/admin/tasks/update/${taskId}`, dto);
  return res?.data?.data;
}

export async function deleteWeeklyTask(taskId: string): Promise<boolean> {
  const res = await apiClient.delete(`/pregnancy-content/admin/tasks/${taskId}`);
  return !!res?.data?.success;
}

export const contentApi = {
  fetchContent,
  fetchContentById,
  createContent,
  updateContent,
  submitForReview,
  publishContent,
  fetchTasksForWeek,
  fetchAdminTasks,
  createWeeklyTask,
  updateWeeklyTask,
  deleteWeeklyTask,
};

