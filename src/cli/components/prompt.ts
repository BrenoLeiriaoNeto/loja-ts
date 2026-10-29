import readline from 'node:readline/promises';
import { Layout } from './layout';

export interface MenuOption<T extends string> {
  id: T;
  label: string;
  icon: string;
}

export const Prompt = {
  select<T extends string>(
    title: string,
    options: MenuOption<T>[],
    customHeader?: () => void,
  ): Promise<T> {
    return new Promise((resolve) => {
      let selectedIndex = 0;

      const render = (): void => {
        console.clear();

        if (customHeader) {
          customHeader();
        } else {
          Layout.showHeader(title);
        }

        console.log('📌 \x1b[1mEscolha uma opção:\x1b[0m');
        console.log(
          '   \x1b[2m(Setas ↑/↓ para navegar, Enter para confirmar ou digite o número)\x1b[0m\n',
        );

        options.forEach((item, index) => {
          const isExit = item.id === 'back' || item.id === 'exit';
          const shortcut = isExit ? 0 : index + 1;
          const isSelected = index === selectedIndex;

          if (isSelected) {
            console.log(
              `   \x1b[36m\x1b[1m➔  [${shortcut}] ${item.icon} ${item.label.padEnd(30)} ◄\x1b[0m`,
            );
          } else {
            console.log(`      \x1b[2m[${shortcut}] ${item.icon} ${item.label}\x1b[0m`);
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
          selectedIndex = (selectedIndex - 1 + options.length) % options.length;
          render();
          return;
        }

        if (key === '\u001b[B') {
          selectedIndex = (selectedIndex + 1) % options.length;
          render();
          return;
        }

        if (key === '\r' || key === '\n') {
          cleanup();
          const selected = options[selectedIndex];
          resolve(selected ? selected.id : options[0]!.id);
          return;
        }

        const parsedNum = parseInt(key, 10);
        if (!isNaN(parsedNum)) {
          if (parsedNum >= 1 && parsedNum <= options.length) {
            selectedIndex = parsedNum - 1;
            render();
          } else if (parsedNum === 0) {
            selectedIndex = options.length - 1;
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
  },

  async text(question: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await rl.question(`\x1b[33m\x1b[1m? \x1b[0m${question}: `);
    rl.close();
    return answer.trim();
  },

  pressEnterToContinue(): Promise<void> {
    return new Promise((resolve) => {
      console.log('\n\x1b[2mPressione ENTER para continuar...\x1b[0m');

      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
      }

      const onData = (): void => {
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
          process.stdin.pause();
        }
        process.stdin.removeListener('data', onData);
        resolve();
      };

      process.stdin.once('data', onData);
    });
  },
};
