import { promptMainMenu } from './components/menu';
import { renderUsersScreen } from './screens/user.screen';

export async function startCLI(): Promise<void> {
  let running = true;

  while (running) {
    const selectedOption = await promptMainMenu();
    switch (selectedOption) {
      case 'users':
        await renderUsersScreen();
        break;

      case 'products':
        // await renderProductsScreen();
        break;

      case 'orders':
        // await renderOrdersScreen();
        break;

      case 'financial':
        // await renderFinancialScreen();
        break;

      case 'exit':
        console.clear();
        console.log('\n👋 \x1b[36m\x1b[1mSessão encerrada com sucesso! Até logo.\x1b[0m\n');
        running = false;
        break;
    }
  }

  process.exit(0);
}
