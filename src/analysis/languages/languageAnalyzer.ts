import { AnalysisResult } from '../../extension';

export abstract class LanguageAnalyzer {
    abstract analyze(code: string): Promise<AnalysisResult>;
    
    protected createBaseResult(): AnalysisResult {
        return {
            score: 100, // Start with a perfect score
            issues: [],
            suggestions: [],
            metrics: {
                cpuUsage: 0,
                memoryUsage: 0,
                estimatedCarbonFootprint: 0
            }
        };
    }
}
