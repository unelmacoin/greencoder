import { AnalysisResult } from '../types';
import { BaseLanguageAnalyzer } from './templateAnalyzer';

export class PythonAnalyzer extends BaseLanguageAnalyzer {
    protected async analyzeCodePatterns(code: string, result: AnalysisResult): Promise<void> {
        // Check for common performance issues in Python
        this.checkForGlobalVariables(code, result);
        this.checkForInefficientLoops(code, result);
        this.checkForInefficientDataStructures(code, result);
    }
    
    private checkForGlobalVariables(code: string, result: AnalysisResult): void {
        const globalVarRegex = /^\s*[^#\n]*\bglobal\s+\w+/gm;
        let match;
        while ((match = globalVarRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            const varName = match[0].match(/global\s+(\w+)/)?.[1];
            if (varName) {
                this.addIssue(
                    result,
                    `Global variable '${varName}' can cause performance issues`,
                    'medium',
                    lineNumber,
                    1,
                    'PY_GLOBAL_VAR'
                );
                
                this.addSuggestion(
                    result,
                    'Avoid using global variables, pass them as parameters instead',
                    `global ${varName}`,
                    `# Pass '${varName}' as a parameter instead of using global`,
                    'Global variables can lead to code that is harder to debug and maintain, and can cause performance issues',
                    15,
                    lineNumber,
                    match[0].trim()
                );
            }
        }
    }
    
    private checkForInefficientLoops(code: string, result: AnalysisResult): void {
        // Check for range(len()) pattern which is less Pythonic and potentially less efficient
        const rangeLenRegex = /for\s+\w+\s+in\s+range\s*\(\s*len\s*\(/g;
        let match;
        
        while ((match = rangeLenRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Consider using enumerate() instead of range(len())',
                'low',
                lineNumber,
                1,
                'PY_RANGE_LEN_LOOP'
            );
            
            this.addSuggestion(
                result,
                'Use enumerate() for more readable and efficient iteration',
                'for i in range(len(items)):',
                'for i, item in enumerate(items):',
                'enumerate() is more Pythonic and can be more efficient',
                5,
                lineNumber
            );
        }
        
        // Check for list concatenation in loops
        const listConcatInLoopRegex = /for\s+\w+\s+in\s+\w+\s*:[\s\S]*?\+\s*\[/g;
        let match2;
        
        while ((match2 = listConcatInLoopRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match2.index);
            this.addIssue(
                result,
                'Avoid using list concatenation in loops as it creates new lists',
                'medium',
                lineNumber,
                1,
                'PY_LIST_CONCAT_IN_LOOP'
            );
            
            this.addSuggestion(
                result,
                'Use list.extend() or list comprehension instead of list concatenation in loops',
                'result = result + [item]',
                'result.append(item)  # or result.extend([item])',
                'Using append() or extend() is more memory efficient in loops',
                20,
                lineNumber
            );
        }
    }
    
    private checkForInefficientDataStructures(code: string, result: AnalysisResult): void {
        // Check for list membership tests which are O(n)
        const listMembershipRegex = /if\s+\w+\s+in\s+\[.*?\]/g;
        let match;
        
        while ((match = listMembershipRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Consider using a set for membership testing',
                'medium',
                lineNumber,
                1,
                'PY_LIST_MEMBERSHIP'
            );
            
            this.addSuggestion(
                result,
                'Use a set for O(1) membership testing instead of a list',
                'if x in [1, 2, 3, 4, 5]:',
                'if x in {1, 2, 3, 4, 5}:',
                'Set membership tests are O(1) vs O(n) for lists',
                15,
                lineNumber
            );
        }
        
        // Check for string concatenation in loops
        const stringConcatInLoopRegex = /for\s+\w+\s+in\s+\w+\s*:[\s\S]*?\+\s*\w+/g;
        let concatMatch;
        
        while ((concatMatch = stringConcatInLoopRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, concatMatch.index);
            this.addIssue(
                result,
                'Avoid string concatenation in loops as it creates new strings',
                'medium',
                lineNumber,
                1,
                'PY_STRING_CONCAT_IN_LOOP'
            );
            
            this.addSuggestion(
                result,
                'Use str.join() or list comprehension for string concatenation in loops',
                'result = ""\nfor x in items:\n    result += x',
                'result = "".join(str(x) for x in items)',
                'Using join() is more memory efficient for string concatenation',
                25,
                lineNumber
            );
        }
    }
    
    protected calculateScore(result: AnalysisResult): void {
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
    
    protected getLineNumber(code: string, index: number): number {
        // Count the number of newlines up to the index
        return code.substring(0, index).split('\n').length;
    }
}
