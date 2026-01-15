import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findImports(importPath) {
    try {
        if (importPath.startsWith('@openzeppelin/')) {
            const filePath = path.join(__dirname, '../node_modules', importPath);
            return { contents: fs.readFileSync(filePath, 'utf8') };
        }
        const filePath = path.join(__dirname, '../src/contracts', importPath);
        if (fs.existsSync(filePath)) {
            return { contents: fs.readFileSync(filePath, 'utf8') };
        }
    } catch (e) {
        return { error: 'File read error: ' + e.message };
    }
    return { error: 'File not found' };
}

async function compile() {
    console.log("Compiling contracts...");

    const contractsPath = path.join(__dirname, '../src/contracts');
    const files = ['FundEscrow.sol', 'CampaignManager.sol', 'IdentityRegistry.sol', 'TetherToken.sol'];

    const sources = {};
    for (const file of files) {
        const filePath = path.join(contractsPath, file);
        if (fs.existsSync(filePath)) {
            sources[file] = { content: fs.readFileSync(filePath, 'utf8') };
            console.log(`Loaded ${file}`);
        } else {
            console.warn(`Warning: ${file} not found`);
        }
    }

    const input = {
        language: 'Solidity',
        sources: sources,
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode']
                }
            },
            optimizer: {
                enabled: true,
                runs: 200
            },
            viaIR: true
        }
    };

    try {
        console.log("Starting solc compilation...");
        const compiled = solc.compile(JSON.stringify(input), { import: findImports });
        const output = JSON.parse(compiled);

        if (output.errors) {
            let hasError = false;
            output.errors.forEach(err => {
                console.error(err.formattedMessage);
                if (err.severity === 'error') hasError = true;
            });
            if (hasError) {
                console.error("Compilation failed due to errors.");
                process.exit(1);
            }
        }

        const artifactsDir = path.join(__dirname, '../artifacts_custom');
        if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir);

        for (const [sourceName, contracts] of Object.entries(output.contracts)) {
            for (const [contractName, artifact] of Object.entries(contracts)) {
                const fileName = `${contractName}.json`;
                fs.writeFileSync(
                    path.join(artifactsDir, fileName),
                    JSON.stringify(artifact, null, 2)
                );
                console.log(`Saved artifact: ${fileName}`);
            }
        }

        console.log("Compilation successful!");
    } catch (err) {
        console.error("Critical error during compilation:", err);
        process.exit(1);
    }
}

compile();
