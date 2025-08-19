#!/usr/bin/env -S node --no-warnings
import readline from 'readline'
import path  from 'path'
import fs from 'fs'
import tsAnalysisTree from './models/tsAnalysisModel.ts'
import analyzeCode from './models/tsAnalysisModel.ts'
import { analyzeProject } from './langgraph/codeAnalysis.ts'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
const ignore = [".git", "node_modules"];
let summaries: any = [];
async function isNextJsProject(rootPath: string): Promise<boolean> {
    // Check for next.config.js
    if (fs.existsSync(path.join(rootPath, 'next.config.js'))) return true;
    // Check package.json for next dependency
    try {
        const pkg = JSON.parse(fs.readFileSync(path.join(rootPath, 'package.json'), 'utf-8'));
        if (pkg.dependencies?.next || pkg.devDependencies?.next) return true;
    } catch {}
    // Check for pages or app directory
    if (fs.existsSync(path.join(rootPath, 'pages')) || fs.existsSync(path.join(rootPath, 'app'))) return true;
    return false;
}

async function detectProjectType(rootPath: string): Promise<'nextjs' | 'react' | 'python' | 'django' | 'java' | 'spring' | 'unknown'> {
    // JavaScript/TypeScript frameworks
    try {
        const pkgPath = path.join(rootPath, 'package.json');
        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            if (pkg.dependencies?.next || pkg.devDependencies?.next) return 'nextjs';
            if (pkg.dependencies?.react || pkg.devDependencies?.react) return 'react';
        }
    } catch {}
    // Python frameworks
    if (fs.existsSync(path.join(rootPath, 'manage.py'))) return 'django';
    if (fs.existsSync(path.join(rootPath, 'requirements.txt'))) {
        const reqs = fs.readFileSync(path.join(rootPath, 'requirements.txt'), 'utf-8');
        if (reqs.includes('django')) return 'django';
    }
    // Java frameworks
    if (fs.existsSync(path.join(rootPath, 'pom.xml'))) return 'spring';
    // Fallbacks
    if (fs.existsSync(path.join(rootPath, 'main.py'))) return 'python';
    if (fs.existsSync(path.join(rootPath, 'Main.java'))) return 'java';
    return 'unknown';
}

function getRelevantDirs(projectType: string): string[] | null {
    switch (projectType) {
        case 'nextjs':
            return ['pages', 'app', 'components'];
        case 'react':
            return ['src', 'components'];
        case 'django':
            return ['apps', 'project', 'templates'];
        case 'spring':
            return ['src', 'main', 'resources'];
        case 'python':
            return ['.']; // scan all .py files
        case 'java':
            return ['src'];
        default:
            return null; // scan everything
    }
}

async function readFilesFromDirectory(currPath: string = process.cwd(), level = 0, scanDirs: string[] | null = null){
    try {
        if (scanDirs === null) {
            const projectType = await detectProjectType(process.cwd());
            scanDirs = getRelevantDirs(projectType);
        }
        const files = await fs.promises.readdir(currPath, {withFileTypes: true});
        for(const f of files){
            const fullPath = path.join(currPath, f.name);
            const relativePath = path.relative(process.cwd(), fullPath);
            if(f.name.startsWith(".") || ignore.includes(f.name)) continue;
            if(f.isDirectory()){
                if (scanDirs && !scanDirs.includes(f.name)) continue;
                let indent = "".padStart(level, " ") + "📂";
                console.log(indent + f.name);
                await readFilesFromDirectory(relativePath, level + 1, scanDirs);
            } else {
                // Adjust file extensions per language
                if(
                    f.name.endsWith('.ts') || f.name.endsWith('.js') ||
                    f.name.endsWith('.tsx') || f.name.endsWith('.jsx') ||
                    f.name.endsWith('.py') || f.name.endsWith('.java')
                ){
                    let partialSummary = await analyzeCode(relativePath);
                    summaries.push(partialSummary);
                }
            }
        }
        analyzeProject(summaries);
    } catch (err) {
        console.error("Error reading directory:", err);
    }
}

function shell(){

    rl.question("What would you like to do: ", async (ans: string) => {
        if(ans == "exit"){
            process.exit(0)
        }
        else if(ans == "scan"){
            await readFilesFromDirectory()
            console.log("Standby for PDF Generation")
        }
        shell()
    })
}

shell()
