import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

interface ImageUploadProps {
  onImageUploaded: (url: string, publicUrl: string) => void;
  bucketName: 'product-images' | 'bakery-images' | 'avatars';
  existingImage?: string;
  uploadPath?: string;
  maxSizeInMB?: number;
  acceptTypes?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  bucketName,
  existingImage,
  uploadPath = 'uploads',
  maxSizeInMB = 5,
  acceptTypes = 'image/*',
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getBucketConfig = () => {
    const configs = {
      'product-images': { path: 'products/', maxSize: maxSizeInMB },
      'bakery-images': { path: 'bakeries/', maxSize: maxSizeInMB },
      'avatars': { path: 'users/', maxSize: maxSizeInMB }
    };
    return configs[bucketName];
  };

  const uploadImage = async (file: File) => {
    if (disabled) return;

    // Validações
    const config = getBucketConfig();
    const maxSize = config.maxSize * 1024 * 1024; // Convert MB to bytes
    
    if (file.size > maxSize) {
      alert(`Arquivo muito grande. Máximo permitido: ${config.maxSize}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${config.path}${uploadPath}/${fileName}`;

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setUploadStatus('success');
      onImageUploaded(filePath, publicUrl);
    } catch (error) {
      console.error('Erro no upload:', error);
      setUploadStatus('error');
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadImage(files[0]);
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use camera traseira em dispositivos móveis
      });
      
      // Criar elemento de vídeo para captura
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Modal simples para captura (você pode expandir isso)
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      `;

      video.style.cssText = `
        max-width: 90%;
        max-height: 70%;
        border-radius: 8px;
      `;

      const buttons = document.createElement('div');
      buttons.style.cssText = `
        margin-top: 20px;
        display: flex;
        gap: 10px;
      `;

      const captureBtn = document.createElement('button');
      captureBtn.textContent = 'Capturar';
      captureBtn.style.cssText = `
        padding: 10px 20px;
        background: #F9B400;
        border: none;
        border-radius: 6px;
        color: white;
        font-weight: bold;
        cursor: pointer;
      `;

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancelar';
      cancelBtn.style.cssText = `
        padding: 10px 20px;
        background: #666;
        border: none;
        border-radius: 6px;
        color: white;
        cursor: pointer;
      `;

      buttons.appendChild(captureBtn);
      buttons.appendChild(cancelBtn);

      modal.appendChild(video);
      modal.appendChild(buttons);
      document.body.appendChild(modal);

      // Capturar imagem
      captureBtn.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { 
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            uploadImage(file);
          }
          
          // Limpar
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(modal);
        }, 'image/jpeg', 0.8);
      };

      cancelBtn.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };

    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Não foi possível acessar a câmera. Use o botão de upload para selecionar uma imagem.');
    }
  };

  const renderStatusIcon = () => {
    switch (uploadStatus) {
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Preview da imagem existente */}
      {existingImage && uploadStatus === 'idle' && (
        <div className="relative mb-4">
          <img 
            src={existingImage} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg border"
          />
          <button
            onClick={() => onImageUploaded('', '')}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Área de upload */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver && !disabled ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${uploadStatus === 'success' ? 'border-green-500 bg-green-50' : ''}
          ${uploadStatus === 'error' ? 'border-red-500 bg-red-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-sm text-gray-600">Fazendo upload...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center space-x-4 mb-3">
              {renderStatusIcon()}
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              Arraste uma imagem aqui ou
            </p>
            
            <div className="flex space-x-2">
              <span 
                className="text-blue-500 hover:text-blue-600 underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) fileInputRef.current?.click();
                }}
              >
                clique para selecionar
              </span>
              
              <span className="text-gray-500">ou</span>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) openCamera();
                }}
                disabled={disabled}
                className="text-blue-500 hover:text-blue-600 underline flex items-center gap-1"
              >
                <Camera className="w-4 h-4" />
                tirar foto
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Máximo {maxSizeInMB}MB • JPG, PNG, WebP
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;