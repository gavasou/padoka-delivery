import React, { useEffect, useState } from 'react';

// Performance monitoring para Core Web Vitals
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<{
    fcp?: number;
    lcp?: number;
    cls?: number;
    fid?: number;
  }>({});

  useEffect(() => {
    // Observar Core Web Vitals
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
            }
            break;
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          case 'layout-shift':
            if (!entry.hadRecentInput) {
              setMetrics(prev => ({ 
                ...prev, 
                cls: (prev.cls || 0) + (entry as any).value 
              }));
            }
            break;
          case 'first-input':
            setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
            break;
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] });
    } catch (e) {
      // Fallback para browsers que não suportam todas as métricas
      console.warn('Performance monitoring não suportado completamente');
    }

    return () => observer.disconnect();
  }, []);

  const logMetrics = () => {
    console.group('📊 Core Web Vitals');
    console.log('First Contentful Paint (FCP):', metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'N/A');
    console.log('Largest Contentful Paint (LCP):', metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A');
    console.log('Cumulative Layout Shift (CLS):', metrics.cls ? Math.round(metrics.cls * 1000) / 1000 : 'N/A');
    console.log('First Input Delay (FID):', metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A');
    console.groupEnd();
  };

  return { metrics, logMetrics };
};

// Componente para imagens otimizadas com lazy loading
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    const element = document.getElementById(`img-${src.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imgId = `img-${src.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div
      id={imgId}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder enquanto carrega */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Imagem com erro */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Erro ao carregar</span>
          </div>
        </div>
      )}

      {/* Imagem real */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 w-full h-full object-cover`}
        />
      )}
    </div>
  );
};

// Hook para preload de recursos críticos
export const useResourcePreload = (resources: { href: string; as: string; type?: string }[]) => {
  useEffect(() => {
    const preloadedLinks: HTMLLinkElement[] = [];

    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) {
        link.type = resource.type;
      }

      document.head.appendChild(link);
      preloadedLinks.push(link);
    });

    return () => {
      preloadedLinks.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [resources]);
};

// Componente de monitoramento de performance (apenas em desenvolvimento)
export const PerformanceMonitor: React.FC = () => {
  const { metrics, logMetrics } = usePerformanceMonitor();

  useEffect(() => {
    // Log automático após 5 segundos
    const timer = setTimeout(() => {
      if (import.meta.env.MODE === 'development') {
        logMetrics();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [logMetrics]);

  // Não renderizar nada em produção
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white text-xs p-2 rounded z-50">
      <div>FCP: {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'N/A'}</div>
      <div>LCP: {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A'}</div>
      <div>CLS: {metrics.cls ? Math.round(metrics.cls * 1000) / 1000 : 'N/A'}</div>
      <div>FID: {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A'}</div>
      <button 
        onClick={logMetrics} 
        className="mt-1 px-2 py-1 bg-blue-600 rounded text-xs"
      >
        Log
      </button>
    </div>
  );
};