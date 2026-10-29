import { OrderRepository } from '@/modules/orders/order.repository';
import { Layout } from '../components/layout';
import { Prompt, type MenuOption } from '../components/prompt';
import { ProductRepository } from '@/modules/products/product.repository';
import { UserRepository } from '@/modules/users/user.repository';
import type { OrderItem } from '@/core/interfaces/order';
import { Database } from '@/storage/memory-db';

type OrderAction = 'list' | 'cart' | 'find_user' | 'back';

const ORDER_MENU_OPTIONS: MenuOption<OrderAction>[] = [
  { id: 'list', label: 'Listar Todos os Pedidos', icon: '📋' },
  { id: 'cart', label: 'Montar Novo Pedido (Carrinho Interativo)', icon: '🛒' },
  { id: 'find_user', label: 'Buscar Pedidos por Nome de Cliente', icon: '🔍' },
  { id: 'back', label: 'Voltar ao Menu Principal', icon: '⬅️' },
];

export async function renderOrdersScreen(): Promise<void> {
  let inScreen = true;

  while (inScreen) {
    const action = await Prompt.select<OrderAction>('🛒 SISTEMA DE PEDIDOS', ORDER_MENU_OPTIONS);

    switch (action) {
      case 'list': {
        console.clear();
        Layout.showHeader('📋 HISTÓRICO DE PEDIDOS');
        renderOrdersTable(OrderRepository.listAll());
        await Prompt.pressEnterToContinue();
        break;
      }

      case 'cart': {
        await handleInteractiveCart();
        break;
      }

      case 'find_user': {
        console.clear();
        Layout.showHeader('🔍 BUSCAR PEDIDOS POR CLIENTE');
        const searchName = await Prompt.text('Informe o nome do cliente/operador');
        const result = OrderRepository.findByUser(searchName);

        if (!result.success) {
          Layout.showError('Busca de Pedidos', result.error);
        } else {
          renderOrdersTable(result.data);
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

async function handleInteractiveCart(): Promise<void> {
  const products = ProductRepository.listAll();
  const users = UserRepository.listAll();

  if (products.length === 0 || users.length === 0) {
    console.clear();
    Layout.showHeader('🛒 NOVO PEDIDO');
    console.log(
      '\x1b[31mÉ necessário ter produtos e usuários cadastrados para abrir um carrinho.\x1b[0m',
    );
    await Prompt.pressEnterToContinue();
    return;
  }

  const cartItems: OrderItem[] = [];
  let buildingCart = true;

  while (buildingCart) {
    console.clear();
    Layout.showHeader('🛒 MONTAGEM DO CARRINHO DE COMPRAS');

    if (cartItems.length > 0) {
      console.log('\x1b[36m\x1b[1m--- Itens Atuais no Carrinho --- \x1b[0m');
      let currentTotal = 0;

      const formattedCart = cartItems.map((item, index) => {
        const prod = Database.products.get(item.productId);
        const subtotal = item.unitPrice * item.quantity;
        currentTotal += subtotal;

        return {
          Item: index + 1,
          Produto: prod ? prod.name : item.productId,
          Qtd: item.quantity,
          'Preço Un.': `R$ ${item.unitPrice.toFixed(2)}`,
          Subtotal: `R$ ${subtotal.toFixed(2)}`,
        };
      });

      console.table(formattedCart);
      console.log(
        `\x1b[32m\x1b[1mTOTAL ACUMULADO NO CARRINHO: R$ ${currentTotal.toFixed(2)}\x1b[0m\n`,
      );
    } else {
      console.log('\x1b[33mO carrinho está vazio.\x1b[0m\n');
    }

    type CartAction = 'add' | 'checkout' | 'cancel';
    const cartOptions: MenuOption<CartAction>[] = [
      { id: 'add', label: 'Adicionar Produto ao Carrinho', icon: '➕' },
      ...(cartItems.length > 0
        ? [{ id: 'checkout' as CartAction, label: 'Finalizar Pedido', icon: '✅' }]
        : []),
      { id: 'cancel', label: 'Cancelar e Voltar', icon: '❌' },
    ];

    const choice = await Prompt.select<CartAction>('AÇÕES DO CARRINHO', cartOptions);

    if (choice === 'add') {
      console.log('\x1b[36m\x1b[1mCatálogo de Produtos Disponíveis:\x1b[0m');
      products.forEach((p, idx) => {
        console.log(`   [${idx + 1}] ${p.name} - R$ ${p.price.toFixed(2)} (${p.description})`);
      });

      const prodIndexStr = await Prompt.text('\nDigite o número do produto desejado');
      const prodIndex = parseInt(prodIndexStr, 10) - 1;

      const selectedProduct = products[prodIndex];
      if (!selectedProduct) {
        console.log('\x1b[31mOpção de produto inválida!\x1b[0m');
        await Prompt.pressEnterToContinue();
        continue;
      }

      const qtyStr = await Prompt.text(`Quantidade para '${selectedProduct.name}'`);
      const qty = parseInt(qtyStr, 10);

      if (isNaN(qty) || qty <= 0) {
        console.log('\x1b[31mQuantidade inválida!\x1b[0m');
        await Prompt.pressEnterToContinue();
        continue;
      }

      cartItems.push({
        productId: selectedProduct.id,
        quantity: qty,
        unitPrice: selectedProduct.price,
      });
    } else if (choice === 'checkout') {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const totalToPay = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

      const createResult = OrderRepository.create({
        userId: randomUser?.id,
        items: cartItems,
        totalPrice: totalToPay,
        status: 'delivered',
      });

      if (!createResult.success) {
        Layout.showError('Finalizar Pedido', createResult.error);
      } else {
        Layout.showSuccess(
          'Pedido Concluído!',
          `Registrado para '${randomUser?.name}' no valor total de R$ ${totalToPay.toFixed(2)}`,
        );
      }

      buildingCart = false;
      await Prompt.pressEnterToContinue();
    } else if (choice === 'cancel') {
      buildingCart = false;
    }
  }
}

function renderOrdersTable(orders: ReturnType<typeof OrderRepository.listAll>): void {
  if (orders.length === 0) {
    console.log('\x1b[33mNenhum pedido registrado até o momento.\x1b[0m');
    return;
  }

  const formatted = orders.map((order) => {
    const user = Database.users.get(order.userId);
    return {
      ID: order.id,
      'Operador/Cliente': user ? user.name : 'Desconhecido',
      'Qtd Itens': order.items.length,
      Total: `R$ ${order.totalPrice.toFixed(2)}`,
      Status: order.status,
      Data: order.createdAt.toLocaleTimeString(),
    };
  });

  console.table(formatted);
}
