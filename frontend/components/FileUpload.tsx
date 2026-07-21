// components/FileUpload.tsx
import { api } from '@/lib/api';

export function FileUpload() {
  const handleUpload = async (files: File[]) => {
    try {
      const result = await api.mergePDFs(files);
      downloadBlob(result, 'merged.pdf');
    } catch (error: any) {
      if (error.message.includes('Rate limit')) {
        // Show rate limit message to user
        alert('Please wait a moment before making more requests.');
      } else {
        // Handle other errors
        alert(error.message);
      }
    }
  };

  return (
    // Your upload component
  );
}