import { AnalysisResult } from '../types';

/**
 * Interface that all language analyzers must implement
 */
export interface LanguageAnalyzer {
    /**
     * Analyzes the given code and returns analysis results
     * @param code The source code to analyze
     * @returns A promise that resolves to the analysis results
     */
    analyze(code: string): Promise<AnalysisResult>;
}
