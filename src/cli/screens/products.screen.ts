import { ProductRepository } from '@/modules/products/product.repository';
import { Layout } from '../components/layout';
import { Prompt, type MenuOption } from '../components/prompt';

type ProductAction = 'list' | 'create' | 'find_name' | 'restock' | 'back';

const PRODUCT_MENU_OPTIONS: MenuOption<ProductAction>[] = [
  { id: 'list', label: 'Listar Catálogo Completo', icon: '📋' },
  { id: 'create', label: 'Cadastrar Novo Produto', icon: '➕' },
  { id: 'find_name', label: 'Buscar Produto por Nome', icon: '🔍' },
  { id: 'restock', label: 'Re-estocar Produto', icon: '📦' },
  { id: 'back', label: 'Voltar ao Menu Principal', icon: '⬅️' },
];

export async function renderProductsScreen(): Promise<void> {
  let inScreen = true;

  while (inScreen) {
    const action = await Prompt.select<ProductAction>(
      '🛍️ CATÁLOGO DE PRODUTOS',
      PRODUCT_MENU_OPTIONS,
    );

    switch (action) {
      case 'list': {
        console.clear();
        Layout.showHeader('📋 CATÁLOGO COMPLETO');

        const products = ProductRepository.listAll();
        if (products.length === 0) {
          console.log('\x1b[33mNenhum produto cadastrado no catálogo.\x1b[0m');
        } else {
          console.table(
            products.map((p) => ({
              ID: p.id,
              Nome: p.name,
              Preço: `R$ ${p.price.toFixed(2)}`,
              Estoque: p.stockQuantity,
              Status: p.status,
            })),
          );
        }

        await Prompt.pressEnterToContinue();
        break;
      }

      case 'create': {
        console.clear();
        Layout.showHeader('➕ CADASTRO DE PRODUTO');

        const name = await Prompt.text('Nome do produto');
        const description = await Prompt.text('Descrição detalhada');
        const priceStr = await Prompt.text('Preço de venda (use ponto para centavos. Ex: 15.90)');
        const stockStr = await Prompt.text('Quantidade inicial em estoque');

        const price = parseFloat(priceStr);
        const stockQuantity = parseInt(stockStr, 10);

        const status = stockQuantity > 0 ? 'available' : 'out_of_stock';

        const result = ProductRepository.create({
          name,
          description,
          price,
          stockQuantity,
          status,
        });

        if (!result.success) {
          Layout.showError('Cadastrar Produto', result.error);
        } else {
          Layout.showSuccess(
            'Produto Adicionado!',
            `O produto '${result.data.name}' foi registrado com o ID [${result.data.id}].`,
          );
        }

        await Prompt.pressEnterToContinue();
        break;
      }

      case 'find_name': {
        console.clear();
        Layout.showHeader('🔍 BUSCAR PRODUTO POR NOME');

        const searchName = await Prompt.text('Informe o nome do produto (ou parte dele)');
        const result = ProductRepository.findByName(searchName);

        if (!result.success) {
          Layout.showError('Busca de Produto', result.error);
        } else {
          console.log('\n\x1b[36m\x1b[1m--- Produtos Encontrados --- \x1b[0m');
          console.table(
            result.data.map((p) => ({
              ID: p.id,
              Nome: p.name,
              Preço: `R$ ${p.price.toFixed(2)}`,
              Estoque: p.stockQuantity,
              Status: p.status,
            })),
          );
        }

        await Prompt.pressEnterToContinue();
        break;
      }

      case 'restock': {
        console.clear();
        Layout.showHeader('📦 RE-ESTOCAR PRODUTO');

        const products = ProductRepository.listAll();
        if (products.length === 0) {
          console.log('\x1b[31mO catálogo está vazio. Não há produtos para re-estocar.\x1b[0m');
          await Prompt.pressEnterToContinue();
          break;
        }

        console.log('\x1b[36mSelecione o produto para adicionar estoque:\x1b[0m');
        products.forEach((p, idx) => {
          console.log(`   [${idx + 1}] ${p.name.padEnd(25)} (Atual: ${p.stockQuantity} unid.)`);
        });

        const prodIndexStr = await Prompt.text('\nDigite o número do produto desejado');
        const prodIndex = parseInt(prodIndexStr, 10) - 1;

        const selectedProduct = products[prodIndex];

        if (!selectedProduct) {
          console.log('\x1b[31mProduto inválido!\x1b[0m');
          await Prompt.pressEnterToContinue();
          break;
        }

        const qtyStr = await Prompt.text(
          `Quantas unidades deseja adicionar a '${selectedProduct.name}'?`,
        );
        const qtyToAdd = parseInt(qtyStr, 10);

        const restockResult = ProductRepository.restock(selectedProduct.id, qtyToAdd);

        if (!restockResult.success) {
          Layout.showError('Re-estocar Produto', restockResult.error);
        } else {
          Layout.showSuccess(
            'Estoque Atualizado!',
            `'${restockResult.data.name}' recebeu +${qtyToAdd} unidades. Novo estoque: ${restockResult.data.stockQuantity}.`,
          );
        }

        await Prompt.pressEnterToContinue();
        break;
      }

      case 'back':
        inScreen = false;
        break;
    }
  }
}
