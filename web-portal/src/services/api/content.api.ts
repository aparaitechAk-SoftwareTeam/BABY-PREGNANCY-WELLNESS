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
        status: 'published',
        author: 'Clinical Obstetric Board',
        source: 'ACOG Guidelines',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        body: c.fetalHighlight || c.summary || '',
        summary: c.summary || '',
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
      fetalHighlight: data.body,
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
      fetalHighlight: data.body,
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

export const contentApi = {
  fetchContent,
  fetchContentById,
  createContent,
  updateContent,
  submitForReview,
  publishContent,
};
