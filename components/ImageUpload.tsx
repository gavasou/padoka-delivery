import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, AlertCircle, Settings, Loader } from 'lucide-react';
import { supabase } from '../services/supabase';

interface ImageUploadProps {
  onImageUploaded: (url: string, publicUrl: string) => void;
  bucketName: 'product-images' | 'bakery-images' | 'avatars';
  existingImage?: string;
  uploadPath?: string;
  maxSizeInMB?: number;
  acceptTypes?: string;
  disabled?: boolean;
  enableCompression?: boolean;
  compressionQuality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  bucketName,
  existingImage,
  uploadPath = 'uploads',
  maxSizeInMB = 25,
  acceptTypes = 'image/jpeg,image/jpg,image/png,image/webp,image/heic,image/*',
  disabled = false,
  enableCompression = true,
  compressionQuality = 0.8,
  maxWidth = 1920,
  maxHeight = 1080
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCompressionSettings, setShowCompressionSettings] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(compressionQuality);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Supported image formats
  const SUPPORTED_FORMATS = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ];

  const getBucketConfig = () => {
    const configs = {
      'product-images': { path: 'products/', maxSize: maxSizeInMB },
      'bakery-images': { path: 'bakeries/', maxSize: maxSizeInMB },
      'avatars': { path: 'users/', maxSize: maxSizeInMB }
    };
    return configs[bucketName];
  };

  // Compress image before upload
  const compressImage = (file: File, quality: number = currentQuality, maxW: number = maxWidth, maxH: number = maxHeight): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxW) {
            height = (height * maxW) / width;
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = (width * maxH) / height;
            height = maxH;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, file.type, quality);
      };

      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  // Validate file type
  const validateFileType = (file: File): { valid: boolean; message?: string } => {
    if (!SUPPORTED_FORMATS.includes(file.type) && !file.type.startsWith('image/')) {
      return {
        valid: false,
        message: `Formato não suportado. Formatos aceitos: JPG, PNG, WebP, HEIC. Tipo atual: ${file.type}`
      };
    }
    return { valid: true };
  };

  // Validate file size
  const validateFileSize = (file: File): { valid: boolean; message?: string } => {
    const config = getBucketConfig();
    const maxSize = config.maxSize * 1024 * 1024;
    
    if (file.size > maxSize) {
      return {
        valid: false,
        message: `Arquivo muito grande. Tamanho atual: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Máximo permitido: ${config.maxSize}MB`
      };
    }
    return { valid: true };
  };

  // Generate preview URL
  const generatePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const uploadImage = async (file: File) => {
    if (disabled) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');
    setUploadProgress(0);

    // Validations
    const typeValidation = validateFileType(file);
    if (!typeValidation.valid) {
      setErrorMessage(typeValidation.message!);
      setUploadStatus('error');
      setIsUploading(false);
      return;
    }

    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      setErrorMessage(sizeValidation.message!);
      setUploadStatus('error');
      setIsUploading(false);
      return;
    }

    // Generate preview
    const preview = await generatePreview(file);
    setPreviewUrl(preview);

    try {
      setIsCompressing(true);
      setUploadProgress(10);

      // Compress image if enabled
      let fileToUpload = file;
      if (enableCompression && file.type !== 'image/gif') {
        fileToUpload = await compressImage(file);
        setUploadProgress(30);
      }
      
      setIsCompressing(false);
      setUploadProgress(50);

      const fileExt = file.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2);
      const fileName = `${timestamp}-${randomStr}.${fileExt}`;
      const filePath = `${getBucketConfig().path}${uploadPath}/${fileName}`;

      setUploadProgress(60);

      // Upload to Supabase Storage with progress tracking
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      setUploadProgress(80);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setUploadProgress(100);
      setUploadStatus('success');
      onImageUploaded(filePath, publicUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(error.message || 'Erro ao fazer upload da imagem. Verifique sua conexão e tente novamente.');
    } finally {
      setIsUploading(false);
      setIsCompressing(false);
      setTimeout(() => setUploadProgress(0), 1000);
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

  const resetUpload = () => {
    setUploadStatus('idle');
    setErrorMessage('');
    setPreviewUrl('');
    setUploadProgress(0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFileType(file).valid && validateFileSize(file).valid) {
        uploadImage(file);
      }
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
    if (isCompressing) {
      return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    
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
      {/* Preview da imagem existente ou nova */}
      {(existingImage || previewUrl) && uploadStatus === 'idle' && (
        <div className="relative mb-4">
          <img 
            src={previewUrl || existingImage} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg border"
          />
          <button
            onClick={() => {
              onImageUploaded('', '');
              setPreviewUrl('');
            }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error message display */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{errorMessage}</p>
            <button
              onClick={resetUpload}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Área de upload */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ease-in-out
          ${dragOver && !disabled ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 hover:bg-gray-50'}
          ${uploadStatus === 'success' ? 'border-green-500 bg-green-50' : ''}
          ${uploadStatus === 'error' ? 'border-red-500 bg-red-50' : ''}
          ${isUploading || isCompressing ? 'pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && !isCompressing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading || isCompressing}
        />

        {/* Upload progress indicator */}
        {(isUploading || isCompressing) && (
          <div className="flex flex-col items-center mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {isCompressing ? 'Comprimindo imagem...' : 'Fazendo upload...'} {uploadProgress}%
            </p>
          </div>
        )}

        {isUploading || isCompressing ? (
          <div className="flex flex-col items-center">
            {renderStatusIcon()}
            <p className="text-sm text-gray-600 mt-2">
              {isCompressing ? 'Otimizando imagem para melhor qualidade...' : 'Processando upload...'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center space-x-4 mb-3">
              {renderStatusIcon()}
              <Upload className={`w-8 h-8 transition-colors ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
            </div>
            
            {dragOver ? (
              <div className="text-center">
                <p className="text-lg font-medium text-blue-600 mb-2">
                  Solte a imagem aqui
                </p>
                <p className="text-sm text-blue-500">
                  Formatos aceitos: JPG, PNG, WebP, HEIC
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  Arraste uma imagem aqui ou
                </p>
                
                <div className="flex space-x-2">
                  <span 
                    className="text-blue-500 hover:text-blue-600 underline cursor-pointer transition-colors"
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
                    className="text-blue-500 hover:text-blue-600 underline flex items-center gap-1 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    tirar foto
                  </button>
                </div>
              </>
            )}
            
            {/* Compression settings toggle */}
            <div className="mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCompressionSettings(!showCompressionSettings);
                }}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
              >
                <Settings className="w-3 h-3" />
                Configurações
              </button>
              
              {showCompressionSettings && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-left">
                  <div className="text-xs space-y-2">
                    <label className="flex items-center justify-between">
                      <span>Qualidade da compressão:</span>
                      <span className="text-gray-600">{Math.round(currentQuality * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={currentQuality}
                      onChange={(e) => setCurrentQuality(parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={enableCompression}
                        onChange={(e) => e.stopPropagation()}
                        className="rounded"
                      />
                      <span>Ativar compressão automática</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Máximo {maxSizeInMB}MB • Formatos: JPG, PNG, WebP, HEIC
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;