import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.find((bucket) => bucket.name === 'images');

    if (!bucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket(
        'images',
        {
          public: true,
          allowedMimeTypes: ['image/*'],
          fileSizeLimit: '10MB',
        }
      );
      if (bucketError) {
        console.error('Bucket creation error:', bucketError);
        return NextResponse.json(
          { error: 'Failed to create storage bucket' },
          { status: 500 }
        );
      }
    }

    // Upload file
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('images').getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { fileName } = await request.json();

    if (!fileName) {
      console.error('DELETE API: No filename provided');
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      );
    }

    console.log('DELETE API: Attempting to delete file:', fileName);

    const { error } = await supabase.storage.from('images').remove([fileName]);

    if (error) {
      console.error('DELETE API: Supabase delete error:', error);
      return NextResponse.json(
        { error: 'Delete failed', details: error.message },
        { status: 500 }
      );
    }

    console.log('DELETE API: Successfully deleted:', fileName);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
