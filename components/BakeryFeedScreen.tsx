
import React, { useState, useEffect } from 'react';
import type { Bakery, FeedPost } from '../types';
import { getBakeryFeed } from '../services/api';
import { IconChevronLeft, IconStar } from './StatIcons';

interface BakeryFeedScreenProps {
  bakery: Bakery;
  onBack: () => void;
}

const StarRating = ({ rating = 0 }: { rating?: number }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <IconStar
                key={i}
                className={`w-4 h-4 ${i < Math.round(rating) ? 'text-brand-primary' : 'text-gray-300'}`}
            />
        ))}
    </div>
);

const FeedPostCard: React.FC<{ post: FeedPost }> = ({ post }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 mb-4 overflow-hidden">
            <div className="p-4">
                <div className="flex items-center mb-3">
                    <img src={post.user.profileImageUrl} alt={post.user.name} className="w-10 h-10 rounded-full mr-3" />
                    <div>
                        <p className="font-bold text-brand-text">{post.user.name}</p>
                        <p className="text-xs text-brand-text-secondary">{post.createdAt}</p>
                    </div>
                    <div className="ml-auto">
                        <StarRating rating={post.rating} />
                    </div>
                </div>
                <p className="text-sm text-brand-text-secondary">{post.caption}</p>
            </div>
            {post.imageUrl && (
                <img src={post.imageUrl} alt="Foto do post" className="w-full h-auto max-h-80 object-cover" />
            )}
        </div>
    );
};

const BakeryFeedScreen: React.FC<BakeryFeedScreenProps> = ({ bakery, onBack }) => {
    const [feed, setFeed] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const data = await getBakeryFeed(bakery.id);
                setFeed(data);
            } catch (e) {
                console.error("Failed to fetch bakery feed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, [bakery.id]);

    return (
        <div className="flex flex-col h-full bg-brand-background">
            <header className="p-4 bg-white sticky top-0 z-10 text-center border-b border-gray-200/80">
                <button onClick={onBack} className="absolute top-1/2 -translate-y-1/2 left-4 text-brand-secondary">
                    <IconChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="font-bold text-lg text-brand-text">Feed da Comunidade</h1>
                    <p className="text-sm text-brand-text-secondary">{bakery.name}</p>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <p className="text-center text-brand-text-secondary">Carregando feed...</p>
                ) : feed.length > 0 ? (
                    feed.map(post => <FeedPostCard key={post.id} post={post} />)
                ) : (
                     <p className="text-center text-brand-text-secondary mt-12">Ainda não há posts para esta padaria. Seja o primeiro a avaliar!</p>
                )}
            </main>
        </div>
    );
};

export default BakeryFeedScreen;