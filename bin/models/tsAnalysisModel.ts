import fs from 'fs/promises';
import { analyzeCode } from '../langgraph/codeAnalysis.ts';

export function startSpinner(message: string = "Processing") {
    const spinnerFrames = ['-', '\\', '|', '/'];
    let i = 0;
    const interval = setInterval(() => {
        process.stdout.write(`\r${message}... ${spinnerFrames[i++]}`);
        i %= spinnerFrames.length;
    }, 100);

    return () => {
        clearInterval(interval);
        process.stdout.write(`\r${message} complete!     \n`);
    };
}

export default async function analyzeTree(filePath: string) {
    try {
        const code = await fs.readFile(filePath, 'utf-8'); // await the read

        const stopSpinner = startSpinner("Analyzing code");


        const result = await analyzeCode(code);           // await the analysis
        console.log(result);

        stopSpinner()
    } catch (err) {
        console.error("Error reading or analyzing file:", err);
    }
}