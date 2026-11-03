# Visão Geral do Projeto

O **Loja-TS** é um sistema de gestão comercial rodando via CLI (Command Line Interface). O projeto foi construído para demonstrar o domínio de fundamentos de engenharia de software aplicados ao TypeScript, focando em segurança de tipos, controle de estado imutável e arquitetura escalável.

Nenhuma biblioteca externa de terceiros (como Zod, Chalk ou Inquirer) foi utilizada para a lógica de negócio ou interface, forçando a implementação de tipagens avançadas, schemas nativos e manipulação de API do Console via Raw Mode.

Configuração do Ambiente

- **Runtime:** Bun (v1.4.2) - Escolhido pela altíssima performance, suporte nativo a TypeScript sem transpilação prévia e velocidade de execução.
- **TypeScript:** Versão 7.0.2 - Configurado com alto rigor (`strict: true`, `isolatedDeclarations: true`, `verbatimModuleSyntax: true`, eliminando completamente o uso de `any` e inferências inseguras).
- **Linter:** Oxlint (`typeAware: true`) - Utilizado para checagem estática ultrarrápida, blindando o código contra asserções inseguras de tipos (`no-unsafe-type-assertions`).

## Arquitetura e Organização

---

Foi adotada uma arquitetura baseada em módulos, onde cada módulo representa um conjunto completo de funções CRUD básicas separadas em arquivos e isolados de recursos do núcleo da aplicação e de interação direta com a lógica de armazenamento dos dados.

O motivo dessa escolha é para a simplificação da criação do projeto que tem o foco no uso extensivo dos recursos de Typescript, mas sem deixar de lado os benefícios da organização de uma **Arquitetura Modular Pragmática (Vertical Slices)**.

Segue abaixo uma exemplificação da estrutura do projeto e seus diretórios:

```text
.
├── .gitignore
├── .prettierignore
├── .prettierrc
├── bun.lock
├── oxlint.json
├── package.json
├── README.md
├── Loja-TS - Descritivo de decisões.md
├── PROJECT_TREE.txt
├── tsconfig.json
└── src/                            # Código-fonte da aplicação
    ├── index.ts                    # Ponto de entrada
    ├── cli/                        # Interface de linha de comando
    │   ├── index.ts                # Orquestrador da CLI
    │   ├── components/             # Componentes reutilizáveis do terminal
    │   │   ├── banner.ts
    │   │   ├── layout.ts
    │   │   ├── menu.ts
    │   │   └── prompt.ts
    │   └── screens/                # Telas interativas por domínio
    │       ├── financial.screen.ts
    │       ├── orders.screen.ts
    │       ├── products.screen.ts
    │       └── user.screen.ts
    ├── core/                       # Contratos e regras compartilhadas
    │   ├── errors.ts               # Classes de erro de domínio customizadas
    │   ├── interfaces/             # Interfaces das entidades
    │   │   ├── base.ts
    │   │   ├── financial.ts
    │   │   ├── order.ts
    │   │   ├── product.ts
    │   │   └── user.ts
    │   ├── types/                  # Tipos e status de negócio (Branded Types)
    │   │   ├── base.ts
    │   │   ├── order.status.ts
    │   │   └── product.status.ts
    │   ├── utils/                  # Conversores e utilitários seguros
    │   │   └── type-guards.ts
    │   └── validations/            # Schemas de validação em runtime e padrão Result
    │       ├── financial.schema.ts
    │       ├── order.schema.ts
    │       ├── product.schema.ts
    │       ├── types.ts
    │       └── user.schema.ts
    ├── modules/                    # Lógica de persistência e regras de negócio
    │   ├── financial/
    │   │   └── financial.repository.ts
    │   ├── orders/
    │   │   └── order.repository.ts
    │   ├── products/
    │   │   └── product.repository.ts
    │   └── users/
    │       └── user.repository.ts
    └── storage/                    # Camada de Dados em Memória
        ├── memory-db.ts            # Banco de dados usando Map
        └── seed.ts                 # Dados mockados iniciais (Caixas e Produtos)

# Obs.: .git, node_modules, diretórios vazios e artefatos gerados (como dist/) foram omitidos.
```

## Modelagem e Tipagem

