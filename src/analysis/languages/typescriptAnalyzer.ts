import { AnalysisResult } from '../types';
import { BaseLanguageAnalyzer } from './templateAnalyzer';

export class TypeScriptAnalyzer extends BaseLanguageAnalyzer {
    protected async analyzeCodePatterns(code: string, result: AnalysisResult): Promise<void> {
        this.checkForAnyType(code, result);
        this.checkForImplicitAny(code, result);
        this.checkForConsoleLogs(code, result);
    }
    
    private checkForAnyType(code: string, result: AnalysisResult): void {
        const anyTypeRegex = /:\s*any\b/g;
        let match;
        
        while ((match = anyTypeRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid using "any" type as it bypasses type checking',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'TYPE_SAFETY_ANY'
            );
            
            this.addSuggestion(
                result,
                'Replace "any" with a more specific type',
                match[0],
                '// Replace with proper type instead of "any"',
                'Using specific types improves type safety and IDE support',
                15,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    private checkForImplicitAny(code: string, result: AnalysisResult): void {
        const implicitAnyRegex = /\((\w+)\)\s*:\s*\{\s*\}/g;
        let match;
        
        while ((match = implicitAnyRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                `Implicit any type for parameter '${match[1]}'`,
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'TYPE_SAFETY_IMPLICIT_ANY'
            );
            
            this.addSuggestion(
                result,
                'Add explicit type annotations to function parameters',
                `(${match[1]})`,
                `(${match[1]}: TypeName)`,
                'Explicit types make the code more maintainable and catch errors at compile time',
                10,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    private checkForConsoleLogs(code: string, result: AnalysisResult): void {
        const consoleLogRegex = /console\.(log|warn|error|info|debug)\(/g;
        let match;
        
        while ((match = consoleLogRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                `Avoid using console.${match[1]} in production code`,
                'low',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_CONSOLE_LOG'
            );
            
            this.addSuggestion(
                result,
                'Use a proper logging library instead of console methods',
                `console.${match[1]}('message')`,
                "// Use a logging library like winston or loglevel\n// Example: logger.info('message')",
                'Logging libraries provide better control over log levels and output destinations',
                5,
                lineNumber,
                match[0].trim()
            );
        }
    }
}
