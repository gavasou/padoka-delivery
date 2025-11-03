import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '../types';

interface Review {
  id: string;
  user_id: string;
  bakery_id: string;
  product_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  users_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
}

interface ReviewsManagerProps {
  user: User;
  bakeryId: string;
  productId?: string;
  showCreateForm?: boolean;
}

const StarRating: React.FC<{
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const renderStar = (index: number) => {
    const filled = index <= (hoveredRating || rating);
    
    return (
      <button
        key={index}
        type="button"
        disabled={readonly}
        className={`${sizeClasses[size]} ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        onMouseEnter={() => !readonly && setHoveredRating(index)}
        onMouseLeave={() => !readonly && setHoveredRating(0)}
        onClick={() => !readonly && onRatingChange?.(index)}
      >
        <svg 
          fill={filled ? '#F9B400' : 'none'} 
          stroke={filled ? '#F9B400' : '#9CA3AF'} 
          viewBox="0 0 24 24"
          className="w-full h-full"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
          />
        </svg>
      </button>
    );
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map(renderStar)}
    </div>
  );
};

const ReviewForm: React.FC<{
  user: User;
  bakeryId: string;
  productId?: string;
  onSubmit: () => void;
  onCancel: () => void;
}> = ({ user, bakeryId, productId, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Por favor, selecione uma avaliação de 1 a 5 estrelas');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('reviews-manager', {
        body: {
          action: 'create_review',
          userId: user.id,
          reviewData: {
            bakeryId,
            productId,
            rating,
            comment: comment.trim() || null
          }
        }
      });

      if (error) throw error;

      onSubmit();
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      alert('Erro ao enviar avaliação: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border">
      <h3 className="text-lg font-semibold text-brand-text mb-4">
        Avaliar {productId ? 'Produto' : 'Padaria'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-text mb-2">
            Sua avaliação
          </label>
          <StarRating 
            rating={rating} 
            onRatingChange={setRating}
            size="lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-text mb-2">
            Comentário (opcional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Conte sua experiência..."
            className="w-full p-3 border border-brand-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            rows={4}
            maxLength={500}
          />
          <div className="text-right text-xs text-brand-text-secondary mt-1">
            {comment.length}/500
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="flex-1 bg-brand-primary text-brand-secondary px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-brand-primary text-brand-primary rounded-lg font-medium hover:bg-brand-background transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

const ReviewItem: React.FC<{
  review: Review;
  currentUserId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ review, currentUserId, onEdit, onDelete }) => {
  const isOwner = review.user_id === currentUserId;
  const reviewDate = new Date(review.created_at).toLocaleDateString('pt-BR');

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
            <span className="text-brand-secondary font-semibold text-sm">
              {review.users_profile?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <div className="font-medium text-brand-text">
              {review.users_profile?.full_name || 'Usuário'}
            </div>
            <div className="flex items-center space-x-2">
              <StarRating rating={review.rating} readonly size="sm" />
              <span className="text-xs text-brand-text-secondary">{reviewDate}</span>
            </div>
          </div>
        </div>
        
        {isOwner && (
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="text-brand-primary hover:text-brand-secondary text-sm font-medium"
            >
              Editar
            </button>
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Excluir
            </button>
          </div>
        )}
      </div>

      {review.comment && (
        <p className="text-brand-text text-sm leading-relaxed">
          {review.comment}
        </p>
      )}
    </div>
  );
};

const ReviewsManager: React.FC<ReviewsManagerProps> = ({ 
  user, 
  bakeryId, 
  productId, 
  showCreateForm = true 
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadReviews = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('reviews-manager', {
        body: {
          action: 'get_reviews',
          reviewData: {
            bakeryId,
            productId,
            limit: 20,
            offset: 0
          }
        }
      });

      if (error) throw error;

      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;

    try {
      const { error } = await supabase.functions.invoke('reviews-manager', {
        body: {
          action: 'delete_review',
          userId: user.id,
          reviewData: { reviewId }
        }
      });

      if (error) throw error;

      loadReviews();
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      alert('Erro ao excluir avaliação');
    }
  };

  useEffect(() => {
    loadReviews();
  }, [bakeryId, productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && stats.totalReviews > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-text">
                {stats.averageRating.toFixed(1)}
              </div>
              <StarRating rating={Math.round(stats.averageRating)} readonly />
              <div className="text-sm text-brand-text-secondary mt-1">
                {stats.totalReviews} avaliações
              </div>
            </div>
            
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center space-x-2 mb-1">
                  <span className="text-sm w-3">{rating}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-brand-primary h-2 rounded-full"
                      style={{ 
                        width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[rating] / stats.totalReviews) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm w-8 text-right">
                    {stats.ratingDistribution[rating] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Formulário de nova avaliação */}
      {showCreateForm && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-brand-primary text-brand-secondary py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Escrever Avaliação
        </button>
      )}

      {showForm && (
        <ReviewForm
          user={user}
          bakeryId={bakeryId}
          productId={productId}
          onSubmit={() => {
            setShowForm(false);
            loadReviews();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Lista de avaliações */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-brand-text-secondary">
            {stats?.totalReviews === 0 ? 'Nenhuma avaliação ainda' : 'Nenhuma avaliação encontrada'}
          </div>
        ) : (
          reviews.map(review => (
            <ReviewItem
              key={review.id}
              review={review}
              currentUserId={user.id}
              onDelete={() => handleDeleteReview(review.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsManager;