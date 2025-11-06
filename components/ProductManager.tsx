import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI, Type } from "@google/generative-ai";
import type { User, Product } from '../types';
// Fix: Removed getAIMarketingSuggestions as it's not suitable for this component's needs.
import { getBakeryProducts, addProduct, updateProduct, removeProduct } from '../services/api';
import { IconPlus, IconEdit, IconTrash, IconSparkles, IconFlame } from './StatIcons';
import ImageUpload from './ImageUpload';

interface ProductManagerProps {
  user: User;
}

interface ProductSuggestion {
    name: string;
    description: string;
    price: number;
}

const ProductFormModal: React.FC<{
    product: Partial<Product> | null;
    onSave: (product: Omit<Product, 'id'> | Product) => void;
    onClose: () => void;
    user: User;
}> = ({ product, onSave, onClose, user }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        price: product?.price || 0,
        imageUrl: product?.imageUrl || '',
        popularity: product?.popularity || 'low',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
    };

    const handleImageUploaded = (path: string, publicUrl: string) => {
        setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (product && 'id' in product) {
             onSave({ ...product, ...formData });
        } else {
            onSave(formData as Omit<Product, 'id'>);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold text-brand-text mb-4">{product?.id ? 'Editar Produto' : 'Adicionar Produto'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" placeholder="Nome do Produto" value={formData.name} onChange={handleChange} required />
                    <input type="number" name="price" placeholder="Preço (R$)" value={formData.price} onChange={handleChange} required step="0.01" />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Foto do Produto
                        </label>
                        <ImageUpload
                            onImageUploaded={handleImageUploaded}
                            bucketName="product-images"
                            existingImage={formData.imageUrl}
                            uploadPath={`bakery-${user.id}`}
                            maxSizeInMB={25}
                            disabled={false}
                        />
                        {!formData.imageUrl && (
                            <p className="text-xs text-gray-500 mt-1">
                                Adicione uma foto para tornar seu produto mais atrativo
                            </p>
                        )}
                    </div>
                    <select name="popularity" value={formData.popularity} onChange={handleChange}>
                        <option value="low">Popularidade Baixa</option>
                        <option value="medium">Popularidade Média</option>
                        <option value="high">Popularidade Alta</option>
                    </select>
                    <div className="flex gap-3 !mt-6">
                        <button type="button" onClick={onClose} className="secondary w-full !bg-gray-200 !text-gray-700">Cancelar</button>
                        <button type="submit" className="primary w-full">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const SuggestionsModal: React.FC<{
    suggestions: ProductSuggestion[];
    onAdd: (suggestion: ProductSuggestion) => void;
    onClose: () => void;
}> = ({ suggestions, onAdd, onClose }) => {
    return (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-brand-text">Sugestões da IA ✨</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✖</button>
                </div>
                <p className="text-sm text-brand-text-secondary mb-4">Analisamos seu cardápio e criamos estas sugestões para você. Adicione com um clique!</p>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {suggestions.map((s, i) => (
                        <div key={i} className="bg-brand-background p-4 rounded-xl">
                            <h3 className="font-bold text-brand-text">{s.name}</h3>
                            <p className="text-sm text-brand-text-secondary my-1">{s.description}</p>
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-semibold text-brand-secondary">Preço Sugerido: R$ {s.price.toFixed(2)}</span>
                                <button onClick={() => onAdd(s)} className="primary !py-2 !px-4 text-sm">Adicionar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const ProductManager: React.FC<ProductManagerProps> = ({ user }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [aiError, setAiError] = useState('');

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getBakeryProducts(user.id);
            setProducts(data);
        } catch (e) {
            console.error("Failed to fetch products", e);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSaveProduct = async (productData: Omit<Product, 'id'> | Product) => {
        try {
            if ('id' in productData) {
                await updateProduct(user.id, productData);
            } else {
                await addProduct(user.id, productData);
            }
            setShowForm(false);
            setEditingProduct(null);
            fetchProducts(); // Refresh list
        } catch (e) {
            console.error("Failed to save product", e);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (window.confirm("Tem certeza que deseja remover este produto?")) {
            try {
                await removeProduct(user.id, productId);
                fetchProducts(); // Refresh list
            } catch (e) {
                console.error("Failed to remove product", e);
            }
        }
    };
    
    // Fix: Replaced incorrect API call with a direct Gemini call tailored for product suggestions.
    const handleGetSuggestions = async () => {
        setLoadingSuggestions(true);
        setAiError('');
        const API_KEY = import.meta.env.VITE_API_KEY;

        if (!API_KEY) {
            // Fallback for when API key is not available
            setSuggestions([
                { name: "Croissant de Chocolate", description: "Um clássico francês com um recheio delicioso de chocolate.", price: 7.50 },
                { name: "Pão Australiano", description: "Pão escuro e adocicado, perfeito para sanduíches especiais.", price: 12.00 }
            ]);
            setShowSuggestions(true);
            setLoadingSuggestions(false);
            return;
        }

        try {
            const ai = new GoogleGenerativeAI({ apiKey: API_KEY });
            const productList = products.map(p => p.name).join(', ');
            const prompt = `You are a product development expert for a bakery subscription app. Based on this list of existing products (${productList}), suggest two new, creative products that would complement the current offerings. For each, provide a short, enticing 'description', a suggested 'price' (as a number), and a 'name'. Return the response as a JSON array of objects.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                description: { type: Type.STRING },
                                price: { type: Type.NUMBER },
                            },
                            required: ['name', 'description', 'price'],
                        },
                    },
                },
            });

            const suggestionsJson = JSON.parse(response.text);
            setSuggestions(suggestionsJson);
            setShowSuggestions(true);
        } catch (error: any) {
            console.error("Error getting AI suggestions:", error);
            setAiError(error.message || "Não foi possível gerar sugestões. Tente novamente.");
        } finally {
            setLoadingSuggestions(false);
        }
    };
    
    const handleAddSuggestion = async (suggestion: ProductSuggestion) => {
        await handleSaveProduct({
            ...suggestion,
            imageUrl: 'https://i.imgur.com/Kz8V2kG.png', // Default image
            popularity: 'low',
        });
        setShowSuggestions(false);
    };


    if (loading) {
        return <div className="text-center p-8 text-brand-text-secondary">Carregando produtos...</div>;
    }

    return (
        <div className="p-4">
            {showForm && <ProductFormModal product={editingProduct} user={user} onClose={() => { setShowForm(false); setEditingProduct(null); }} onSave={handleSaveProduct} />}
            {showSuggestions && <SuggestionsModal suggestions={suggestions} onAdd={handleAddSuggestion} onClose={() => setShowSuggestions(false)} />}
            
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-brand-text">Seus Produtos</h2>
                <button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="primary flex items-center gap-2 !py-2 !px-4">
                    <IconPlus className="w-5 h-5" /> Adicionar
                </button>
            </div>
            
            <div className="mb-6">
                <button 
                    onClick={handleGetSuggestions} 
                    disabled={loadingSuggestions}
                    className="w-full bg-brand-secondary text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity shadow flex items-center justify-center gap-2"
                >
                    {loadingSuggestions ? 'Gerando ideias...' : (
                        <>
                            <IconSparkles className="w-5 h-5"/> Gerar Sugestões com IA
                        </>
                    )}
                </button>
                {aiError && <p className="text-red-500 text-xs text-center mt-2">{aiError}</p>}
            </div>

            <div className="space-y-3">
                {products.map(product => (
                    <div key={product.id} className="bg-white p-3 rounded-xl flex items-center gap-4 shadow-sm border border-gray-200/50">
                        <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1">
                            <p className="font-semibold text-brand-text">{product.name}</p>
                            <p className="text-sm font-semibold text-brand-secondary">R$ {product.price.toFixed(2)}</p>
                            {product.popularity === 'high' && (
                                <div className="flex items-center text-xs text-orange-600 font-semibold mt-1">
                                    <IconFlame className="w-3.5 h-3.5 mr-1" /> Popular
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => { setEditingProduct(product); setShowForm(true); }} className="p-2 text-brand-text-secondary hover:text-brand-secondary"><IconEdit className="w-5 h-5"/></button>
                             <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-400 hover:text-red-600"><IconTrash className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductManager;