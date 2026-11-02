import { UserRepository } from '@/modules/users/user.repository';
import { Database } from './memory-db';
import { ProductRepository } from '@/modules/products/product.repository';

export function seedDatabase(): void {
  if (Database.users.size > 0 || Database.products.size > 0) return;

  UserRepository.create({
    name: 'Carlos Silva (Turno Manhã)',
    email: 'carlos.caixa1@lojats.com',
  });

  UserRepository.create({
    name: 'Ana Maria (Turno Tarde)',
    email: 'ana.caixa2@lojats.com',
  });

  UserRepository.create({
    name: 'Roberto Souza (Gerente / Fechamento)',
    email: 'roberto.gerente@lojats.com',
  });

  ProductRepository.create({
    name: 'Teclado Mecânico RGB',
    description: 'Switch Blue, Layout ABNT2 com anti-ghosting',
    price: 250.0,
    stockQuantity: 10,
    status: 'available',
  });

  ProductRepository.create({
    name: 'Mouse Gamer 16000 DPI',
    description: 'Sensor óptico de alta precisão com cabo trançado',
    price: 120.0,
    stockQuantity: 15,
    status: 'available',
  });

  ProductRepository.create({
    name: 'Monitor UltraWide 29"',
    description: 'Painel IPS Full HD 75Hz com HDR',
    price: 1100.0,
    stockQuantity: 5,
    status: 'available',
  });

  ProductRepository.create({
    name: 'Headset Surround 7.1',
    description: 'Microfone omnidirecional com cancelamento de ruído',
    price: 350.0,
    stockQuantity: 20,
    status: 'available',
  });

  ProductRepository.create({
    name: 'Mousepad Extra Large',
    description: 'Superfície Speed 900x400mm com bordas costuradas',
    price: 80.0,
    stockQuantity: 25,
    status: 'available',
  });
}
