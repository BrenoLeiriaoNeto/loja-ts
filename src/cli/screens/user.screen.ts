import { UserRepository } from '@/modules/users/user.repository';
import { Layout } from '../components/layout';
import { Prompt, type MenuOption } from '../components/prompt';

type UserAction = 'list' | 'create' | 'find' | 'back';

const USER_MENU_OPTIONS: MenuOption<UserAction>[] = [
  { id: 'list', label: 'Listar Todos os Usuários', icon: '📋' },
  { id: 'create', label: 'Cadastrar Novo Usuário', icon: '➕' },
  { id: 'find', label: 'Buscar Usuário por ID', icon: '🔍' },
  { id: 'back', label: 'Voltar ao Menu Principal', icon: '⬅️' },
];

export async function renderUsersScreen(): Promise<void> {
  let inScreen = true;

  while (inScreen) {
    const action = await Prompt.select<UserAction>('👥 GESTÃO DE USUÁRIOS', USER_MENU_OPTIONS);

    switch (action) {
      case 'list': {
        console.clear();
        Layout.showHeader('👥 LISTA DE USUÁRIOS');

        const users = UserRepository.listAll();
        if (users.length === 0) {
          console.log('\x1b[33mNenhum usuário cadastrado até o momento.\x1b[0m');
        } else {
          console.table(
            users.map((u) => ({
              ID: u.id,
              Nome: u.name,
              Email: u.email,
              'Criado em: ': u.createdAt.toLocaleTimeString(),
            })),
          );
        }
        await Prompt.pressEnterToContinue();
        break;
      }

      case 'create': {
        console.clear();
        Layout.showHeader('➕ CADASTRO DE USUÁRIO');

        const name = await Prompt.text('Nome completo do usuário');
        const email = await Prompt.text('E-mail corporativo/pessoal');

        const result = UserRepository.create({ name, email });

        if (!result.success) {
          Layout.showError('Cadastrar Usuário', result.error);
        } else {
          Layout.showSuccess(
            'Usuário Criado!',
            `O usuário '${result.data.name}' foi registrado na memória com o ID [${result.data.id}].`,
          );
        }

        await Prompt.pressEnterToContinue();
        break;
      }

      case 'find': {
        Layout.showHeader('🔍 BUSCAR USUÁRIO');

        const searchName = await Prompt.text('Informe o nome (ou parte dele) do Usuário');
        const result = UserRepository.findByName(searchName);

        if (!result.success) {
          Layout.showError('Busca de Usuário', result.error);
        } else {
          console.log('\n\x1b[36m\x1b[1m--- Dados do Usuário Encontrado --- \x1b[0m');
          console.table(
            result.data.map((u) => ({
              ID: u.id,
              Nome: u.name,
              Email: u.email,
              'Criado em: ': u.createdAt.toLocaleString(),
            })),
          );
        }

        await Prompt.pressEnterToContinue();
        break;
      }

      case 'back': {
        inScreen = false;
        break;
      }
    }
  }
}
