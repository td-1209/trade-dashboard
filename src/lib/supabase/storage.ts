// Resize image to 20% of original size
function resizeImage(file: File, scale: number = 0.2): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          }
        },
        file.type,
        0.8
      ); // 80% quality for compression
    };

    img.src = URL.createObjectURL(file);
  });
}

// Server-side upload via API route for production safety
export async function uploadImage(file: File): Promise<string> {
  // Resize image before upload
  const resizedFile = await resizeImage(file);

  const formData = new FormData();
  formData.append('file', resizedFile);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Upload API error:', {
      status: response.status,
      statusText: response.statusText,
      error: error
    });
    throw new Error(error.details ? `${error.error}: ${error.details}` : error.error || 'Upload failed');
  }

  const data = await response.json();
  return data.url;
}

// Delete function via API route
export async function deleteImage(url: string): Promise<void> {
  // Supabase Storage URL format: http://127.0.0.1:54321/storage/v1/object/public/images/filename
  // Extract filename from the URL
  const urlParts = url.split('/');
  const fileName = urlParts[urlParts.length - 1];
  
  if (!fileName || fileName === 'images') {
    throw new Error('Invalid image URL - cannot extract filename');
  }

  console.log('Attempting to delete:', fileName);

  const response = await fetch('/api/upload', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileName }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Delete API error:', errorData);
    throw new Error(errorData.error || 'Delete failed');
  }

  console.log('Delete API success for:', fileName);
}
