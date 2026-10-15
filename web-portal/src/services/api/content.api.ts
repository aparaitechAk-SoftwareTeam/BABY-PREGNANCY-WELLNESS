import { API_BASE_URL } from '@/constants';
import { mockContent } from '@/mocks/content.mock';
import type { PregnancyContent, ContentStatus, ContentType } from '@/types';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  await delay(400);

  let filtered = [...mockContent];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) => c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q),
    );
  }

  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter((c) => c.status === statusFilter);
  }

  if (typeFilter && typeFilter !== 'all') {
    filtered = filtered.filter((c) => c.type === typeFilter);
  }

  if (weekFilter !== null && weekFilter !== undefined) {
    filtered = filtered.filter((c) => c.week === weekFilter);
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return { data, total, page, pageSize };
}

export async function fetchContentById(id: string): Promise<PregnancyContent | null> {
  await delay(300);
  return mockContent.find((c) => c.id === id) || null;
}

export async function createContent(
  data: Omit<PregnancyContent, 'id' | 'createdAt' | 'updatedAt' | 'version'>,
): Promise<PregnancyContent> {
  await delay(600);
  const newContent: PregnancyContent = {
    ...data,
    id: `c-${String(mockContent.length + 1).padStart(3, '0')}`,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockContent.unshift(newContent);
  return newContent;
}

export async function updateContent(
  id: string,
  data: Partial<PregnancyContent>,
): Promise<PregnancyContent | null> {
  await delay(500);
  const idx = mockContent.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  mockContent[idx] = {
    ...mockContent[idx],
    ...data,
    version: mockContent[idx].version + 1,
    updatedAt: new Date().toISOString(),
  };
  return mockContent[idx];
}

export async function submitForReview(id: string): Promise<{ success: boolean; message: string }> {
  await delay(400);
  const content = mockContent.find((c) => c.id === id);
  if (content) {
    content.status = 'review';
    content.updatedAt = new Date().toISOString();
    return { success: true, message: 'Content submitted for review.' };
  }
  return { success: false, message: 'Content not found.' };
}

export async function publishContent(id: string): Promise<{ success: boolean; message: string }> {
  await delay(400);
  const content = mockContent.find((c) => c.id === id);
  if (content) {
    content.status = 'published';
    content.reviewedAt = new Date().toISOString();
    content.updatedAt = new Date().toISOString();
    return { success: true, message: 'Content published successfully.' };
  }
  return { success: false, message: 'Content not found.' };
}

export const contentApi = {
  fetchContent,
  fetchContentById,
  createContent,
  updateContent,
  submitForReview,
  publishContent,
};
