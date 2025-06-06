// Debug logging
const DEBUG = true;
const log = (message: string, ...args: any[]) => {
    if (DEBUG) {
        console.log(`[GreenCoder] ${message}`, ...args);
    }
};

export interface AnalysisResult {
    score: number;
    issues: Array<{
        message: string;
        severity: 'low' | 'medium' | 'high';
        line: number;
        column: number;
        code: string;
    }>;
    suggestions: Array<{
        message: string;
        code: string;
        replacement?: string;
        explanation: string;
        estimatedImpact: number;
        line?: number;
        currentCode?: string;
        optimizedCode?: string;
    }>;
    metrics: {
        cpuUsage: number;
        memoryUsage: number;
        estimatedCarbonFootprint: number;
    };
}

export function createBaseResult(partial?: Partial<AnalysisResult>): AnalysisResult {
    return {
        score: 100, // Start with a perfect score
        issues: [],
        suggestions: [],
        metrics: {
            cpuUsage: 0,
            memoryUsage: 0,
            estimatedCarbonFootprint: 0
        },
        ...partial
    };
}
