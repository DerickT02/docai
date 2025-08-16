import fs from 'fs/promises';
import { callModel } from '../langgraph/codeAnalysis.ts';

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

export default async function analyzeCode(filePath: string) {

        const code = await fs.readFile(filePath, 'utf-8'); // await the read

        const stopSpinner = startSpinner("Analyzing code");


        const result = await callModel(filePath, code);           // await the analysis
        console.log(result);
        stopSpinner();
        return result;

}