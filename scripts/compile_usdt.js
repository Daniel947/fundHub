import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function compileUSDT() {
    console.log("Fetching compiler v0.4.17...");

    return new Promise((resolve, reject) => {
        solc.loadRemoteVersion('v0.4.17+commit.bdeb9e52', (err, solcSpecific) => {
            if (err) {
                console.error("Failed to load compiler:", err);
                return reject(err);
            }

            console.log("Compiling TetherToken.sol...");
            const contractPath = path.join(__dirname, '../src/contracts/TetherToken.sol');
            const source = fs.readFileSync(contractPath, 'utf8');

            // 0.4.17 expects a simpler format or the modern one might be buggy in JS
            const input = {
                sources: {
                    'TetherToken.sol': source
                }
            };

            const output = JSON.parse(solcSpecific.compile(JSON.stringify(input), 1));

            if (output.errors) {
                output.errors.forEach(err => {
                    console.error(err.formattedMessage);
                });
                if (output.errors.some(err => err.severity === 'error')) {
                    return reject(new Error("Compilation failed"));
                }
            }

            const artifactsDir = path.join(__dirname, '../artifacts_custom');
            if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir);

            const tetherToken = output.contracts['TetherToken.sol']['TetherToken'];
            fs.writeFileSync(
                path.join(artifactsDir, 'TetherToken.json'),
                JSON.stringify(tetherToken, null, 2)
            );

            console.log("Compilation successful! TetherToken artifacts saved.");
            resolve();
        });
    });
}

compileUSDT().catch(console.error);
