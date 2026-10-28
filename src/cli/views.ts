const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
} as const;

export const Views = {
  showWelcomeScreen(): void {
    console.clear();

    const banner = `
${colors.cyan}${colors.bold}┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ██╗      ██████╗      ██████╗ █████╗     ████████╗███████╗            │
│   ██║     ██╔═══██╗     ╚═██╔═╝██╔══██╗    ╚══██╔══╝██╔════╝            │
│   ██║     ██║   ██║       ██║  ███████║       ██║   ███████╗            │
│   ██║     ██║   ██║  ██   ██║  ██╔══██║       ██║   ╚════██║            │
│   ███████╗╚██████╔╝  ╚█████╔╝  ██║  ██║       ██║   ███████║            │
│   ╚══════╝ ╚═════╝    ╚════╝   ╚═╝  ╚═╝       ╚═╝   ╚══════╝            │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ ${colors.magenta}${colors.bold}  Sistema de Gestão CLI  ${colors.reset}${colors.cyan}│${colors.dim}  Runtime: Bun 1.4.2  │  Engine: TS 7.0  ${colors.reset}${colors.cyan}│
└─────────────────────────────────────────────────────────────────────────┘${colors.reset}
`;

    console.log(colors.cyan + colors.bold);
    console.log(banner);
  },
};
