import { Usuario } from '@/types';

export type Perfil = Usuario['perfil'];

export const PERFIL_LABEL: Record<Perfil, string> = {
  cliente: 'Cliente',
  vendedor: 'Vendedor',
  gerente: 'Gerente',
};

/** Vendedor e gerente têm acesso à área /admin (cada um com suas abas). */
export const isEquipe = (perfil?: Perfil | null) => perfil === 'vendedor' || perfil === 'gerente';