Para os domínios representados no projeto, eu optei por usar **Interfaces** para descrever seus atributos e tipagem explícita em seus campos para melhor legibilidade. Criei uma interface genérica `BaseEntity` para poder evitar repetição desnecessária de código entre as interfaces de domínio e criei uma tipagem específica em `/types/base.ts` para garantir a unicidade dos IDs de cada um dos domínios. Para Unions e Intersections, foram utilizados sempre **Type**.

Segue abaixo o `BaseEntity`:

```typescript
export interface BaseEntity<T> {
  readonly id: T;
  readonly createdAt: Date;
  updatedAt: Date;
}
```

E o `/types/base.ts`:

```typescript
export type UserId = string & { readonly brand: unique symbol };
export type ProductId = string & { readonly brand: unique symbol };
export type OrderId = string & { readonly brand: unique symbol };
export type FinancialId = string & { readonly brand: unique symbol };
```

Uma interface de domínio de exemplo utilizando ambos:

```typescript
import type { OrderId, ProductId, UserId } from '../types/base';
import type { OrderStatus } from '../types/order.status';
import type { BaseEntity } from './base';

export interface OrderItem {
  readonly productId: ProductId;
  readonly quantity: number;
  readonly unitPrice: number;
}

export interface Order extends BaseEntity<OrderId> {
  readonly userId: UserId;
  readonly items: readonly OrderItem[];
  readonly totalPrice: number;
  readonly status: OrderStatus;
}
```

## Validações, gerenciamento de erros e Generics

Para o gerenciamento de erros, decidi criar classes customizadas para facilitar o rastreamento de onde aconteceu o erro, além de agrupar múltiplos erros para facilitar o seu uso em formulários. Para detectar se houve ou não um erro, criei um arquivo `types.ts` em `/validations` que usa o padrão `Result` para retornar um sucesso ou uma falha de validação.

Segue abaixo o exemplo do padrão `Result`:

```typescript
import type { DomainError } from '../errors';

export type Result<T, E extends DomainError = DomainError> =
  { readonly success: true; readonly data: T } | { readonly success: false; readonly error: E };
```

Para as validações de campos e tipos, foram implementados:

- `Type Guards` para garantir que a tipagem dos campos estão vindo de forma correta e de acordo com as interfaces definidas no domínio;
- Criação de DTOs com `Type` e usando o recurso `Omit<>` para gerar um DTO específico, apenas com os campos necessários para a criação de dados e validação dos mesmos;
- Validação exaustiva de propriedades usando `typeof` e regex (este último apenas quando necessário);
- Agrupamento de erros de validação, caso houver algum ou mais;
- Criação de variáveis locais tipadas para aguardar os dados validados;
- Retorno de sucesso apenas quando todos os campos foram testados e atribuidos as variáveis locais.

Para manter a UI isolada da lógica, foi criado um utilitário interativo no terminal utilizando `Generics`. O componente `Prompt.select<T>` recebe um array de opções tipadas e garante que o retorno seja estritamente um dos IDs esperados pelo fluxo da aplicação.

Segue abaixo o utilitário:

```typescript
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
```

## Commit em 2 fases e Integridade Transacional

A regra de negócio mais complexa está no `OrderRepository.create`. Ao registrar um pedido, o sistema realiza múltiplas validações (existência de usuário, se os preços batem, se há estoque). Para não ferir a imutabilidade e não deixar o banco em memória inconsistente em caso de falha no meio do loop de itens, foi implementado um **Commit em 2 fases**:

1. O sistema valida tudo e armazena os novos estoques em um array de intenção de atualização.
2. Apenas se **zero erros de domínio** ocorrerem, o sistema efetiva a criação dos novos objetos de `Product` atualizados e salva a ordem.

## Uso Consciente de Classes vs Interfaces

O projeto aplica ambos os conceitos de forma complementar:

1. **Interfaces para Entidades de Domínio:** Utilizadas para representar `User`, `Product`, `Order` e `Financial`, garantindo imutabilidade (`readonly`), interoperabilidade com JSON e alinhamento com o gerenciamento de estado no front-end.
2. **Classes para Infraestrutura de Erros:** A hierarquia de erros em `src/core/errors.ts` (`DomainError`, `NotFoundError`, `ValidationError`) foi implementada utilizando **Classes**, aproveitando o encapsulamento, modificadores de visibilidade e suporte nativo ao operador `instanceof` para capturas em runtime.

## Enums vs String Literal Unions

