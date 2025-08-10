import * as vscode from 'vscode';
import { BaseLanguageAnalyzer } from './languages/templateAnalyzer';
import { TypeScriptAnalyzer } from './languages/typescriptAnalyzer';
import { PythonAnalyzer } from './languages/python';
import { AnalysisResult } from './types';

// Enable debug logging
const DEBUG = true;
const log = (message: string, data?: any) => {
    if (DEBUG) {
        console.log(`[Green Coder - Analyzer] ${message}`, data || '');
    }
};

// Log environment status
log('Environment status:', {
    NODE_ENV: process.env.NODE_ENV,
    CWD: process.cwd(),
    WORKSPACE_FOLDERS: vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath) || 'none'
});

export class SustainabilityAnalyzer {
    private analyzers: Map<string, BaseLanguageAnalyzer> = new Map();
    private diagnostics: vscode.DiagnosticCollection;
    private statusBar: any = null; // Will be set from extension

    constructor() {
        this.diagnostics = vscode.languages.createDiagnosticCollection('sustainability');
        this.initializeAnalyzers();
    }

    public setStatusBar(statusBar: any): void {
        this.statusBar = statusBar;
    }

    private initializeAnalyzers(): void {
        // Register language analyzers
        // Use TypeScript analyzer for both JS and TS
        const tsAnalyzer = new TypeScriptAnalyzer();
        this.analyzers.set('typescript', tsAnalyzer);
        this.analyzers.set('javascript', tsAnalyzer);  // Use same analyzer for JS
        this.analyzers.set('javascriptreact', tsAnalyzer);  // For JSX files
        this.analyzers.set('typescriptreact', tsAnalyzer);  // For TSX files
        this.analyzers.set('python', new PythonAnalyzer());
    }

    private updateDiagnostics(document: vscode.TextDocument, issues: AnalysisResult['issues']): void {
        const diagnostics: vscode.Diagnostic[] = [];

        for (const issue of issues) {
            // Ensure line is within document bounds
            const line = Math.max(0, Math.min(issue.line - 1, document.lineCount - 1));
            const lineText = document.lineAt(line).text;
            const column = Math.max(0, Math.min(issue.column - 1, lineText.length));
            const range = new vscode.Range(
                line,
                column,
                line,
                Math.min(column + 10, lineText.length) // Don't go beyond line end
            );

            const severityMap = {
                'high': vscode.DiagnosticSeverity.Error,
                'medium': vscode.DiagnosticSeverity.Warning,
                'low': vscode.DiagnosticSeverity.Information
            };

            const diagnostic = new vscode.Diagnostic(
                range,
                issue.message,
                severityMap[issue.severity] || vscode.DiagnosticSeverity.Information
            );
            diagnostic.code = issue.code;
            diagnostic.source = 'Code Sustainability';
            diagnostics.push(diagnostic);
        }

        this.diagnostics.set(document.uri, diagnostics);
    }

    public async analyze(text: string, languageId: string): Promise<AnalysisResult> {
        log(`Analyzing ${languageId} code (${text.length} chars)`);
        
        const analyzer = this.analyzers.get(languageId);
        
        if (!analyzer) {
            const message = `Code sustainability analysis not supported for ${languageId} files`;
            log(message);
            throw new Error(message);
        }
        
        try {
            return await analyzer.analyze(text);
        } catch (error) {
            log('Error during analysis:', error);
            throw error;
        }
    }
    
    public async analyzeDocument(document: vscode.TextDocument): Promise<void> {
        log(`Analyzing document: ${document.fileName}`);
        log(`Language ID: ${document.languageId}`);
        
        try {
            const languageId = document.languageId;
            log(`Looking for analyzer for language: ${languageId}`);
            
            const analyzer = this.analyzers.get(languageId);
            
            if (!analyzer) {
                const message = `Code sustainability analysis not supported for ${languageId} files`;
                log(message);
                vscode.window.showInformationMessage(message);
                return;
            }

            const text = document.getText();
            
            // Run local analysis
            log('Running analysis...');
            const result = await analyzer.analyze(text);
            
            // Update diagnostics
            this.updateDiagnostics(document, result.issues);
            
            // Update status bar with the score
            if (this.statusBar) {
                this.statusBar.updateWithAnalysis(result);
            }
            
            // Show notification with results
            if (result.issues.length > 0) {
                const showSuggestions = 'Show Suggestions';
                vscode.window.showInformationMessage(
                    `Found ${result.issues.length} potential issues in your code`,
                    showSuggestions
                ).then(selection => {
                    if (selection === showSuggestions) {
                        this.showSuggestions(result.suggestions);
                    }
                });
            } else {
                vscode.window.showInformationMessage('No issues found. Your code looks good!');
            }

        } catch (error) {
            console.error('Error during analysis:', error);
            vscode.window.showErrorMessage('Failed to analyze code for sustainability issues');
        }
    }

