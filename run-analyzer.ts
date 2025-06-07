import * as fs from 'fs';
import * as path from 'path';
import { TypeScriptAnalyzer } from './src/analysis/languages/typescriptAnalyzer';
import { AnalysisResult } from './src/analysis/types';

// Create a test analyzer that exposes the protected method
class TestTypeScriptAnalyzer extends TypeScriptAnalyzer {
    public testAnalyzeCodePatterns(code: string, result: AnalysisResult) {
        return this.analyzeCodePatterns(code, result);
    }
}

// Simple test runner for the TypeScript analyzer
async function runAnalyzer() {
    const testFile = path.join(__dirname, 'comprehensive-test.js');
    
    try {
        // Read the test file
        const code = fs.readFileSync(testFile, 'utf-8');
        
        // Initialize the test analyzer
        const analyzer = new TestTypeScriptAnalyzer();
        const result: AnalysisResult = {
            score: 0,
            issues: [],
            suggestions: [],
            metrics: {
                cpuUsage: 0,
                memoryUsage: 0,
                estimatedCarbonFootprint: 0
            }
        };
        
        // Run the analyzer
        await (analyzer as any).testAnalyzeCodePatterns(code, result);
        
        // Print the results
        console.log('\n=== Analysis Results ===');
        console.log(`Found ${result.issues.length} issues and ${result.suggestions.length} suggestions\n`);
        
        if (result.issues.length > 0) {
            console.log('Issues found:');
            result.issues.forEach((issue, index) => {
                console.log(`\n${index + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
                console.log(`   File: ${testFile}:${issue.line}:${issue.column}`);
                console.log(`   Code: ${issue.code}`);
            });
        }
        
        if (result.suggestions.length > 0) {
            console.log('\nSuggestions:');
            result.suggestions.forEach((suggestion, index) => {
                console.log(`\n${index + 1}. ${suggestion.message}`);
                if (suggestion.currentCode) {
                    console.log('   Current code:');
                    console.log(suggestion.currentCode.split('\n').map(line => `      ${line}`).join('\n'));
                }
                if (suggestion.optimizedCode) {
                    console.log('   Suggested fix:');
                    console.log(suggestion.optimizedCode.split('\n').map(line => `      ${line}`).join('\n'));
                }
                console.log(`   Explanation: ${suggestion.explanation}`);
                console.log(`   Estimated impact: ${suggestion.estimatedImpact || 'N/A'}`);
            });
        }
        
    } catch (error) {
        console.error('Error running analyzer:', error);
    }
}

// Run the analyzer
runAnalyzer().catch(console.error);
