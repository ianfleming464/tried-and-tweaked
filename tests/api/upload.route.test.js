import { beforeEach, describe, expect, it, vi } from 'vitest';

const { putMock } = vi.hoisted(() => ({
  putMock: vi.fn(),
}));

vi.mock('@vercel/blob', () => ({
  put: putMock,
}));

import { POST } from '@/app/api/upload/route';

function buildRequestWithFormData(formData) {
  return new Request('http://localhost/api/upload', {
    method: 'POST',
    body: formData,
  });
}

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when file is missing', async () => {
    const formData = new FormData();
    const response = await POST(buildRequestWithFormData(formData));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Image file is required');
    expect(putMock).not.toHaveBeenCalled();
  });

  it('returns 400 for unsupported file type', async () => {
    const formData = new FormData();
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    formData.append('file', file);

    const response = await POST(buildRequestWithFormData(formData));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('Unsupported image type');
    expect(putMock).not.toHaveBeenCalled();
  });

  it('uploads valid image and returns URL', async () => {
    const formData = new FormData();
    const file = new File(['fake-image'], 'dish.png', { type: 'image/png' });
    formData.append('file', file);
    putMock.mockResolvedValue({
      url: 'https://blob.vercel-storage.com/recipes/test.png',
      pathname: 'recipes/test.png',
    });

    const response = await POST(buildRequestWithFormData(formData));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.url).toContain('blob.vercel-storage.com');
    expect(putMock).toHaveBeenCalledTimes(1);
    expect(putMock).toHaveBeenCalledWith(
      expect.stringMatching(/^recipes\/\d+-dish\.png$/),
      file,
      expect.objectContaining({
        access: 'public',
        addRandomSuffix: true,
      })
    );
  });
});
