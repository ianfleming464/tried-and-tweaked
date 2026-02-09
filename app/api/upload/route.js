import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported image type. Use JPEG, PNG, WEBP, or GIF.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Image must be 5MB or smaller.' },
        { status: 400 }
      );
    }

    const safeFilename = file.name
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '');
    const filename = safeFilename || 'upload';
    const blobPath = `recipes/${Date.now()}-${filename}`;

    const blob = await put(blobPath, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json(
      {
        url: blob.url,
        pathname: blob.pathname,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
