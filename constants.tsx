
import React from 'react';
import { IconHome, IconReceipt, IconUser, IconLayoutDashboard, IconToolsKitchen2, IconClipboardList, IconMotorbike } from './components/StatIcons'; // Repurposed StatIcons.tsx

export const CLIENT_NAV_ITEMS = [
  { id: 'home', label: 'Início', icon: <IconHome /> },
  { id: 'subscriptions', label: 'Assinaturas', icon: <IconReceipt /> },
  { id: 'profile', label: 'Perfil', icon: <IconUser /> },
];

export const BAKERY_NAV_ITEMS = [
  { id: 'dashboard', label: 'Painel', icon: <IconLayoutDashboard /> },
  { id: 'products', label: 'Produtos', icon: <IconToolsKitchen2 /> },
  { id: 'deliveries', label: 'Entregas', icon: <IconClipboardList /> },
  { id: 'profile', label: 'Perfil', icon: <IconUser /> },
];

export const DELIVERY_NAV_ITEMS = [
  { id: 'deliveries', label: 'Entregas', icon: <IconMotorbike /> },
  { id: 'history', label: 'Histórico', icon: <IconReceipt /> },
  { id: 'profile', label: 'Perfil', icon: <IconUser /> },
];