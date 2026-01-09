#!/usr/bin/env node

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m'
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function printBanner() {
  console.log('\n');
  console.log(colors.blue + '  ███████╗ █████╗ ██████╗  ██████╗ ████████╗███████╗██╗   ██╗██████╗ ' + colors.reset);
  console.log(colors.blue + '  ██╔════╝██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝██║   ██║██╔══██╗' + colors.reset);
  console.log(colors.blue + '  ███████╗███████║██████╔╝██║   ██║   ██║   █████╗  ██║   ██║██████╔╝' + colors.reset);
  console.log(colors.blue + '  ╚════██║██╔══██║██╔══██╗██║   ██║   ██║   ██╔══╝  ██║   ██║██╔══██╗' + colors.reset);
  console.log(colors.blue + '  ███████║██║  ██║██████╔╝╚██████╔╝   ██║   ███████╗╚██████╔╝██║  ██║' + colors.reset);
  console.log(colors.blue + '  ╚══════╝╚═╝  ╚═╝╚═════╝  ╚═════╝    ╚═╝   ╚══════╝ ╚═════╝ ╚═╝  ╚═╝' + colors.reset);
  console.log('\n');
  console.log(colors.yellow + '            > React Frontend - The Game Begins <' + colors.reset);
  console.log('\n');
}

async function step(message, color) {
  process.stdout.write(color + '[ SABOTEUR ] ' + message + '...' + colors.reset);
  await sleep(500);
  console.log(colors.green + ' ✓' + colors.reset);
}

async function loadingBar(label, color) {
  process.stdout.write(color + '   [ ' + label + ' ] ' + colors.reset);
  for (let i = 0; i <= 20; i++) {
    process.stdout.write(color + '▓' + colors.reset);
    await sleep(60);
  }
  console.log(colors.brightGreen + ' ✓ 100%' + colors.reset);
}

async function main() {
  await printBanner();
  
  console.log(colors.brightYellow + '╔══════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.brightYellow + '║         - SABOTEUR FRONTEND INITIALIZATION -             ║' + colors.reset);
  console.log(colors.brightYellow + '╚══════════════════════════════════════════════════════════╝' + colors.reset);
  console.log('\n');

  await step('[*] Loading React Components', colors.cyan);
  await loadingBar('COMPONENTS', colors.brightCyan);
  
  await step('[+] Configuring Routes', colors.blue);
  await sleep(400);
  
  await step('[#] Initializing WebSocket', colors.magenta);
  await loadingBar('WEBSOCKET', colors.brightMagenta);
  
  await step('[@] Loading Game Assets', colors.yellow);
  await sleep(400);
  
  await step('[~] Setting Up Redux Store', colors.green);
  await sleep(400);
  
  await step('[!] Preparing Game Board', colors.brightRed);
  await loadingBar('GAME ENGINE', colors.red);

  console.log('\n');
  console.log(colors.brightGreen + '[ ✓ ] FRONTEND READY' + colors.reset);
  console.log('\n');

  console.log(colors.brightYellow + '══════════════════════════════════════════════════════════' + colors.reset);
  console.log(colors.brightGreen + '       >> SABOTEUR UI READY - LAUNCHING SERVER <<' + colors.reset);
  console.log(colors.brightYellow + '══════════════════════════════════════════════════════════' + colors.reset);
  console.log('\n');
  console.log(colors.cyan + '   [>] Framework: React 18' + colors.reset);
  console.log(colors.cyan + '   [>] Mode: Development' + colors.reset);
  console.log(colors.cyan + '   [>] Server: Starting on port 3000...' + colors.reset);
  console.log('\n');
  console.log(colors.magenta + '   [i] Get ready to sabotage or dig for gold!' + colors.reset);
  console.log('\n');
}

main().catch(err => {
  console.error('Startup error:', err);
  process.exit(1);
});
