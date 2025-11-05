import { useState } from 'react';
import { supabase } from '../services/supabase';

interface UploadProgress {
  [key: string]: {
    progress: number;
    status: 'uploading' | 'completed' | 'error';
  };
}

export const useStorage = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});

  const uploadFile = async (
    file: File,
    bucketName: string,
    path: string,
    onProgress?: (progress: number) => void
  ) => {
    const fileId = `${bucketName}/${path}/${Date.now()}`;
    
    setUploadProgress(prev => ({
      ...prev,
      [fileId]: { progress: 0, status: 'uploading' }
    }));

    try {
      // Simular progresso de upload
      const updateProgress = (progress: number) => {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { progress, status: 'uploading' }
        }));
        onProgress?.(progress);
      };

      updateProgress(30);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (progress) => {
            updateProgress(Math.round((progress.loaded / progress.total) * 100));
          }
        });

      if (error) throw error;

      updateProgress(80);

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(path);

      updateProgress(100);
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { progress: 100, status: 'completed' }
      }));

      return { path, publicUrl, data };
    } catch (error) {
      console.error('Erro no upload:', error);
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { progress: 0, status: 'error' }
      }));
      throw error;
    }
  };

  const deleteFile = async (bucketName: string, path: string) => {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path]);

    if (error) throw error;
    return true;
  };

  const getPublicUrl = (bucketName: string, path: string) => {
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);
    
    return publicUrl;
  };

  return {
    uploadFile,
    deleteFile,
    getPublicUrl,
    uploadProgress
  };
};

export default useStorage;