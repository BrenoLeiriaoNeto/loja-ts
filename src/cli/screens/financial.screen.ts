import { FinancialRepository } from '@/modules/financial/financial.repository';
import { Layout } from '../components/layout';
import { Prompt, type MenuOption } from '../components/prompt';
import { UserRepository } from '@/modules/users/user.repository';
import { Database } from '@/storage/memory-db';

type FinancialAction = 'list' | 'close_shift' | 'find_date' | 'back';

const FINANCIAL_MENU_OPTIONS: MenuOption<FinancialAction>[] = [
  { id: 'list', label: 'Listar Todos os Relatórios', icon: '📊' },
  { id: 'close_shift', label: 'Gerar Fechamento de Turno (Novo Relatório)', icon: '📝' },
  { id: 'find_date', label: 'Buscar Relatórios por Data', icon: '📅' },
  { id: 'back', label: 'Voltar ao Menu Principal', icon: '⬅️' },
];

export async function renderFinancialScreen(): Promise<void> {
  let inScreen = true;

  while (inScreen) {
    const action = await Prompt.select<FinancialAction>(
      '📊 CONTROLE FINANCEIRO',
      FINANCIAL_MENU_OPTIONS,
    );

    switch (action) {
      case 'list': {
        console.clear();
        Layout.showHeader('📊 RELATÓRIOS FINANCEIROS');
        renderFinancialReports(FinancialRepository.listAll());
        await Prompt.pressEnterToContinue();
        break;
      }

      case 'close_shift': {
        console.clear();
        Layout.showHeader('📝 FECHAMENTO DE TURNO / CAIXA');

        const users = UserRepository.listAll();
        if (users.length === 0) {
          console.log('\x1b[31mNenhum operador cadastrado no sistema.\x1b[0m');
          await Prompt.pressEnterToContinue();
          break;
        }

        console.log('\x1b[36mSelecione o Operador/Responsável pelo Fechamento:\x1b[0m');
        users.forEach((u, i) => console.log(`   [${i + 1}] ${u.name}`));

        const opStr = await Prompt.text('\nDigite o número do responsável');
        const opIdx = parseInt(opStr, 10) - 1;
        const responsibleUser = users[opIdx];

        if (!responsibleUser) {
          console.log('\x1b[31mOperador inválido!\x1b[0m');
          await Prompt.pressEnterToContinue();
          break;
        }

        const userOrders = Array.from(Database.orders.values()).filter(
          (o) => o.userId === responsibleUser.id,
        );

        if (userOrders.length === 0) {
          console.log(
            `\x1b[33mO operador '${responsibleUser.name}' não possui pedidos registrados para fechar o turno.\x1b[0m`,
          );
          await Prompt.pressEnterToContinue();
          break;
        }

        const totalRevenue = userOrders.reduce((sum, o) => sum + o.totalPrice, 0);

        const createResult = FinancialRepository.create({
          orders: userOrders,
          totalRevenue,
          dateOfReport: new Date(),
          responsiblePerson: responsibleUser.name,
        });

        if (!createResult.success) {
          Layout.showError('Gerar Fechamento', createResult.error);
        } else {
          Layout.showSuccess(
            'Fechamento de Turno Concluído!',
            `Relatório [${createResult.data.id}] gerado com ${userOrders.length} pedido(s). Receita: R$ ${totalRevenue.toFixed(2)}.`,
          );
        }

        await Prompt.pressEnterToContinue();
        break;
      }

      case 'find_date': {
        console.clear();
        Layout.showHeader('📅 BUSCAR RELATÓRIOS POR DATA');
        const dateStr = await Prompt.text('Informe a data (ex: AAAA-MM-DD ou hoje)');

        const searchDate = dateStr.toLowerCase() === 'hoje' ? new Date() : new Date(dateStr);
        const result = FinancialRepository.findByDate(searchDate);

        if (!result.success) {
          Layout.showError('Busca por Data', result.error);
        } else {
          renderFinancialReports(result.data);
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

function renderFinancialReports(reports: ReturnType<typeof FinancialRepository.listAll>): void {
  if (reports.length === 0) {
    console.log('\x1b[33mNenhum relatório financeiro emitido.\x1b[0m');
    return;
  }

  const formatted = reports.map((r) => ({
    ID: r.id,
    'Responśavel / Turno': r.responsiblePerson,
    'Qtd Pedidos': r.orders.length,
    'Receita Total': `R$ ${r.totalRevenue.toFixed(2)}`,
    'Data Emissão': r.dateOfReport.toLocaleDateString('pt-BR'),
  }));

  console.table(formatted);
}
