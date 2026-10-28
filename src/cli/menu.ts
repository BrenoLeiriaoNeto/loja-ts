import { Views } from './views';

type MenuIds = 'users' | 'products' | 'orders' | 'financial' | 'exit';

export interface MenuItem {
  id: MenuIds;
  label: string;
  icon: string;
}

export const MAIN_MENU_ITEMS: MenuItem[] = [
  { id: 'users', label: 'Gestão de Usuários', icon: '👥' },
  { id: 'products', label: 'Catálogo de Produtos', icon: '📦' },
  { id: 'orders', label: 'Sistema de Pedidos', icon: '🛒' },
  { id: 'financial', label: 'Controle Financeiro', icon: '📊' },
  { id: 'exit', label: 'Sair do Sistema', icon: '❌' },
];

export function promptMainMenu(): Promise<MenuItem['id']> {
  return new Promise((resolve) => {
    let selectedIndex = 0;
    const items = MAIN_MENU_ITEMS;

    const render = (): void => {
      Views.showWelcomeScreen();

      console.log('👋 \x1b[1m\x1b[36mSeja bem-vindo ao Loja-TS!\x1b[0m');
      console.log('   Sistema de gestão comercial construído em TypeScript 7 puro sobre o Bun.\n');
      console.log('📌 \x1b[1mEscolha uma opção para começar:\x1b[0m');
      console.log(
        '   \x1b[2m(Use as setas ↑ / ↓ para navegar e Enter para confirmar, ou digite o número 1-4/0)\x1b[0m\n',
      );

      items.forEach((item, index) => {
        const isExit = item.id === 'exit';
        const numShortcut = isExit ? 0 : index + 1;
        const isSelected = index === selectedIndex;

        if (isSelected) {
          console.log(
            `   \x1b[36m\x1b[1m➔  [${numShortcut}] ${item.icon} ${item.label.padEnd(25)} ◄\x1b[0m`,
          );
        } else {
          console.log(`      \x1b[2m[${numShortcut}] ${item.icon} ${item.label}\x1b[0m`);
        }
      });
      console.log('');
    };

    const onData = (data: Buffer | string): void => {
      const key = data.toString();

      if (key === '\u0003') {
        cleanup();
        process.exit(0);
      }

      if (key === '\u001b[A') {
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        render();
        return;
      }

      if (key === '\u001b[B') {
        selectedIndex = (selectedIndex + 1) % items.length;
        render();
        return;
      }

      if (key === '\r' || key === '\n') {
        cleanup();
        const selected = items[selectedIndex];
        resolve(selected ? selected.id : 'exit');
        return;
      }

      const parsedNum = parseInt(key, 10);
      if (!isNaN(parsedNum)) {
        if (parsedNum >= 1 && parsedNum <= 4) {
          selectedIndex = parsedNum - 1;
          render();
        } else if (parsedNum === 0) {
          selectedIndex = items.length - 1;
          render();
        }
      }
    };

    const cleanup = (): void => {
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
        process.stdin.pause();
      }
      process.stdin.removeListener('data', onData);
    };

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', onData);
    }

    render();
  });
}
