import * as vscode from 'vscode';
import { SustainabilityAnalyzer } from './analysis/analyzer';
import { StatusBar } from './ui/statusBar';

// Enable debug logging
const DEBUG = true;
const log = (message: string, data?: any) => {
    if (DEBUG) {
        console.log(`[Green Coder] ${message}`, data || '');
    }
};

export function activate(context: vscode.ExtensionContext) {
    log('Extension is activating...');
    
    // Log extension activation
    console.log('Green Coder: Code Sustainability Optimizer is now active!');
    log('Extension context:', context);

    log('Creating analyzer and status bar');
    const analyzer = new SustainabilityAnalyzer();
    const statusBar = new StatusBar();
    
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
            analyzer.analyzeDocument(editor.document);
        }
    });

    const analyzeWorkspaceCommand = vscode.commands.registerCommand('code-sustainability-optimizer.analyzeWorkspace', () => {
        if (vscode.workspace.workspaceFolders) {
            analyzer.analyzeWorkspace(vscode.workspace.workspaceFolders[0].uri.fsPath);
        }
    });

    // Register text document change listener for real-time analysis
    const documentChangeListener = vscode.workspace.onDidChangeTextDocument(event => {
        const config = vscode.workspace.getConfiguration('codeSustainabilityOptimizer');
        if (config.get('enableRealTimeAnalysis')) {
            analyzer.analyzeDocument(event.document);
        }
    });

    context.subscriptions.push(
        analyzeFileCommand,
        analyzeWorkspaceCommand,
        documentChangeListener,
        statusBar
    );
}

export function deactivate() {}

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
    estimatedImpact: number; // 0-100
}
