import { useMutation } from '@tanstack/react-query';

export const useCloudinaryUpload = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      // 1. Get credentials from environment
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME';
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'YOUR_PRESET_NAME';

      if (!cloudName || cloudName === 'YOUR_CLOUD_NAME') {
        throw new Error('Cloudinary credentials missing in .env');
      }

      // 2. Prepare Form Data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      // 3. Upload to Cloudinary API
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { 
          method: 'POST', 
          body: formData 
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image to Cloudinary');
      }

      const data = await response.json();
      
      // Return the secure URL
      return data.secure_url as string;
    }
  });
};
