import { LanguageAnalyzer } from './languageAnalyzer';
import { AnalysisResult, CodeIssue, Suggestion } from '../../extension';

export class JavaScriptAnalyzer extends LanguageAnalyzer {
    async analyze(code: string): Promise<AnalysisResult> {
        const result = this.createBaseResult();
        
        // Check for common performance anti-patterns
        this.checkForLoops(code, result);
        this.checkForMemoryLeaks(code, result);
        this.checkForInefficientAPIs(code, result);
        
        // Calculate score based on issues found
        this.calculateScore(result);
        
        return result;
    }
    
    private checkForLoops(code: string, result: AnalysisResult): void {
        // Check for nested loops which can be O(n^2) or worse
        const nestedLoopRegex = /for\s*\([^)]*\)\s*\{[\s\S]*?for\s*\([^)]*\)/g;
        if (nestedLoopRegex.test(code)) {
            result.issues.push({
                message: 'Nested loops can lead to O(n^2) or worse time complexity',
                severity: 'medium',
                line: this.getLineNumber(code, nestedLoopRegex.lastIndex),
                column: 1,
                code: 'PERF_NESTED_LOOPS'
            });
        }
        
        // Check for potential infinite loops
        const infiniteLoopRegex = /while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/g;
        let match;
        while ((match = infiniteLoopRegex.exec(code)) !== null) {
            result.issues.push({
                message: 'Potential infinite loop detected',
                severity: 'high',
                line: this.getLineNumber(code, match.index),
                column: 1,
                code: 'PERF_INFINITE_LOOP'
            });
        }
    }
    
    private checkForMemoryLeaks(code: string, result: AnalysisResult): void {
        // Check for global variables which can cause memory leaks
        const globalVarRegex = /^(\s*|.*[\s;])var\s+\w+\s*=/gm;
        let match;
        while ((match = globalVarRegex.exec(code)) !== null) {
            const varName = match[0].match(/var\s+(\w+)/)?.[1];
            if (varName && !['i', 'j', 'k', 'x', 'y', 'z'].includes(varName)) {
                result.issues.push({
                    message: `Global variable '${varName}' can cause memory leaks`,
                    severity: 'medium',
                    line: this.getLineNumber(code, match.index),
                    column: 1,
                    code: 'MEMORY_GLOBAL_VAR'
                });
                
                result.suggestions.push({
                    message: `Use block-scoped 'let' or 'const' instead of 'var'`,
                    code: `var ${varName} = ...`,
                    replacement: `let ${varName} = ...`,
                    explanation: 'Block-scoped variables help prevent memory leaks and make the code more predictable',
                    estimatedImpact: 10
                });
            }
        }
    }
    
    private checkForInefficientAPIs(code: string, result: AnalysisResult): void {
        // Check for setTimeout/setInterval with string evaluation
        const evalTimeoutRegex = /set(?:Timeout|Interval)\s*\(\s*['"]/g;
        if (evalTimeoutRegex.test(code)) {
            result.issues.push({
                message: 'Avoid passing strings to setTimeout/setInterval as it uses eval()',
                severity: 'high',
                line: this.getLineNumber(code, evalTimeoutRegex.lastIndex),
                column: 1,
                code: 'PERF_EVAL_TIMEOUT'
            });
            
            result.suggestions.push({
                message: 'Pass a function reference instead of a string to setTimeout/setInterval',
                code: 'setTimeout("console.log(\\"hello\\")", 1000);',
                replacement: 'setTimeout(() => console.log("hello"), 1000);',
                explanation: 'Passing a function is more efficient and secure than using eval()',
                estimatedImpact: 15
            });
        }
        
        // Check for inefficient array operations
        const arrayConcatInLoopRegex = /for\s*\([^)]*\)\s*\{[\s\S]*?\.concat\(/g;
        if (arrayConcatInLoopRegex.test(code)) {
            result.issues.push({
                message: 'Avoid using concat() in loops as it creates new arrays',
                severity: 'medium',
                line: this.getLineNumber(code, arrayConcatInLoopRegex.lastIndex),
                column: 1,
                code: 'PERF_CONCAT_IN_LOOP'
            });
            
            result.suggestions.push({
                message: 'Use push() with spread operator instead of concat() in loops',
                code: 'result = result.concat(array);',
                replacement: 'result.push(...array);',
                explanation: 'Using push() with spread is more memory efficient in loops',
                estimatedImpact: 20
            });
        }
    }
    
    private calculateScore(result: AnalysisResult): void {
        // Deduct points based on issues found
        const severityScores = {
            high: 20,
            medium: 10,
            low: 5
        };
        
        let totalDeduction = 0;
        for (const issue of result.issues) {
            totalDeduction += severityScores[issue.severity] || 0;
        }
        
        // Add points for suggestions (potential improvements)
        const suggestionBonus = Math.min(result.suggestions.length * 2, 20);
        
        // Calculate final score (0-100)
        result.score = Math.max(0, Math.min(100, 100 - totalDeduction + suggestionBonus));
        
        // Calculate metrics (simplified for this example)
        result.metrics = {
            cpuUsage: 100 - result.score,
            memoryUsage: 100 - result.score,
            estimatedCarbonFootprint: (100 - result.score) * 0.1 // Simplified calculation
        };
    }
    
    private getLineNumber(code: string, index: number): number {
        // Simple line number calculation based on newlines
        const lines = code.substring(0, index).split('\n');
        return lines.length;
    }
}
