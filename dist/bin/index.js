#!/usr/bin/env -S node --no-warnings
import readline from 'readline';
import path from 'path';
import fs from 'fs';
import { analyzeTree } from './models/analysisModel.ts';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
async function readFilesFromDirectory(currPath = process.cwd(), level = 0) {
    try {
        const files = await fs.promises.readdir(currPath, { withFileTypes: true }); // cwd = where you ran the script
        if (files.length === 0) {
            console.log("No files found.");
        }
        else {
            for (const f of files) {
                const fullPath = path.join(currPath, f.name);
                if (f.isDirectory()) {
                    await readFilesFromDirectory(fullPath, level + 1);
                }
                else {
                    let indent = "|";
                    for (let i = 0; i < level; i++) {
                        indent += "-";
                    }
                    console.log(indent + f.name);
                    analyzeTree(fullPath);
                }
            }
        }
    }
    catch (err) {
        console.error("Error reading directory:", err);
    }
}
function shell() {
    rl.question("What would you like to do: ", async (ans) => {
        if (ans == "exit") {
            process.exit(0);
        }
        else if (ans == "scan") {
            await readFilesFromDirectory();
        }
        shell();
    });
}
shell();
