// Lightweight compiler using solc-js to avoid Hardhat/node version issues
import fs from 'fs';
import path from 'path';
import solc from 'solc';

const contractsDir = path.resolve('contracts');
const outDir = path.resolve('artifacts');
fs.mkdirSync(outDir, { recursive: true });

const file = 'ProduceRegistry.sol';
const source = fs.readFileSync(path.join(contractsDir, file), 'utf8');

const input = {
  language: 'Solidity',
  sources: { [file]: { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode']
      }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
if (output.errors) {
  const errors = output.errors.filter((e) => e.severity === 'error');
  if (errors.length) {
    console.error(errors.map((e) => e.formattedMessage).join('\n'));
    process.exit(1);
  }
}

const artifact = output.contracts[file]['ProduceRegistry'];
const abi = artifact.abi;
const bytecode = artifact.evm.bytecode.object;

fs.writeFileSync(path.join(outDir, 'ProduceRegistry.abi.json'), JSON.stringify(abi, null, 2));
fs.writeFileSync(path.join(outDir, 'ProduceRegistry.bytecode.txt'), bytecode);

console.log('Compiled ProduceRegistry. ABI and bytecode written to artifacts/.');


