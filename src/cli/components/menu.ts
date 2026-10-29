import { Banner } from './banner';
import { Prompt, type MenuOption } from './prompt';

type MenuIds = 'users' | 'products' | 'orders' | 'financial' | 'exit';

export const MAIN_MENU_ITEMS: MenuOption<MenuIds>[] = [
  { id: 'users', label: 'Gestão de Usuários', icon: '👥' },
  { id: 'products', label: 'Catálogo de Produtos', icon: '📦' },
  { id: 'orders', label: 'Sistema de Pedidos', icon: '🛒' },
  { id: 'financial', label: 'Controle Financeiro', icon: '📊' },
  { id: 'exit', label: 'Sair do Sistema', icon: '❌' },
];

export function promptMainMenu(): Promise<MenuIds> {
  return Prompt.select<MenuIds>('🏠 MENU PRINCIPAL', MAIN_MENU_ITEMS, () => {
    Banner();
    console.log('👋 \x1b[1m\x1b[36mSeja bem-vindo ao Loja-TS!\x1b[0m');
    console.log('   Sistema de gestão comercial construído em TypeScript 7 puro sobre o Bun.\n');
  });
}
