import * as vscode from 'vscode';
import { AnalysisResult, CodeIssue, Suggestion } from '../extension';
import { LanguageAnalyzer } from './languages/languageAnalyzer';
import { JavaScriptAnalyzer } from './languages/javascript';
import { PythonAnalyzer } from './languages/python';

// Enable debug logging
const DEBUG = true;
const log = (message: string, data?: any) => {
    if (DEBUG) {
        console.log(`[Green Coder - Analyzer] ${message}`, data || '');
    }
};

export class SustainabilityAnalyzer {
    private analyzers: Map<string, LanguageAnalyzer> = new Map();
    private diagnostics: vscode.DiagnosticCollection;

    constructor() {
        this.diagnostics = vscode.languages.createDiagnosticCollection('sustainability');
        this.initializeAnalyzers();
    }

    private initializeAnalyzers(): void {
        // Register language analyzers
        this.analyzers.set('javascript', new JavaScriptAnalyzer());
        this.analyzers.set('typescript', new JavaScriptAnalyzer()); // Reuse JS analyzer for TS
        this.analyzers.set('python', new PythonAnalyzer());
        // Add more language analyzers here
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
            const result = await analyzer.analyze(text);
            
            // Convert our issues to VS Code diagnostics
            const diagnostics: vscode.Diagnostic[] = result.issues.map(issue => {
                const range = new vscode.Range(
                    issue.line - 1,
                    issue.column - 1,
                    (issue.endLine || issue.line) - 1,
                    issue.endColumn || issue.column
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
                return diagnostic;
            });

            this.diagnostics.set(document.uri, diagnostics);

            // Show the result in the status bar
            const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
            statusBar.text = `$(symbol-color) Green Score: ${result.score.toFixed(0)}%`;
            statusBar.show();

            // Show suggestions as information messages
            if (result.suggestions.length > 0) {
                const showSuggestions = 'Show Suggestions';
                vscode.window.showInformationMessage(
                    `Found ${result.suggestions.length} optimization suggestions`,
                    showSuggestions
                ).then(selection => {
                    if (selection === showSuggestions) {
                        this.showSuggestions(result.suggestions);
                    }
                });
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

    private showSuggestions(suggestions: Suggestion[]): void {
        const panel = vscode.window.createWebviewPanel(
            'sustainabilitySuggestions',
            'Sustainability Suggestions',
            vscode.ViewColumn.Beside,
            {}
        );

        const suggestionItems = suggestions.map(suggestion => `
            <div class="suggestion">
                <h3>${suggestion.message}</h3>
                <p>${suggestion.explanation}</p>
                <pre><code>${suggestion.replacement || suggestion.code}</code></pre>
                <div class="impact">Estimated Impact: ${suggestion.estimatedImpact}% improvement</div>
            </div>
        `).join('');

        panel.webview.html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: var(--vscode-font-family); padding: 20px; }
                    .suggestion { 
                        margin-bottom: 20px; 
                        padding: 15px; 
                        border-left: 3px solid #4CAF50;
                        background-color: rgba(76, 175, 80, 0.1);
                    }
                    .impact { 
                        margin-top: 10px; 
                        font-weight: bold; 
                        color: #4CAF50;
                    }
                    pre {
                        background: #f4f4f4;
                        padding: 10px;
                        border-radius: 4px;
                        overflow-x: auto;
                    }
                </style>
            </head>
            <body>
                <h1>Sustainability Suggestions</h1>
                ${suggestionItems}
            </body>
            </html>
        `;
    }

    dispose() {
        this.diagnostics.dispose();
    }
}
