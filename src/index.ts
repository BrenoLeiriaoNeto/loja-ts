import { promptMainMenu } from './cli/menu';

function pressEnterToContinue(): Promise<void> {
  return new Promise((resolve) => {
    console.log('\n\x1b[2mPressione ENTER para voltar ao menu principal...\x1b[0m');

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
}

async function main(): Promise<void> {
  let running = true;

  while (running) {
    const selectedAction = await promptMainMenu();

    switch (selectedAction) {
      case 'users':
        console.clear();
        console.log('Voce selecionou usuários');
        await pressEnterToContinue();
        break;

      case 'products':
        console.clear();
        console.log('Voce selecionou produtos');
        await pressEnterToContinue();
        break;

      case 'orders':
        console.clear();
        console.log('Voce selecionou pedidos');
        await pressEnterToContinue();
        break;

      case 'financial':
        console.clear();
        console.log('Voce selecionou financeiro');
        await pressEnterToContinue();
        break;

      case 'exit':
        console.clear();
        console.log('\n👋 \x1b[36m\x1b[1mObrigado por utilizar o Loja-TS! Até logo.\x1b[0m\n');
        running = false;
        break;
    }
  }

  process.exit(0);
}

void main();
