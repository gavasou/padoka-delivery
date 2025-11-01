import { supabase } from './supabase';
import type { User, UserRole } from '../types';

// Autenticação
export const login = async (email: string, password: string): Promise<User | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error || !data.user) {
        console.error('Login error:', error);
        return null;
    }

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

    if (profileError || !profile) {
        console.error('Profile fetch error:', profileError);
        return null;
    }

    return {
        id: profile.id,
        name: profile.full_name,
        email: data.user.email!,
        role: profile.role as UserRole,
        address: profile.address,
        phone: profile.phone,
        vehicle: profile.vehicle,
        profileImageUrl: profile.profile_image_url,
        status: profile.status,
        gamification: profile.gamification_points !== undefined ? {
            level: profile.gamification_level || 'Iniciante',
            points: profile.gamification_points,
            nextLevelPoints: 1000
        } : undefined,
        deliveryStats: profile.delivery_month_count !== undefined ? {
            deliveriesMonth: profile.delivery_month_count,
            averageRating: profile.delivery_avg_rating,
            onTimeRate: profile.delivery_ontime_rate,
            level: profile.gamification_level || 'Iniciante'
        } : undefined
    };
};

export const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: UserRole, 
    additionalData?: { phone?: string; address?: string; vehicle?: string }
): Promise<User> => {
    // Criar usuário no auth
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
                role: role
            }
        }
    });

    if (error || !data.user) {
        throw new Error(error?.message || 'Erro ao criar usuário');
    }

    // Criar perfil via edge function
    const { data: profileData, error: profileError } = await supabase.functions.invoke('create-user-profile', {
        body: {
            userId: data.user.id,
            fullName: name,
            role: role,
            phone: additionalData?.phone,
            address: additionalData?.address,
            vehicle: additionalData?.vehicle
        }
    });

    if (profileError) {
        throw new Error('Erro ao criar perfil');
    }

    return {
        id: data.user.id,
        name: name,
        email: email,
        role: role,
        status: role === 'client' ? 'approved' : 'pending',
        ...additionalData
    };
};

export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    const { data: profile } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile) {
        return null;
    }

    return {
        id: profile.id,
        name: profile.full_name,
        email: user.email!,
        role: profile.role as UserRole,
        address: profile.address,
        phone: profile.phone,
        vehicle: profile.vehicle,
        profileImageUrl: profile.profile_image_url,
        status: profile.status,
        gamification: profile.gamification_points !== undefined ? {
            level: profile.gamification_level || 'Iniciante',
            points: profile.gamification_points,
            nextLevelPoints: 1000
        } : undefined,
        deliveryStats: profile.delivery_month_count !== undefined ? {
            deliveriesMonth: profile.delivery_month_count,
            averageRating: profile.delivery_avg_rating,
            onTimeRate: profile.delivery_ontime_rate,
            level: profile.gamification_level || 'Iniciante'
        } : undefined
    };
};

export const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
};