    public async analyzeWorkspace(workspacePath: string): Promise<void> {
        // This would analyze the entire workspace
        // Implementation would be similar to analyzeDocument but for multiple files
        vscode.window.showInformationMessage('Workspace analysis is not yet implemented');
    }

    private showSuggestions(suggestions: AnalysisResult['suggestions']): void {
        const items = suggestions.map(suggestion => ({
            label: suggestion.message,
            description: suggestion.code,
            detail: suggestion.explanation,
            suggestion
        }));

        vscode.window.showQuickPick(items, {
            placeHolder: 'Select a suggestion to see details',
            matchOnDescription: true,
            matchOnDetail: true
        }).then(selected => {
            if (selected) {
                this.showSuggestionDetails(selected.suggestion);
            }
        });
    }

    private showSuggestionDetails(suggestion: AnalysisResult['suggestions'][0]): void {
        const panel = vscode.window.createWebviewPanel(
            'sustainabilitySuggestions',
            'Sustainability Suggestions',
            vscode.ViewColumn.Beside,
            {}
        );

        const codeSnippet = suggestion.optimizedCode || suggestion.replacement || suggestion.code;
        const impactInfo = suggestion.estimatedImpact ? 
            `<div class="impact">Estimated Impact: ${suggestion.estimatedImpact}% improvement</div>` : '';
        const lineInfo = suggestion.line ? `<div class="line">Line: ${suggestion.line}</div>` : '';
        const currentCode = suggestion.currentCode ? 
            `<div class="current-code">
                <h4>Current Code:</h4>
                <pre><code>${suggestion.currentCode}</code></pre>
            </div>` : '';

        panel.webview.html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        body {
                            font-family: var(--vscode-font-family);
                            padding: 20px;
                            color: var(--vscode-foreground);
                            background-color: var(--vscode-editor-background);
                        }
                        .suggestion {
                            margin-bottom: 20px;
                            padding: 15px;
                            background-color: var(--vscode-editor-background);
                            border-radius: 4px;
                            border-left: 4px solid var(--vscode-terminal-ansiGreen);
                        }
                        h3 {
                            margin-top: 0;
                            color: var(--vscode-textLink-foreground);
                        }
                        pre {
                            background-color: var(--vscode-textCodeBlock-background);
                            padding: 10px;
                            border-radius: 4px;
                            overflow-x: auto;
                            margin: 10px 0;
                        }
                        code {
                            font-family: var(--vscode-editor-font-family);
                            white-space: pre-wrap;
                        }
                        .impact {
                            margin-top: 15px;
                            font-weight: bold;
                            color: var(--vscode-terminal-ansiGreen);
                        }
                        .line {
                            color: var(--vscode-descriptionForeground);
                            font-size: 0.9em;
                            margin-bottom: 10px;
                        }
                        .current-code {
                            margin-bottom: 15px;
                        }
                        .current-code h4, .optimized-code h4 {
                            margin: 15px 0 5px 0;
                            font-size: 0.9em;
                            color: var(--vscode-descriptionForeground);
                        }
                        .optimized-code pre {
                            border-left: 3px solid var(--vscode-terminal-ansiGreen);
                        }
                    </style>
                </head>
                <body>
                    <div class="suggestion">
                        <h3>${suggestion.message}</h3>
                        ${lineInfo}
                        <p>${suggestion.explanation}</p>
                        ${currentCode}
                        <div class="optimized-code">
                            <h4>Suggested Improvement:</h4>
                            <pre><code>${codeSnippet}</code></pre>
                        </div>
                        ${impactInfo}
                    </div>
                </body>
            </html>
        `;
    }

    dispose() {
        this.diagnostics.dispose();
    }
}
