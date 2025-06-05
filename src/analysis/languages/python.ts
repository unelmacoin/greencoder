import { LanguageAnalyzer } from './languageAnalyzer';
import { AnalysisResult, CodeIssue, Suggestion } from '../../extension';

export class PythonAnalyzer extends LanguageAnalyzer {
    async analyze(code: string): Promise<AnalysisResult> {
        const result = this.createBaseResult();
        
        // Check for common performance issues in Python
        this.checkForGlobalVariables(code, result);
        this.checkForInefficientLoops(code, result);
        this.checkForInefficientDataStructures(code, result);
        
        // Calculate score based on issues found
        this.calculateScore(result);
        
        return result;
    }
    
    private checkForGlobalVariables(code: string, result: AnalysisResult): void {
        const globalVarRegex = /^\s*[^#\n]*\bglobal\s+\w+/gm;
        let match;
        while ((match = globalVarRegex.exec(code)) !== null) {
            const varName = match[0].match(/global\s+(\w+)/)?.[1];
            if (varName) {
                result.issues.push({
                    message: `Global variable '${varName}' can cause performance issues`,
                    severity: 'medium',
                    line: this.getLineNumber(code, match.index),
                    column: 1,
                    code: 'PY_GLOBAL_VAR'
                });
                
                result.suggestions.push({
                    message: 'Avoid using global variables, pass them as parameters instead',
                    code: `global ${varName}`,
                    explanation: 'Global variables can lead to code that is harder to debug and maintain, and can cause performance issues',
                    estimatedImpact: 15
                });
            }
        }
    }
    
    private checkForInefficientLoops(code: string, result: AnalysisResult): void {
        // Check for range(len()) pattern which is less Pythonic and potentially less efficient
        const rangeLenRegex = /for\s+\w+\s+in\s+range\s*\(\s*len\s*\(/g;
        if (rangeLenRegex.test(code)) {
            result.issues.push({
                message: 'Consider using enumerate() instead of range(len())',
                severity: 'low',
                line: this.getLineNumber(code, rangeLenRegex.lastIndex),
                column: 1,
                code: 'PY_RANGE_LEN_LOOP'
            });
            
            result.suggestions.push({
                message: 'Use enumerate() for more readable and efficient iteration',
                code: 'for i in range(len(items)):',
                replacement: 'for i, item in enumerate(items):',
                explanation: 'enumerate() is more Pythonic and can be more efficient',
                estimatedImpact: 5
            });
        }
        
        // Check for list concatenation in loops
        const listConcatInLoopRegex = /for\s+\w+\s+in\s+\w+\s*:[\s\S]*?\+\s*\[/g;
        if (listConcatInLoopRegex.test(code)) {
            result.issues.push({
                message: 'Avoid using list concatenation in loops as it creates new lists',
                severity: 'medium',
                line: this.getLineNumber(code, listConcatInLoopRegex.lastIndex),
                column: 1,
                code: 'PY_LIST_CONCAT_IN_LOOP'
            });
            
            result.suggestions.push({
                message: 'Use list.extend() or list comprehension instead of list concatenation in loops',
                code: 'result = result + [item]',
                replacement: 'result.append(item)  # or result.extend([item])',
                explanation: 'Using append() or extend() is more memory efficient in loops',
                estimatedImpact: 20
            });
        }
    }
    
    private checkForInefficientDataStructures(code: string, result: AnalysisResult): void {
        // Check for list membership tests which are O(n)
        const listMembershipRegex = /if\s+\w+\s+in\s+\[.*?\]/g;
        if (listMembershipRegex.test(code)) {
            result.issues.push({
                message: 'Consider using a set for membership testing',
                severity: 'medium',
                line: this.getLineNumber(code, listMembershipRegex.lastIndex),
                column: 1,
                code: 'PY_LIST_MEMBERSHIP'
            });
            
            result.suggestions.push({
                message: 'Use a set for O(1) membership testing instead of a list',
                code: 'if x in [1, 2, 3, 4, 5]:',
                replacement: 'if x in {1, 2, 3, 4, 5}:',
                explanation: 'Set membership tests are O(1) vs O(n) for lists',
                estimatedImpact: 15
            });
        }
        
        // Check for string concatenation in loops
        const stringConcatInLoopRegex = /for\s+\w+\s+in\s+\w+\s*:[\s\S]*?\+\s*\w+/g;
        if (stringConcatInLoopRegex.test(code)) {
            result.issues.push({
                message: 'Avoid using string concatenation in loops as it creates new strings',
                severity: 'medium',
                line: this.getLineNumber(code, stringConcatInLoopRegex.lastIndex),
                column: 1,
                code: 'PY_STRING_CONCAT_IN_LOOP'
            });
            
            result.suggestions.push({
                message: 'Use str.join() or f-strings for string building',
                code: 'result = ""\nfor x in items:\n    result += str(x)',
                replacement: 'result = "".join(str(x) for x in items)',
                explanation: 'Using join() is more efficient for building strings in loops',
                estimatedImpact: 25
            });
        }
    }
    
    private calculateScore(result: AnalysisResult): void {
        // Deduct points based on issues found
        const severityScores = {
            high: 25,
            medium: 15,
            low: 5
        };
        
        let totalDeduction = 0;
        for (const issue of result.issues) {
            totalDeduction += severityScores[issue.severity] || 0;
        }
        
        // Add points for suggestions (potential improvements)
        const suggestionBonus = Math.min(result.suggestions.length * 3, 25);
        
        // Calculate final score (0-100)
        result.score = Math.max(0, Math.min(100, 100 - totalDeduction + suggestionBonus));
        
        // Calculate metrics (simplified for this example)
        result.metrics = {
            cpuUsage: 100 - result.score,
            memoryUsage: 100 - result.score,
            estimatedCarbonFootprint: (100 - result.score) * 0.08 // Python is generally more efficient than JS
        };
    }
    
    private getLineNumber(code: string, index: number): number {
        // Simple line number calculation based on newlines
        const lines = code.substring(0, index).split('\n');
        return lines.length;
    }
}
