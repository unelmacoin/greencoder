import * as vscode from 'vscode';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { SustainabilityAnalyzer } from './analysis/analyzer';
import { StatusBar } from './ui/statusBar';

// Enable debug logging
const DEBUG = true;
const log = (message: string, data?: any) => {
    if (DEBUG) {
        console.log(`[Green Coder] ${message}`, data || '');
    }
};

// Load environment variables before anything else
function loadEnvVars() {
    // Try to load from extension directory first
    const extensionPath = path.join(__dirname, '..', '..');
    const envPath = path.join(extensionPath, '.env');
    
    log(`Loading environment from: ${envPath}`);
    
    try {
        const result = dotenv.config({ path: envPath });
        if (result.error) {
            log('Error loading .env file:', result.error);
        } else if (result.parsed) {
            log(`Loaded ${Object.keys(result.parsed).length} environment variables from .env file`);
            return true;
        } else {
            log('No .env file found or it was empty');
        }
    } catch (error) {
        log('Error loading .env file:', error);
    }
    
    // Also try loading from workspace
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        const workspacePath = workspaceFolders[0].uri.fsPath;
        const workspaceEnvPath = path.join(workspacePath, '.env');
        
        if (workspaceEnvPath !== envPath) {  // Don't load the same file twice
            log(`Trying to load environment from workspace: ${workspaceEnvPath}`);
            try {
                const result = dotenv.config({ path: workspaceEnvPath });
                if (result.error) {
                    log('Error loading workspace .env file:', result.error);
                } else if (result.parsed) {
                    log(`Loaded ${Object.keys(result.parsed).length} environment variables from workspace .env file`);
                    return true;
                }
            } catch (error) {
                log('Error loading workspace .env file:', error);
            }
        }
    }
    
    // Load from process environment as last resort
    log('Loading environment from process.env');
    dotenv.config();
    return true;
}

// Load environment variables
loadEnvVars();

// Log environment status
log('Environment status:', {
    NODE_ENV: process.env.NODE_ENV,
    CWD: process.cwd(),
    EXTENSION_DIR: __dirname,
    WORKSPACE_FOLDERS: vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath) || 'none'
});

let analyzer: SustainabilityAnalyzer | null = null;
let statusBar: StatusBar | null = null;

export function activate(context: vscode.ExtensionContext) {
    log('Extension is activating...');
    
    // Log extension activation
    console.log('Green Coder: Code Sustainability Optimizer is now active!');
    log('Extension context:', {
        extensionPath: context.extensionPath,
        storagePath: context.storagePath,
        globalStoragePath: context.globalStoragePath,
        workspaceStoragePath: context.storageUri?.fsPath
    });

    log('Creating analyzer and status bar');
    analyzer = new SustainabilityAnalyzer();
    statusBar = new StatusBar();
    
    // Log configuration
    const config = vscode.workspace.getConfiguration('codeSustainabilityOptimizer');
    log('Configuration:', {
        enableRealTimeAnalysis: config.get('enableRealTimeAnalysis'),
        analysisLevel: config.get('analysisLevel')
    });

    // Register commands
    const analyzeFileCommand = vscode.commands.registerCommand('code-sustainability-optimizer.analyzeFile', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            analyzer?.analyzeDocument(editor.document);
        }
    });

    const analyzeWorkspaceCommand = vscode.commands.registerCommand('code-sustainability-optimizer.analyzeWorkspace', () => {
        if (vscode.workspace.workspaceFolders) {
            analyzer?.analyzeWorkspace(vscode.workspace.workspaceFolders[0].uri.fsPath);
        }
    });

    // Register text document change listener for real-time analysis
    const documentChangeListener = vscode.workspace.onDidChangeTextDocument(event => {
        const config = vscode.workspace.getConfiguration('codeSustainabilityOptimizer');
        if (config.get('enableRealTimeAnalysis')) {
            analyzer?.analyzeDocument(event.document);
        }
    });

    context.subscriptions.push(
        analyzeFileCommand,
        analyzeWorkspaceCommand,
        documentChangeListener,
        statusBar
    );
}

export function deactivate() {
    if (analyzer) {
        analyzer.dispose();
        analyzer = null;
    }
    if (statusBar) {
        statusBar.dispose();
        statusBar = null;
    }
}

// Basic types for our analysis results
export interface AnalysisResult {
    score: number; // 0-100
    issues: CodeIssue[];
    suggestions: Suggestion[];
    metrics: {
        cpuUsage: number;
        memoryUsage: number;
        estimatedCarbonFootprint: number;
    };
}

export interface CodeIssue {
    message: string;
    severity: 'low' | 'medium' | 'high';
    line: number;
    column: number;
    endLine?: number;
    endColumn?: number;
    code: string;
}

export interface Suggestion {
    message: string;
    code: string;
    replacement?: string;
    explanation: string;
    estimatedImpact?: number; // 0-100
    line?: number;
    currentCode?: string;
    optimizedCode?: string;
}
