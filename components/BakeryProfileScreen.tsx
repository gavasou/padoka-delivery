
import React, { useState, useEffect } from 'react';
import type { User, Bakery } from '../types';
import { getBakeryById, updateBakeryProfile } from '../services/api';
import { IconEdit, IconShieldCheck, IconLogout, IconChevronRight } from './StatIcons';
import ImageUpload from './ImageUpload';

interface BakeryProfileScreenProps {
  user: User;
  onLogout: () => void;
}

const TermsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
            <h2 className="text-xl font-bold text-brand-text text-center mb-4">Termos de Uso e Acordo com a Padaria</h2>
            <div className="text-sm text-brand-text-secondary space-y-3 overflow-y-auto pr-2">
                <p><strong>1. Objeto:</strong> A Padoka oferece uma plataforma para gestão de assinaturas, exposição de perfil e feed social, conectando a Padaria aos seus clientes.</p>
                <p><strong>2. Obrigações da Padaria:</strong> Fornecer informações verídicas, garantir a qualidade e entrega dos produtos, e cumprir a legislação vigente.</p>
                <p><strong>3. Cobrança e Comissão:</strong> A Padoka cobrará uma comissão de <strong>10% sobre o valor de cada pedido</strong> (produtos + taxas) recebido através do aplicativo. O repasse do valor restante será feito automaticamente para a Padaria em ciclos semanais.</p>
                <p><strong>4. Limitação de Responsabilidade:</strong> A Padoka não se responsabiliza pela qualidade dos produtos, atendimento da padaria ou satisfação do cliente final, atuando apenas como intermediária tecnológica.</p>
                <p><strong>5. Cancelamento:</strong> A Padaria pode cancelar o uso da plataforma com aviso prévio de 30 dias. A Padoka pode suspender contas em caso de fraude ou descumprimento destes termos.</p>
                <p>Ao continuar usando a plataforma, você concorda com todos os termos aqui descritos.</p>
            </div>
            <button onClick={onClose} className="primary w-full mt-6">Entendi</button>
        </div>
    </div>
);


const BakeryProfileScreen: React.FC<BakeryProfileScreenProps> = ({ user, onLogout }) => {
    const [owner, setOwner] = useState<User>(user);
    const [bakery, setBakery] = useState<Partial<Bakery>>({});
    const [loading, setLoading] = useState(true);
    const [isEditingOwner, setIsEditingOwner] = useState(false);
    const [isEditingBakery, setIsEditingBakery] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    useEffect(() => {
        const fetchBakery = async () => {
            const bakeryData = await getBakeryById(user.id); // Assuming ownerId is user.id for simplicity
            if(bakeryData) setBakery(bakeryData);
            setLoading(false);
        }
        fetchBakery();
    }, [user.id]);

    const handleSave = async () => {
        await updateBakeryProfile(user.id, owner, bakery);
        setIsEditingOwner(false);
        setIsEditingBakery(false);
        alert("Perfil salvo com sucesso!");
    };

    if (loading) return <div className="p-4 text-center">Carregando perfil...</div>

    return (
        <div className="p-4 space-y-6">
            {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
            <h2 className="text-xl font-bold text-brand-text">Gerenciar Perfil</h2>

            {/* Owner Profile Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-brand-text">Seus Dados</h3>
                    <button onClick={() => setIsEditingOwner(!isEditingOwner)} className="text-sm font-semibold text-brand-secondary flex items-center gap-1">
                        <IconEdit className="w-4 h-4" /> {isEditingOwner ? 'Cancelar' : 'Editar'}
                    </button>
                </div>
                {isEditingOwner ? (
                    <div className="space-y-3">
                        <input type="text" placeholder="Seu Nome" value={owner.name} onChange={e => setOwner({...owner, name: e.target.value })} />
                        <input type="email" placeholder="Seu Email" value={owner.email} onChange={e => setOwner({...owner, email: e.target.value })} />
                        <input type="tel" placeholder="Seu Telefone" value={owner.phone} onChange={e => setOwner({...owner, phone: e.target.value })} />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Foto do Proprietário
                            </label>
                            <ImageUpload
                                onImageUploaded={(path, publicUrl) => setOwner({...owner, profileImageUrl: publicUrl})}
                                bucketName="avatars"
                                existingImage={owner.profileImageUrl}
                                uploadPath={`user-${owner.id}`}
                                maxSizeInMB={25}
                                disabled={false}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <img src={owner.profileImageUrl} alt="Foto do Dono" className="w-16 h-16 rounded-full" />
                        <div>
                            <p className="font-semibold">{owner.name}</p>
                            <p className="text-sm text-brand-text-secondary">{owner.email}</p>
                            <p className="text-sm text-brand-text-secondary">{owner.phone}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Bakery Profile Section */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/50">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-brand-text">Dados da Padaria</h3>
                    <button onClick={() => setIsEditingBakery(!isEditingBakery)} className="text-sm font-semibold text-brand-secondary flex items-center gap-1">
                         <IconEdit className="w-4 h-4" /> {isEditingBakery ? 'Cancelar' : 'Editar'}
                    </button>
                </div>
                 {isEditingBakery ? (
                    <div className="space-y-3">
                        <input type="text" placeholder="Nome da Padaria" value={bakery.name} onChange={e => setBakery({...bakery, name: e.target.value })} />
                        <input type="text" placeholder="Endereço" value={bakery.address} onChange={e => setBakery({...bakery, address: e.target.value })} />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Logo da Padaria
                            </label>
                            <ImageUpload
                                onImageUploaded={(path, publicUrl) => setBakery({...bakery, logoUrl: publicUrl})}
                                bucketName="bakery-images"
                                existingImage={bakery.logoUrl}
                                uploadPath={`bakery-${bakery.id}`}
                                maxSizeInMB={25}
                                disabled={false}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <img src={bakery.logoUrl} alt="Logo da Padaria" className="w-16 h-16 rounded-xl" />
                        <div>
                            <p className="font-semibold">{bakery.name}</p>
                            <p className="text-sm text-brand-text-secondary">{bakery.address}</p>
                        </div>
                    </div>
                 )}
            </div>
            
            {(isEditingOwner || isEditingBakery) && (
                <button onClick={handleSave} className="primary w-full">Salvar Alterações</button>
            )}
            
             <button onClick={() => setShowTerms(true)} className="w-full bg-white text-brand-secondary font-bold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm border border-gray-200/80 flex items-center justify-center gap-2">
                <IconShieldCheck className="w-5 h-5"/> Ver Termos de Serviço
            </button>

            {/* Botão de Logout */}
            <button 
                onClick={onLogout} 
                className="w-full bg-red-50 text-red-600 font-bold py-3 px-4 rounded-xl hover:bg-red-100 transition-colors shadow-sm border border-red-200/50 flex items-center justify-center gap-2"
            >
                <IconLogout className="w-5 h-5" /> Sair
            </button>

        </div>
    );
};

export default BakeryProfileScreen;