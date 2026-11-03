import type { DomainError } from '@/core/errors';

export const Layout = {
  showHeader(screenTitle: string): void {
    console.log('\x1b[36m\x1b[1m┌────────────────────────────────────────────────────────┐\x1b[0m');
    console.log(`\x1b[36m\x1b[1m│ \x1b[35mLOJA-TS\x1b[36m │ ${screenTitle.padEnd(43)} │\x1b[0m`);
    console.log(
      '\x1b[36m\x1b[1m└────────────────────────────────────────────────────────┘\x1b[0m\n',
    );
  },

  showSuccess(title: string, message: string): void {
    console.log(`\n\x1b[32m\x1b[1m✅ [SUCESSO] ${title}\x1b[0m`);
    console.log(`   \x1b[32m${message}\x1b[0m\n`);
  },

  showError(context: string, error: DomainError): void {
    console.log(`\n\x1b[31m\x1b[1m❌ [FALHA] em '${context}'\x1b[0m`);
    console.log(`   Código: \x1b[33m${error.code}\x1b[0m`);
    console.log(`   Detalhes: ${error.message}`);

    if (error.details && error.details.length > 0) {
      error.details.forEach((detail, i) => {
        console.log(`     ${i + 1}. \x1b[31m${detail}\x1b[0m`);
      });
    }
    console.log('');
  },
};
