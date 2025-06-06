import { AnalysisResult, createBaseResult } from '../types';
import { LanguageAnalyzer } from './languageAnalyzer';

/**
 * Template for creating new language analyzers.
 * Extend this class and implement the analyze() method.
 */
export abstract class BaseLanguageAnalyzer implements LanguageAnalyzer {
    async analyze(code: string): Promise<AnalysisResult> {
        const result = createBaseResult();
        const lines = code.split('\n');
        
        // Call language-specific analysis methods
        await this.analyzeCodePatterns(code, result);
        
        // Calculate metrics
        this.calculateMetrics(code, result);
        
        // Calculate score based on issues and suggestions
        this.calculateScore(result);
        
        return result;
    }
    
    /**
     * Override this method to implement language-specific code analysis
     */
    protected abstract analyzeCodePatterns(code: string, result: AnalysisResult): Promise<void>;
    
    /**
     * Calculate the overall score based on issues and suggestions
     */
    protected calculateScore(result: AnalysisResult): void {
        // Base score starts at 100
        let score = 100;
        
        // Deduct points based on issue severity
        const severityWeights = {
            high: 10,
            medium: 5,
            low: 2
        };
        
        // Deduct points for each issue
        result.issues.forEach(issue => {
            score -= severityWeights[issue.severity] || 0;
        });
        
        // Add points for suggestions (shows we can improve)
        const suggestionImpact = result.suggestions.reduce(
            (sum, s) => sum + (s.estimatedImpact || 0), 0);
            
        // Cap the score between 0 and 100
        result.score = Math.max(0, Math.min(100, score + (suggestionImpact * 0.1)));
    }
    
    /**
     * Calculate basic code metrics
     */
    protected calculateMetrics(code: string, result: AnalysisResult): void {
        const lineCount = code.split('\n').length;
        const complexity = (code.match(/function|class|interface/g) || []).length;
        
        result.metrics = {
            cpuUsage: Math.min(100, lineCount * 0.1 + complexity * 0.5),
            memoryUsage: Math.min(100, lineCount * 0.2 + complexity * 0.3),
            estimatedCarbonFootprint: Math.min(100, lineCount * 0.05 + complexity * 0.4)
        };
    }
    
    /**
     * Helper method to get line number from character index
     */
    protected getLineNumber(code: string, index: number): number {
        // Count the number of newlines before the index
        const lineNumber = code.substring(0, index).split('\n').length;
        return lineNumber > 0 ? lineNumber : 1;
    }
    
    /**
     * Helper method to add a suggestion to the result
     */
    protected addSuggestion(
        result: AnalysisResult,
        message: string,
        code: string,
        optimizedCode: string,
        explanation: string,
        estimatedImpact: number,
        line: number,
        currentCode?: string
    ): void {
        result.suggestions.push({
            message,
            code,
            optimizedCode,
            explanation,
            estimatedImpact,
            line,
            currentCode: currentCode || code
        });
    }
    
    /**
     * Helper method to add an issue to the result
     */
    protected addIssue(
        result: AnalysisResult,
        message: string,
        severity: 'low' | 'medium' | 'high',
        line: number,
        column: number,
        code: string
    ): void {
        result.issues.push({
            message,
            severity,
            line,
            column,
            code
        });
    }
}
