import * as vscode from 'vscode';
import { AnalysisResult } from '../analysis/types';

export class StatusBar {
    private statusBarItem: vscode.StatusBarItem;
    private static readonly STATUS_BAR_PRIORITY = 100; // High priority to be on the left

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            StatusBar.STATUS_BAR_PRIORITY
        );
        this.statusBarItem.command = 'code-sustainability-optimizer.analyzeFile';
        this.updateStatusBar('$(symbol-color) Loading...');
        this.statusBarItem.show();
    }

    public updateWithAnalysis(result: AnalysisResult): void {
        const score = result.score;
        let icon: string;
        let color: string;

        if (score >= 75) {
            icon = '$(check)';
            color = 'green';
        } else if (score >= 50) {
            icon = '$(warning)';
            color = 'yellow';
        } else {
            icon = '$(error)';
            color = 'red';
        }

        this.updateStatusBar(
            `${icon} Green Score: ${score.toFixed(0)}%`,
            `Click to analyze this file\n${result.issues.length} issues found`,
            color
        );
    }

    public showError(message: string): void {
        this.updateStatusBar(
            '$(error) Analysis Failed',
            message,
            'red'
        );
    }

    private updateStatusBar(text: string, tooltip?: string, color?: string): void {
        this.statusBarItem.text = text;
        if (tooltip) {
            if (tooltip.includes('\n')) {
                // Use type assertion to handle the MarkdownString case
                (this.statusBarItem as any).tooltip = new vscode.MarkdownString(tooltip);
            } else {
                this.statusBarItem.tooltip = tooltip;
            }
        }
        if (color) {
            this.statusBarItem.color = new vscode.ThemeColor(`statusBarItem.${color}Foreground`);
        }
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}
