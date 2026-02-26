import { useMutation } from '@tanstack/react-query';

export const useCloudinaryUpload = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME';
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'YOUR_PRESET_NAME';

      if (!cloudName || cloudName === 'YOUR_CLOUD_NAME') {
        throw new Error('Cloudinary credentials missing in .env');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
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

      return data.secure_url as string;
    }
  });
};
