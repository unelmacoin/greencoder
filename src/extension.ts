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
    console.log('Extension "green-coder" is now active!');
    
    const analyzer = new SustainabilityAnalyzer();
    
    // Store analyzer in context for reuse
    context.globalState.update('analyzer', analyzer);
    
    // Register command to analyze current file
    const analyzeCommand = vscode.commands.registerCommand('green-coder.analyzeFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor');
            return;
        }
        
        const document = editor.document;
        const text = document.getText();
        const languageId = document.languageId;
        
        try {
            const result = await analyzer.analyze(text, languageId);
            
            // Show results in a webview or output channel
            const outputChannel = vscode.window.createOutputChannel('Green Coder');
            outputChannel.clear();
            outputChannel.show();
            
            if (result.issues.length === 0) {
                outputChannel.appendLine('✅ No sustainability issues found!');
            } else {
                outputChannel.appendLine(`⚠️ Found ${result.issues.length} potential sustainability issues:\n`);
                
                result.issues.forEach((issue: { severity: string; message: string; line: number; column: number; code: string }, index: number) => {
                    outputChannel.appendLine(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
                    outputChannel.appendLine(`   File: ${document.fileName}:${issue.line}:${issue.column}`);
                    outputChannel.appendLine(`   Code: ${issue.code}\n`);
                });
                
                if (result.suggestions && result.suggestions.length > 0) {
                    outputChannel.appendLine('\n💡 Suggestions for improvement:');
                    result.suggestions.forEach((suggestion: { message: string; currentCode?: string; optimizedCode?: string; explanation?: string }, index: number) => {
                        outputChannel.appendLine(`\n${index + 1}. ${suggestion.message}`);
                        if (suggestion.currentCode) {
                            outputChannel.appendLine(`   Current code: ${suggestion.currentCode}`);
                        }
                        if (suggestion.optimizedCode) {
                            outputChannel.appendLine(`   Suggested fix: ${suggestion.optimizedCode}`);
                        }
                        if (suggestion.explanation) {
                            outputChannel.appendLine(`   Explanation: ${suggestion.explanation}`);
                        }
                    });
                }
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error analyzing file: ${error}`);
            console.error('Error analyzing file:', error);
        }
    });
    
    // Analyze on save
    const onSave = vscode.workspace.onDidSaveTextDocument(async (document: vscode.TextDocument) => {
        if (['javascript', 'typescript', 'javascriptreact', 'typescriptreact'].includes(document.languageId)) {
            const text = document.getText();
            try {
                const result = await analyzer.analyze(text, document.languageId);
                if (result.issues.length > 0) {
                    vscode.window.showInformationMessage(
                        `Green Coder: Found ${result.issues.length} potential sustainability issues`,
                        'View Issues'
                    ).then(selection => {
                        if (selection === 'View Issues') {
                            vscode.commands.executeCommand('green-coder.analyzeFile');
                        }
                    });
                }
            } catch (error) {
                console.error('Error analyzing on save:', error);
            }
        }
    });
    
    context.subscriptions.push(
        analyzeCommand,
        onSave,
        vscode.commands.registerCommand('green-coder.analyzeWorkspace', async () => {
            // Implementation for analyzing entire workspace
        })
    );
    log('Extension is activating...');
    
    // Log extension activation
    console.log('Green Coder: Code Sustainability Optimizer is now active!');
    log('Extension context:', {
        extensionPath: context.extensionPath,
        storagePath: context.storagePath,
        globalStoragePath: context.globalStoragePath,
        workspaceStoragePath: context.storageUri?.fsPath
    });

    log('Extension activated successfully');
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