Optou-se pelo uso de **String Literal Unions** (`OrderStatus` e `ProductStatus`) em detrimento dos `enums` numéricos ou de string tradicionais do TypeScript. Essa decisão elimina o código JS gerado por IIFE dos enums nativos, garante zero overhead em runtime e simplifica a serialização e desserialização de payloads de API.

## Outras Decisões Técnicas

1. **Uso de `Map` ao invés de `Array` no Banco em memória:** A busca por ID (ex: `Database.users.get(id)`) cai de uma complexidade O(N) para O(1). Em um cenário simulando alta concorrência de relatórios financeiros, isso previne gargalos de performance.
2. **Separação estrita CLI x Core:** Nenhuma função do `core` ou dos `modules` usa `console.log`. Todo o retorno de dados vai encapsulado no tipo `Result`. Isso significa que o núcleo deste projeto poderia ser facilmente plugado em uma interface React ou em um servidor Express sem alterar uma linha de regra de negócio.
3. **Regra `no-await-in-loop` desativada no Linter:** Esta regra foi desativada porque ela fere o comportamento esperado do domínio de I/O da aplicação. Em uma interface interativa de terminal, o `await` sequencial dentro de um loop é obrigatório, pois estamos pausando a execução para esperar uma ação do usuário no teclado.
4. **Regra `no-unsafe-type-assertion` desativada localmente:** Esta regra só foi desativada _exclusivamente_ no arquivo `type-guard.ts`. O motivo é por causa que os IDs nominais (Branded Types) existem apenas em tempo de compilação, o casting com `as` é estritamente necessário neste arquivo para converter strings primitivas geradas pelo `crypto.randomUUID()`. Isso concentra e isola essa exceção de tipagem em um único ponto centralizado, blindando o restante do sistema.

## Uso de IA

O meu uso de IA se resume nas seguintes áreas:

- Brainstorming para decidir qual a melhor arquitetura para um projeto focado totalmente em recursos de Typescript;
  - Recusei propostas de Clean Architecture e CQRS, optando pela arquitetura modula pragmática (vertical slices) para um projeto deste tamanho e escopo.
- Breve entendimento e comparação entre **Interfaces**, **Classes** e **Types**, para poder analisar qual seria melhor para modelos de domínio e schemas de validação;
- Auxílio na configuração do arquivo `tsconfig.json` e do linter `oxlint.json`, dando prioridade na configuração de um ambiente bem estrito de tipagem e evitar `any` e `unknown` em excesso;
- Uso extensivo da IA como um code reviewer, analisando a qualidade do código que escrevo de acordo com as boas práticas de typescript, bem como se está sendo utilizado os recursos mais recentes de forma ideal e de acordo com as regras dos arquivos de configuração do projeto;
- Breve discussão para como criar IDs únicos para os modelos de domínio, ja que o armazenamento de dados será feito em memória;
  - Decidi por optar pela utilização dos **Branded Types** e anotação string para os IDs para forçar uma validação estrita pelo Typescript, ja que irei usar o recurso `crypto.randomUUID()` para gerar os IDs em memória durante a execução.
- Uso fundamental para aprender sobre layouts em linha de comando (CLI), controle de eventos em Raw mode (`process.stdin`) e injeção de cores ANSI nativas, bem como na aceleração da estruturação do mesmo, deixando o layout e roteamento via CLI sob responsabilidade da IA e o esforço cognitivo humano responśavel apenas na lógica e modelagem de dados;
- Uso da IA como _Pair Programmer_ para poder aprender, implementar, validar, debugar, testar e corrigir o projeto em uma menor quantidade de tempo.

IAs utilizadas:

- **Google Gemini Web:** Usei o Gemini primariamente como _Pair Programmer_ e para tirar dúvidas de TypeScript, Console API e de arquitetura no geral;
- **GitHub Copilot:** Usei o GitHub Copilot em modo Agente direto no VS Code como um code reviewer rigoroso configurado para o TypeScript na versão 7.0.2 e sempre referenciando os arquivos `tsconfig.json` e `oxlint.json` para oferecer os melhores logs de debugging possíveis.

**Conclusão sobre IA:** Ela potencializa muito a velocidade e oferece soluções pragmáticas, mas não substitui a responsabilidade do engenheiro de software de aplicar Design Patterns adequados e auditar a coerência do sistema contra as restrições estritas do compilador. Em outras palavras, a IA escreve mas quem orquestra e aprova a segurança transacional da aplicação é o desenvolvedor.
