# 🛍️ Loja-TS

Sistema de gestão comercial executado no terminal, com áreas para usuários, produtos, pedidos e financeiro. A aplicação é escrita em TypeScript, organiza as regras por módulos e mantém os dados em memória durante a execução.

[📄 Descritivo de decisões](./Loja-TS%20-%20Descritivo%20de%20decis%C3%B5es.md)

## 🧰 Tecnologias

[![Bun](https://img.shields.io/badge/Bun-1.4.2-000000?logo=bun&logoColor=white)](https://bun.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Oxlint](https://img.shields.io/badge/Oxlint-1.89.0-6E56CF)](https://oxc.rs/docs/guide/usage/linter.html)
[![Prettier](https://img.shields.io/badge/Prettier-3.9.10-F7B93E?logo=prettier&logoColor=white)](https://prettier.io/)

As versões exibidas correspondem às versões do runtime e das ferramentas registradas no projeto. O Bun também é usado para instalar dependências, executar os scripts e gerar o build.

## 📋 Pré-requisitos

- [Git](https://git-scm.com/downloads), para clonar o repositório.
- [Bun](https://bun.com/), para instalar as dependências e executar o projeto.

**Node.js não é necessário** para instalar o Bun nem para executar este projeto. Instale o Node apenas se precisar dele para outros projetos ou ferramentas.

## 📦 Instalação do Bun

Abra um terminal e siga as instruções do seu sistema operacional.

### 🪟 Windows

1. Abra o **PowerShell**. Se preferir usar o Prompt de Comando, abra o PowerShell a partir dele.
2. Execute o instalador oficial:

   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

3. Feche e abra o terminal novamente para atualizar o `PATH`.
4. Verifique a instalação:

   ```powershell
   bun --version
   ```

### 🐧 Linux

1. Abra o terminal. O instalador precisa de `curl` e `unzip`; se não estiverem disponíveis, instale-os pelo gerenciador de pacotes da sua distribuição.
2. Execute o instalador oficial:

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

3. Feche e abra o terminal novamente. Se `bun` não for reconhecido, confira as instruções de configuração do `PATH` exibidas pelo instalador.
4. Verifique a instalação:

   ```bash
   bun --version
   ```

### 🍎 macOS

1. Abra o Terminal.
2. Execute o instalador oficial:

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

3. Feche e abra o terminal novamente. Se `bun` não for reconhecido, confira as instruções de configuração do `PATH` exibidas pelo instalador.
4. Verifique a instalação:

   ```bash
   bun --version
   ```

> Instruções atualizadas e opções adicionais estão na [documentação oficial de instalação do Bun](https://bun.com/docs/installation).

## 🚀 Como obter e executar o projeto

Com Git e Bun instalados, clone o repositório e entre na pasta do projeto:

```bash
git clone https://github.com/BrenoLeiriaoNeto/loja-ts.git
cd loja-ts
```

Instale as dependências:

```bash
bun install
```

Inicie a aplicação em modo de desenvolvimento:

```bash
bun run dev
```

O menu interativo será exibido no terminal. Use as opções para navegar entre os módulos e escolha a opção de saída para encerrar. Os dados são armazenados em memória e reiniciados quando a aplicação é iniciada novamente.

## 🧪 Scripts disponíveis

Execute os comandos abaixo na raiz do repositório:

| Comando | Descrição |
| --- | --- |
| `bun run dev` | Executa `src/index.ts` em modo de desenvolvimento e reinicia a aplicação quando os arquivos mudam. |
| `bun run typecheck` | Verifica os tipos TypeScript sem gerar arquivos. |
| `bun run lint` | Analisa o código com Oxlint usando `oxlint.json`. |
| `bun run lint:fix` | Aplica automaticamente as correções disponíveis do Oxlint. |
| `bun run format` | Formata os arquivos TypeScript, TSX, JSON e Markdown dentro de `src/`. |
| `bun run format:check` | Verifica a formatação desses arquivos sem alterá-los. |
| `bun run build` | Gera o build de `src/index.ts` no diretório `dist/`, direcionado ao runtime Bun. |
