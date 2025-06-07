import { AnalysisResult } from '../types';
import { BaseLanguageAnalyzer } from './templateAnalyzer';

export class TypeScriptAnalyzer extends BaseLanguageAnalyzer {
    protected async analyzeCodePatterns(code: string, result: AnalysisResult): Promise<void> {
        // Type Safety
        this.checkForAnyType(code, result);
        this.checkForImplicitAny(code, result);
        this.checkForNonStrictEquality(code, result);
        this.checkForTypeAssertions(code, result);
        this.checkForUnusedVariables(code, result);
        
        // Performance
        this.checkForInefficientDataFetches(code, result);
        this.checkForInefficientStateUpdates(code, result);
        this.checkForConsoleLogs(code, result);
        this.checkForInefficientLoops(code, result);
        this.checkForInefficientArrayMethods(code, result);
        this.checkForMemoryLeaks(code, result);
        this.checkForExcessiveDOMAccess(code, result);
        this.checkForInefficientStringConcatenation(code, result);
        this.checkForInefficientObjectCloning(code, result);
        this.checkForInefficientRegex(code, result);
        this.checkForInefficientTryCatch(code, result);
        this.checkForInefficientFunctionCalls(code, result);
        this.checkForInefficientEventListeners(code, result);
        this.checkForInefficientTimers(code, result);
        this.checkForInefficientDOMUpdates(code, result);
        this.checkForInefficientJSONOperations(code, result);
        this.checkForInefficientAsyncCode(code, result);
        
        // Memory Management
        this.checkForMemoryLeaksInClosures(code, result);
        this.checkForLargeDataStructures(code, result);
        this.checkForCircularReferences(code, result);
        
        // Network & I/O
        this.checkForUnoptimizedAPICalls(code, result);
        this.checkForUnoptimizedImageLoading(code, result);
        this.checkForUnoptimizedAssetLoading(code, result);
        
        // Best Practices
        this.checkForDeprecatedAPIs(code, result);
        this.checkForUnoptimizedRendering(code, result);
        this.checkForInefficientCSSSelectors(code, result);
        this.checkForUnoptimizedAnimations(code, result);
        this.checkForInefficientStateManagement(code, result);
        this.checkForUnoptimizedBundling(code, result);
        this.checkForInefficientErrorHandling(code, result);
        this.checkForInefficientLogging(code, result);
        this.checkForInefficientDateOperations(code, result);
        this.checkForInefficientMathOperations(code, result);
    }
    
    // Type Safety Checks
    private checkForNonStrictEquality(code: string, result: AnalysisResult): void {
        const looseEqualityRegex = /[^!=]=[^=]|[^!]=[^=]/g;
        let match;
        
        while ((match = looseEqualityRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Use strict equality (===) instead of loose equality (==)',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'TYPE_SAFETY_LOOSE_EQUALITY'
            );
            
            this.addSuggestion(
                result,
                'Replace loose equality with strict equality',
                match[0],
                match[0].replace('==', '===').replace('!=', '!=='),
                'Strict equality is more predictable and performs better',
                5,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    private checkForTypeAssertions(code: string, result: AnalysisResult): void {
        const typeAssertionRegex = /as\s+[\w\[\]{}<>]+/g;
        let match;
        
        while ((match = typeAssertionRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid type assertions as they can hide type errors',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'TYPE_SAFETY_ASSERTION'
            );
            
            this.addSuggestion(
                result,
                'Use type guards or proper type definitions instead of type assertions',
                match[0],
                '// Replace with proper type guard or interface',
                'Type assertions bypass type checking and can lead to runtime errors',
                10,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    private checkForUnusedVariables(code: string, result: AnalysisResult): void {
        // This is a simplified check - a real implementation would need a full AST parser
        const unusedVarsRegex = /const\s+(\w+)\s*=\s*[^;]+;\s*(?:\/\/|\/\*|$)(?!.*\b\1\b)/g;
        let match;
        
        while ((match = unusedVarsRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                `Unused variable '${match[1]}'`,
                'low',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_UNUSED_VAR'
            );
            
            this.addSuggestion(
                result,
                'Remove unused variables to reduce memory usage',
                match[0],
                '// Remove unused variable',
                'Unused variables consume memory and make code harder to maintain',
                3,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    // Performance Checks
    private checkForInefficientDataFetches(code: string, result: AnalysisResult): void {
        // Check for sequential await fetch patterns
        const sequentialFetchPatterns = [
            {
                // Pattern for sequential await fetch calls
                regex: /const\s+\w+\s*=\s*await\s+fetch\([^)]+\)\s*;\s*const\s+\w+\s*=\s*await\s+fetch\([^)]+\)/g,
                message: 'Sequential await fetch calls detected',
                suggestion: 'Consider using Promise.all for parallel requests',
                exampleBefore: 'const user = await fetch("/api/user/1");\nconst posts = await fetch("/api/posts?userId=1");',
                exampleAfter: 'const [user, posts] = await Promise.all([\n  fetch("/api/user/1"),\n  fetch("/api/posts?userId=1")\n]);',
                impact: 15
            },
            {
                // More flexible pattern for sequential fetches
                regex: /(const|let|var)\s+\w+\s*=\s*await\s+fetch\([^)]+\)\s*;[\s\S]*?(const|let|var)\s+\w+\s*=\s*await\s+fetch\([^)]+\)/g,
                message: 'Sequential await fetch calls detected',
                suggestion: 'Consider using Promise.all for parallel requests',
                exampleBefore: 'const user = await fetch("/api/user/1");\n// Some code\nconst posts = await fetch("/api/posts");',
                exampleAfter: 'const [user, posts] = await Promise.all([\n  fetch("/api/user/1"),\n  fetch("/api/posts")\n]);',
                impact: 15
            },
            {
                // Pattern for .then() chains that could be parallelized
                regex: /fetch\([^)]+\)\s*\.then\s*\([^)]*?=>\s*\{\s*return\s+fetch/g,
                message: 'Sequential .then() with fetch calls detected',
                suggestion: 'Consider running fetches in parallel with Promise.all',
                exampleBefore: 'fetch("/api/user/1").then(user => {\n  return fetch(`/api/posts?userId=${user.id}`);\n});',
                exampleAfter: 'Promise.all([\n  fetch("/api/user/1"),\n  fetch("/api/posts")\n]).then(([user, posts]) => {  // Handle both responses\n});',
                impact: 12
            }
        ];

        // Check for sequential fetches using the patterns
        for (const pattern of sequentialFetchPatterns) {
            let match;
            while ((match = pattern.regex.exec(code)) !== null) {
                // Skip if it's already using Promise.all
                if (match[0].includes('Promise.all')) {
                    continue;
                }
                
                const lineNumber = code.substring(0, match.index).split('\n').length;
                
                this.addIssue(
                    result,
                    pattern.message,
                    'high',
                    lineNumber,
                    0,
                    'PERFORMANCE_SEQUENTIAL_FETCH'
                );
                
                this.addSuggestion(
                    result,
                    pattern.suggestion,
                    pattern.exampleBefore,
                    pattern.exampleAfter,
                    'Running requests in parallel can significantly improve performance',
                    pattern.impact,
                    lineNumber,
                    match[0].split('\n')[0].trim()
                );
            }
        }

        for (const pattern of sequentialFetchPatterns) {
            let match;
            while ((match = pattern.regex.exec(code)) !== null) {
                const matchText = match[0];
                const lineNumber = this.getLineNumber(code, match.index);
                
                // Skip if this is actually a Promise.all pattern
                if (matchText.includes('Promise.all') || matchText.includes('Promise.race')) {
                    continue;
                }

                this.addIssue(
                    result,
                    pattern.message,
                    'high',
                    lineNumber,
                    match.index - code.lastIndexOf('\n', match.index) - 1,
                    'PERFORMANCE_SEQUENTIAL_FETCH'
                );
                
                this.addSuggestion(
                    result,
                    pattern.suggestion,
                    pattern.exampleBefore,
                    pattern.exampleAfter,
                    'Running requests in parallel can significantly improve performance',
                    pattern.impact,
                    lineNumber,
                    matchText.trim().split('\n')[0] + '...' // Show first line of the match
                );
            }
        }
    }

    private checkForInefficientStateUpdates(code: string, result: AnalysisResult): void {
        // Patterns to detect multiple state updates that could be batched
        const stateUpdatePatterns = [
            {
                // Class components with this.setState
                regex: /this\.setState\([^;]+;\s*this\.setState\(/g,
                message: 'Multiple setState calls that could be batched',
                suggestion: 'Batch state updates to reduce re-renders',
                exampleBefore: 'this.setState({ loading: true });\nthis.setState({ data: response });',
                exampleAfter: 'this.setState({ \n  loading: true, \n  data: response \n});',
                impact: 12
            },
            {
                // More flexible pattern for multiple setState calls
                regex: /this\.setState\([^;]+;\s*[\s\S]*?this\.setState\(/g,
                message: 'Multiple setState calls that could be batched',
                suggestion: 'Batch state updates to reduce re-renders',
                exampleBefore: 'this.setState({ loading: true });\n// Some code\nthis.setState({ data: response });',
                exampleAfter: 'this.setState({ \n  loading: true, \n  data: response \n});',
                impact: 12
            },
            {
                // Functional components with multiple state setters in sequence
                regex: /(set\w+)\([^;)]+\)\s*;\s*(set\w+)\([^;)]+\)/g,
                message: 'Multiple state updates in quick succession',
                suggestion: 'Combine state updates to reduce re-renders',
                exampleBefore: 'setLoading(true);\nsetData(response);\nsetError(null);',
                exampleAfter: '// Single state update\nsetState(prev => ({\n  ...prev,\n  loading: true,\n  data: response,\n  error: null\n}));',
                impact: 15
            },
            {
                // Multiple useState declarations that could be combined
                regex: /const\s+\[\s*\w+\s*,\s*(set\w+)\s*\]\s*=\s*useState\([^)]*\)\s*;\s*const\s+\[\s*\w+\s*,\s*set\w+\s*\]\s*=\s*useState\([^)]*\)/g,
                message: 'Multiple related state variables that could be combined',
                suggestion: 'Consider combining related state into a single state object',
                exampleBefore: 'const [firstName, setFirstName] = useState("");\nconst [lastName, setLastName] = useState("");',
                exampleAfter: 'const [user, setUser] = useState({\n  firstName: "",\n  lastName: ""\n});',
                impact: 10
            }
        ];

        // Check for state update patterns
        for (const pattern of stateUpdatePatterns) {
            let match;
            while ((match = pattern.regex.exec(code)) !== null) {
                // Skip if it's already using batched updates
                if (match[0].includes('...prev') || match[0].includes('useReducer')) {
                    continue;
                }
                
                const lineNumber = code.substring(0, match.index).split('\n').length;
                
                this.addIssue(
                    result,
                    pattern.message,
                    'medium',
                    lineNumber,
                    0,
                    'PERFORMANCE_MULTIPLE_SETSTATE'
                );
                
                this.addSuggestion(
                    result,
                    pattern.suggestion,
                    pattern.exampleBefore,
                    pattern.exampleAfter,
                    'Batching state updates can reduce the number of re-renders',
                    pattern.impact,
                    lineNumber,
                    match[0].split('\n')[0].trim()
                );
            }
        }

        for (const pattern of stateUpdatePatterns) {
            let match;
            while ((match = pattern.regex.exec(code)) !== null) {
                const matchText = match[0];
                const lineNumber = this.getLineNumber(code, match.index);
                
                // Skip if this is already using state batching or functional updates
                if (matchText.includes('prev =>') || matchText.includes('useReducer')) {
                    continue;
                }

                this.addIssue(
                    result,
                    pattern.message,
                    'medium',
                    lineNumber,
                    match.index - code.lastIndexOf('\n', match.index) - 1,
                    'PERFORMANCE_MULTIPLE_SETSTATE'
                );
                
                this.addSuggestion(
                    result,
                    pattern.suggestion,
                    pattern.exampleBefore,
                    pattern.exampleAfter,
                    'Batching state updates can improve performance by reducing re-renders',
                    pattern.impact,
                    lineNumber,
                    matchText.trim().split('\n')[0] + '...' // Show first line of the match
                );
            }
        }
    }

    private checkForInefficientLoops(code: string, result: AnalysisResult): void {
        // Check for for-in loops with arrays
        const forInWithArrayRegex = /for\s*\(\s*\w+\s+in\s+\w+\s*\)/g;
        let match;
        
        while ((match = forInWithArrayRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid for-in loops with arrays, use for-of or array methods instead',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_FOR_IN_LOOP'
            );
            
            this.addSuggestion(
                result,
                'Replace for-in with for-of or array methods',
                match[0],
                'for (const item of array) {\n  // Your code here\n}',
                'for-in loops are slower and can iterate over prototype chain',
                15,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    private checkForInefficientArrayMethods(code: string, result: AnalysisResult): void {
        // Check for nested array methods that could be combined
        const nestedArrayMethodsRegex = /\.(map|filter|reduce|find|some|every|flatMap|sort)\([^)]*\)\s*\.(map|filter|reduce|find|some|every|flatMap|sort)\(/g;
        let match;
        
        while ((match = nestedArrayMethodsRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid chaining multiple array methods when one would suffice',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_NESTED_ARRAY_METHODS'
            );
            
            this.addSuggestion(
                result,
                'Combine array methods for better performance',
                match[0],
                '// Combine operations in a single method call',
                'Chaining multiple array methods creates intermediate arrays and increases memory usage',
                20,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    private checkForMemoryLeaks(code: string, result: AnalysisResult): void {
        // Check for common memory leak patterns
        const memoryLeakPatterns = [
            { 
                regex: /addEventListener\s*\([^,]+,\s*function\s*\w*\s*\([^)]*\)\s*\{[^}]*this\./g,
                message: 'Event listeners with "this" reference can cause memory leaks',
                suggestion: 'Use arrow functions or bind(this) and remember to remove event listeners',
                code: '// Bad: element.addEventListener(\'click\', function() { this.doSomething(); });\n// Good: const handler = () => this.doSomething();\nelement.addEventListener(\'click\', handler);\n// Later: element.removeEventListener(\'click\', handler);'
            },
            {
                regex: /set(Interval|Timeout)\s*\([^,]+,\s*\d+\)/g,
                message: 'setInterval/setTimeout without cleanup can cause memory leaks',
                suggestion: 'Always clear intervals/timeouts when components unmount',
                code: 'const timer = setInterval(() => {}, 1000);\n// Later: clearInterval(timer);'
            }
        ];
        
        memoryLeakPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.regex.exec(code)) !== null) {
                const lineNumber = this.getLineNumber(code, match.index);
                this.addIssue(
                    result,
                    pattern.message,
                    'high',
                    lineNumber,
                    match.index - code.lastIndexOf('\n', match.index) - 1,
                    'MEMORY_LEAK_PATTERN'
                );
                
                this.addSuggestion(
                    result,
                    pattern.suggestion,
                    match[0],
                    pattern.code,
                    'Memory leaks can degrade performance over time',
                    25,
                    lineNumber,
                    match[0].trim()
                );
            }
        });
    }
    
    private checkForExcessiveDOMAccess(code: string, result: AnalysisResult): void {
        // Check for repeated DOM access in loops
        const domAccessInLoopRegex = /(for\s*\([^;]+;\s*[^;]*;\s*[^)]*\)|while\s*\([^)]*\)|do\s*\{[^}]*\}\s*while\s*\([^)]*\))\s*\{[^}]*document\.(getElementById|querySelector|getElementsByClassName|getElementsByTagName)/g;
        let match;
        
        while ((match = domAccessInLoopRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid DOM access inside loops',
                'high',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_DOM_ACCESS_IN_LOOP'
            );
            
            this.addSuggestion(
                result,
                'Cache DOM elements before the loop',
                match[0],
                '// Cache elements before the loop\nconst elements = document.querySelectorAll(\'.some-class\');\nfor (const element of elements) {\n  // Your code here\n}',
                'Repeated DOM access is expensive and can cause layout thrashing',
                20,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    private checkForInefficientStringConcatenation(code: string, result: AnalysisResult): void {
        // Check for string concatenation in loops
        const stringConcatInLoopRegex = /(for\s*\([^;]+;\s*[^;]*;\s*[^)]*\)|while\s*\([^)]*\)|do\s*\{[^}]*\}\s*while\s*\([^)]*\))\s*\{[^}]*\+=\s*['"][^'"]*['"]/g;
        let match;
        
        while ((match = stringConcatInLoopRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid string concatenation in loops',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_STRING_CONCAT_IN_LOOP'
            );
            
            this.addSuggestion(
                result,
                'Use array.join() or template literals for better performance',
                'let result = \'\';\nfor (let i = 0; i < 10; i++) {\n  result += i + \',\';\n}',
                'const result = [];\nfor (let i = 0; i < 10; i++) {\n  result.push(i);\n}\nconst finalString = result.join(\',\');',
                'String concatenation in loops creates many temporary strings',
                15,
                lineNumber,
                'let result = \'\';\nfor (let i = 0; i < 10; i++) {\n  result += i + \',\';\n}'
            );
        }
    }
    
    private checkForInefficientObjectCloning(code: string, result: AnalysisResult): void {
        // Check for Object.assign({}, ...) and spread operator for deep cloning
        const objectCloneRegex = /(Object\.assign\(\{\s*\},?|{\s*\.\.\.)\s*\w+\s*([,\s]|$)/g;
        let match;
        
        while ((match = objectCloneRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Shallow object cloning can lead to reference bugs',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_SHALLOW_CLONE'
            );
            
            this.addSuggestion(
                result,
                'Use structuredClone() for deep cloning or be aware of shallow copy limitations',
                'const newObj = Object.assign({}, oldObj);',
                '// For deep cloning (modern browsers/Node.js 17+):\nconst newObj = structuredClone(oldObj);\n\n// Or for shallow clone with prototype:\nconst newObj = Object.create(Object.getPrototypeOf(oldObj),\n  Object.getOwnPropertyDescriptors(oldObj));',
                'Shallow cloning can cause subtle bugs with nested objects',
                15,
                lineNumber,
                'const newObj = Object.assign({}, oldObj);'
            );
        }
    }
    
    private checkForInefficientRegex(code: string, result: AnalysisResult): void {
        // Check for regex literals in loops
        const regexInLoopRegex = /(for\s*\([^;]+;\s*[^;]*;\s*[^)]*\)|while\s*\([^)]*\)|do\s*\{[^}]*\}\s*while\s*\([^)]*\))\s*\{[^}]*\/[^/]+\/[a-z]*\s*[^;]*[;}]/g;
        let match;
        
        while ((match = regexInLoopRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid creating regex literals in loops',
                'high',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_REGEX_IN_LOOP'
            );
            
            this.addSuggestion(
                result,
                'Define regex patterns outside loops and reuse them',
                'for (let i = 0; i < 10; i++) {\n  const match = /[a-z]+/.test(text);\n}',
                'const regex = /[a-z]+/;\nfor (let i = 0; i < 10; i++) {\n  const match = regex.test(text);\n}',
                'Recreating regex objects in loops is inefficient',
                20,
                lineNumber,
                'for (let i = 0; i < 10; i++) {\n  const match = /[a-z]+/.test(text);\n}'
            );
        }
        
        // Check for catastrophic backtracking patterns
        const catastrophicRegex = /\([^)]*\+\+[^)]*\)|\{[^}]*,\s*\}/g;
        while ((match = catastrophicRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Potential catastrophic backtracking in regex',
                'high',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_CATASTROPHIC_REGEX'
            );
            
            this.addSuggestion(
                result,
                'Refactor regex to avoid nested quantifiers',
                match[0],
                '// Example: Replace (a+)+ with a+',
                'Nested quantifiers can cause exponential time complexity',
                30,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    private checkForInefficientTryCatch(code: string, result: AnalysisResult): void {
        // Check for try-catch in performance-critical code
        const tryCatchInLoopRegex = /(for\s*\([^;]+;\s*[^;]*;\s*[^)]*\)|while\s*\([^)]*\)|do\s*\{[^}]*\}\s*while\s*\([^)]*\))\s*\{[^}]*try\s*\{[^}]*\}\s*catch\s*\([^)]*\)/g;
        let match;
        
        while ((match = tryCatchInLoopRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid try-catch in performance-critical loops',
                'high',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_TRY_CATCH_IN_LOOP'
            );
            
            this.addSuggestion(
                result,
                'Move try-catch outside the loop or validate inputs before the loop',
                'for (let i = 0; i < array.length; i++) {\n  try {\n    // Code that might throw\n  } catch (e) {\n    // Handle error\n  }\n}',
                'try {\n  for (let i = 0; i < array.length; i++) {\n    // Code that might throw\n  }\n} catch (e) {\n  // Handle error\n}',
                'Try-catch blocks in loops can hurt performance in V8',
                25,
                lineNumber,
                'for (let i = 0; i < array.length; i++) {\n  try {\n    // Code\n  } catch (e) {\n    // Handle error\n  }\n}'
            );
        }
    }
    
    private checkForInefficientFunctionCalls(code: string, result: AnalysisResult): void {
        // Check for function calls in loops that could be hoisted
        const functionCallInLoopRegex = /(for\s*\([^;]+;\s*[^;]*;\s*[^)]*\)|while\s*\([^)]*\)|do\s*\{[^}]*\}\s*while\s*\([^)]*\))\s*\{[^}]*\([^)]*\)\s*[;}]/g;
        let match;
        
        while ((match = functionCallInLoopRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid function calls in loops when possible',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_FUNCTION_CALL_IN_LOOP'
            );
            
            this.addSuggestion(
                result,
                'Cache function results outside the loop when possible',
                'for (let i = 0; i < array.length; i++) {\n  const result = someHeavyFunction();\n  // ...\n}',
                'const cachedResult = someHeavyFunction();\nfor (let i = 0; i < array.length; i++) {\n  // Use cachedResult\n  // ...\n}',
                'Repeated function calls in loops can be expensive',
                15,
                lineNumber,
                'for (let i = 0; i < array.length; i++) {\n  const result = someHeavyFunction();\n  // ...\n}'
            );
        }
    }
    
    private checkForInefficientEventListeners(code: string, result: AnalysisResult): void {
        // Check for multiple event listeners that could use event delegation
        const multipleListenersRegex = /document\.(getElementById|querySelector|getElementsByClassName|getElementsByTagName)\([^)]+\)\.addEventListener\([^,]+,\s*[^,]+/g;
        let match;
        
        while ((match = multipleListenersRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Consider using event delegation for multiple similar elements',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_MULTIPLE_EVENT_LISTENERS'
            );
            
            this.addSuggestion(
                result,
                'Use event delegation to reduce the number of event listeners',
                'document.querySelectorAll(\'.btn\').forEach(btn => {\n  btn.addEventListener(\'click\', handleClick);\n});',
                'document.addEventListener(\'click\', (e) => {\n  if (e.target.matches(\'.btn\')) {\n    handleClick(e);\n  }\n});',
                'Event delegation reduces memory usage and improves performance',
                20,
                lineNumber,
                'document.querySelectorAll(\'.btn\').forEach(btn => {\n  btn.addEventListener(\'click\', handleClick);\n});'
            );
        }
    }
    
    private checkForInefficientTimers(code: string, result: AnalysisResult): void {
        // Check for setTimeout/setInterval with string evaluation
        const timerWithStringRegex = /set(Timeout|Interval)\s*\(\s*['"][^'"]+['"]/g;
        let match;
        
        while ((match = timerWithStringRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid passing strings to setTimeout/setInterval',
                'high',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_STRING_TIMER'
            );
            
            this.addSuggestion(
                result,
                'Pass a function reference instead of a string',
                'setTimeout(\'alert(\"Hello\")\', 1000);',
                'setTimeout(() => { alert(\"Hello\"); }, 1000);',
                'String evaluation in timers is slow and a security risk',
                15,
                lineNumber,
                match[0].trim()
            );
        }
        
        // Check for recursive setTimeout when setInterval would be more appropriate
        const recursiveSetTimeoutRegex = /function\s+\w+\s*\([^)]*\)\s*\{[^}]*setTimeout\s*\(\s*\w+\s*,\s*\d+\s*\)/g;
        while ((match = recursiveSetTimeoutRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Consider using setInterval instead of recursive setTimeout',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_RECURSIVE_TIMEOUT'
            );
            
            this.addSuggestion(
                result,
                'Use setInterval for repeated execution at fixed intervals',
                'function poll() {\n  // Do something\n  setTimeout(poll, 1000);\n}\npoll();',
                'const intervalId = setInterval(() => {\n  // Do something\n}, 1000);\n// Later: clearInterval(intervalId);',
                'setInterval is more efficient for repeated execution at fixed intervals',
                10,
                lineNumber,
                'function poll() {\n  // Do something\n  setTimeout(poll, 1000);\n}\npoll();'
            );
        }
    }
    
    private checkForInefficientDOMUpdates(code: string, result: AnalysisResult): void {
        // Check for multiple DOM updates that could be batched
        const multipleDOMUpdatesRegex = /(?:document|element)\.(?:innerHTML|style\.\w+|setAttribute|classList\.(?:add|remove|toggle)|appendChild|insertBefore|replaceChild|removeChild)[^;]*(?:;|$).*?(?:document|element)\.(?:innerHTML|style\.\w+|setAttribute|classList\.(?:add|remove|toggle)|appendChild|insertBefore|replaceChild|removeChild)/g;
        let match;
        
        while ((match = multipleDOMUpdatesRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Batch multiple DOM updates to reduce reflows',
                'high',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_MULTIPLE_DOM_UPDATES'
            );
            
            this.addSuggestion(
                result,
                'Use DocumentFragment or requestAnimationFrame to batch DOM updates',
                'element1.style.color = \'red\';\nelement2.style.color = \'blue\';',
                '// Using requestAnimationFrame\nrequestAnimationFrame(() => {\n  element1.style.color = \'red\';\n  element2.style.color = \'blue\';\n});\n\n// Or using DocumentFragment\nconst fragment = document.createDocumentFragment();\n// Append elements to fragment\ndocument.body.appendChild(fragment);',
                'Batching DOM updates reduces reflows and improves performance',
                25,
                lineNumber,
                'element1.style.color = \'red\';\nelement2.style.color = \'blue\';'
            );
        }
        
        // Check for forced synchronous layouts
        const forcedLayoutRegex = /(?:offset|scroll|client)(?:Width|Height|Top|Left|Right|Bottom)[^=]*=[^=]|getComputedStyle\s*\([^)]+\)[^;]*\.(?:width|height|top|left|right|bottom)/g;
        while ((match = forcedLayoutRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid forced synchronous layouts',
                'high',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_FORCED_LAYOUT'
            );
            
            this.addSuggestion(
                result,
                'Batch layout reads and writes to avoid forced synchronous layouts',
                'const width = element.offsetWidth;\nelement.style.width = (width + 10) + \'px\';',
                '// Read first, then write\nconst width = element.offsetWidth;\nrequestAnimationFrame(() => {\n  element.style.width = (width + 10) + \'px\';\n});',
                'Forced layouts can cause significant performance issues',
                30,
                lineNumber,
                'const width = element.offsetWidth;\nelement.style.width = (width + 10) + \'px\';'
            );
        }
    }
    
    private checkForInefficientJSONOperations(code: string, result: AnalysisResult): void {
        // Check for JSON.parse/stringify in loops
        const jsonInLoopRegex = /(for\s*\([^;]+;\s*[^;]*;\s*[^)]*\)|while\s*\([^)]*\)|do\s*\{[^}]*\}\s*while\s*\([^)]*\))\s*\{[^}]*JSON\.(parse|stringify)\s*\([^)]*\)/g;
        let match;
        
        while ((match = jsonInLoopRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid JSON.parse/stringify in performance-critical code',
                'high',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_JSON_IN_LOOP'
            );
            
            this.addSuggestion(
                result,
                'Cache JSON operations outside loops when possible',
                'for (let i = 0; i < data.length; i++) {\n  const obj = JSON.parse(data[i]);\n  // ...\n}',
                'const parsedData = data.map(item => JSON.parse(item));\nfor (let i = 0; i < parsedData.length; i++) {\n  const obj = parsedData[i];\n  // ...\n}',
                'JSON operations are expensive and should be minimized in loops',
                20,
                lineNumber,
                'for (let i = 0; i < data.length; i++) {\n  const obj = JSON.parse(data[i]);\n  // ...\n}'
            );
        }
        
        // Check for deep cloning using JSON.parse(JSON.stringify())
        const jsonDeepCloneRegex = /JSON\.parse\s*\(\s*JSON\.stringify\s*\([^)]*\)\s*\)/g;
        while ((match = jsonDeepCloneRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid using JSON.parse(JSON.stringify()) for deep cloning',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_JSON_DEEP_CLONE'
            );
            
            this.addSuggestion(
                result,
                'Use structuredClone() or a proper deep clone function',
                'const copy = JSON.parse(JSON.stringify(obj));',
                '// Modern browsers/Node.js 17+\nconst copy = structuredClone(obj);\n\n// Or use a library like lodash\n// import { cloneDeep } from \'lodash\';\n// const copy = cloneDeep(obj);',
                'JSON.parse(JSON.stringify()) is slow and loses some data types',
                15,
                lineNumber,
                'const copy = JSON.parse(JSON.stringify(obj));'
            );
        }
    }
    
    private checkForInefficientAsyncCode(code: string, result: AnalysisResult): void {
        // Check for sequential awaits that could be parallelized
        const sequentialAwaitsRegex = /await\s+\w+\s*;\s*await\s+\w+/g;
        let match;
        
        while ((match = sequentialAwaitsRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Consider running independent async operations in parallel',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_SEQUENTIAL_AWAITS'
            );
            
            this.addSuggestion(
                result,
                'Use Promise.all() to run independent async operations in parallel',
                'const user = await getUser();\nconst posts = await getPosts();',
                'const [user, posts] = await Promise.all([\n  getUser(),\n  getPosts()\n]);',
                'Running independent async operations in parallel can significantly improve performance',
                25,
                lineNumber,
                'const user = await getUser();\nconst posts = await getPosts();'
            );
        }
        
        // Check for unnecessary async/await
        const unnecessaryAwaitRegex = /async\s+function\s+\w+\s*\([^)]*\)\s*\{[^}]*(?<!await\s+)(?:\breturn\s+)?\w+\s*\([^)]*\)(?!\s*\.\s*then\b|\s*;?\s*\/\/\s*async)/g;
        while ((match = unnecessaryAwaitRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid unnecessary async/await when not needed',
                'low',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_UNNECESSARY_ASYNC'
            );
            
            this.addSuggestion(
                result,
                'Remove async/await when not needed',
                'async function getUserData() {\n  return fetchData();\n}',
                'function getUserData() {\n  return fetchData();\n}',
                'Unnecessary async/await adds overhead and makes the code harder to reason about',
                5,
                lineNumber,
                'async function getUserData() {\n  return fetchData();\n}'
            );
        }
    }
    
    private checkForInefficientCSSSelectors(code: string, result: AnalysisResult): void {
        // Check for inefficient CSS selectors in JavaScript code
        const inefficientCSSSelectors = [
            {
                regex: /querySelector\(['"]\s*\*\s*['"]\)/g,
                message: 'Avoid using the universal selector (*) in querySelector',
                suggestion: 'Use more specific selectors to improve performance',
                code: 'document.querySelector(\'*\');',
                fixed: 'document.querySelector(\'.specific-class\');',
                impact: 15
            },
            {
                regex: /querySelector\(['"]([^\w\-\s#.>+~:[])[^'"\]]*\)/g,
                message: 'Avoid complex CSS selectors in JavaScript',
                suggestion: 'Use simpler selectors or add specific class names',
                code: 'document.querySelector(\'div.container > ul li:first-child a[href^="https"]\');',
                fixed: 'document.querySelector(\'.primary-link\');',
                impact: 20
            },
            {
                regex: /getElement(?:sBy(?:ClassName|TagName|Name)|ById)\s*\(/g,
                message: 'Prefer querySelector/querySelectorAll over older DOM methods',
                suggestion: 'Use querySelector/querySelectorAll for better performance and consistency',
                code: 'document.getElementsByClassName(\'item\');',
                fixed: 'document.querySelectorAll(\'.item\');',
                impact: 10
            }
        ];
        
        inefficientCSSSelectors.forEach(pattern => {
            let match;
            while ((match = pattern.regex.exec(code)) !== null) {
                const lineNumber = this.getLineNumber(code, match.index);
                this.addIssue(
                    result,
                    pattern.message,
                    'medium',
                    lineNumber,
                    match.index - code.lastIndexOf('\n', match.index) - 1,
                    'PERFORMANCE_INEFFICIENT_CSS_SELECTOR'
                );
                
                this.addSuggestion(
                    result,
                    pattern.suggestion,
                    pattern.code,
                    pattern.fixed,
                    'Inefficient CSS selectors can slow down DOM operations',
                    pattern.impact,
                    lineNumber,
                    match[0].trim()
                );
            }
        });
    }
    
    private checkForInefficientLogging(code: string, result: AnalysisResult): void {
        // Check for console.log in production code
        const consoleLogRegex = /console\.(log|warn|error|info|debug|time|timeEnd|trace|group|groupEnd|table|dir|dirxml|assert|count|countReset|groupCollapsed|profile|profileEnd|timeLog|timeStamp)\s*\(/g;
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
                'Use a proper logging library with log levels',
                `console.${match[1]}('message', data);`,
                '// Example with a logging library\nimport { logger } from \'logging-library\';\nlogger.info(\'message\', { data });',
                'Logging libraries provide better control over log levels and output destinations',
                10,
                lineNumber,
                match[0].trim()
            );
        }
        
        // Check for expensive operations in logging
        const expensiveLoggingRegex = /console\.(?:log|warn|error|info|debug)\([^)]*\$\{.*\}[^)]*\)/g;
        while ((match = expensiveLoggingRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid expensive operations in console.log',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_EXPENSIVE_LOGGING'
            );
            
            this.addSuggestion(
                result,
                'Use a guard clause to prevent expensive operations in production',
                'console.log(`User: ${JSON.stringify(user, null, 2)}`);',
                'if (process.env.NODE_ENV === \'development\') {\n  console.log(\'User:\', user);\n}',
                'Expensive operations in logging can impact performance even when logs are not shown',
                15,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    private checkForInefficientDateOperations(code: string, result: AnalysisResult): void {
        // Check for new Date() in loops
        const dateInLoopRegex = /(for\s*\([^;]+;\s*[^;]*;\s*[^)]*\)|while\s*\([^)]*\)|do\s*\{[^}]*\}\s*while\s*\([^)]*\))\s*\{[^}]*new\s+Date\s*\([^)]*\)/g;
        let match;
        
        while ((match = dateInLoopRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid creating new Date objects in loops',
                'high',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_DATE_IN_LOOP'
            );
            
            this.addSuggestion(
                result,
                'Create Date objects outside the loop when possible',
                'for (let i = 0; i < 1000; i++) {\n  const now = new Date();\n  // ...\n}',
                'const now = new Date();\nfor (let i = 0; i < 1000; i++) {\n  // Use now or now.getTime()\n  // ...\n}',
                'Creating Date objects is expensive and should be avoided in loops',
                20,
                lineNumber,
                'for (let i = 0; i < 1000; i++) {\n  const now = new Date();\n  // ...\n}'
            );
        }
        
        // Check for inefficient date parsing
        const dateParseRegex = /Date\.parse\s*\([^)]+\)/g;
        while ((match = dateParseRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid using Date.parse() for string parsing',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_DATE_PARSE'
            );
            
            this.addSuggestion(
                result,
                'Use a library like date-fns or moment.js for reliable date parsing',
                'const timestamp = Date.parse(\'2023-01-01\');',
                '// Using date-fns\nimport { parseISO } from \'date-fns\';\nconst date = parseISO(\'2023-01-01\');\nconst timestamp = date.getTime();',
                'Date.parse() has inconsistent behavior across browsers',
                15,
                lineNumber,
                'const timestamp = Date.parse(\'2023-01-01\');'
            );
        }
    }
    
    private checkForInefficientMathOperations(code: string, result: AnalysisResult): void {
        // Check for Math.pow() when ** operator could be used
        const mathPowRegex = /Math\.pow\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)/g;
        let match;
        
        while ((match = mathPowRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Use the exponentiation operator (**) instead of Math.pow()',
                'low',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_MATH_POW'
            );
            
            this.addSuggestion(
                result,
                'Replace Math.pow() with the ** operator',
                `Math.pow(${match[1]}, ${match[2]})`,
                `${match[1]} ** ${match[2]}`,
                'The ** operator is more concise and can be optimized better by JavaScript engines',
                5,
                lineNumber,
                match[0].trim()
            );
        }
        
        // Check for unnecessary Math operations
        const unnecessaryMathRegex = /Math\.(abs|floor|ceil|round|trunc)\(\s*\d+\s*\)/g;
        while ((match = unnecessaryMathRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                `Unnecessary Math.${match[1]}() with a constant value`,
                'low',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_UNNECESSARY_MATH'
            );
            
            this.addSuggestion(
                result,
                'Calculate the value at compile time',
                match[0],
                eval(match[0]).toString(),
                'Constant expressions can be calculated at compile time',
                3,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    private checkForAnyType(code: string, result: AnalysisResult): void {
        const anyTypeRegex = /:\s*any\b/g;
        let match;
        
        while ((match = anyTypeRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid using the "any" type',
                'high',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'TYPE_SAFETY_ANY'
            );
            
            this.addSuggestion(
                result,
                'Use a more specific type instead of "any"',
                'let data: any;',
                'let data: SpecificType;',
                'Using "any" disables type checking for that variable',
                10,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    private checkForImplicitAny(code: string, result: AnalysisResult): void {
        // This is a simplified check - a real implementation would need a full TypeScript parser
        const implicitAnyRegex = /function\s+\w+\s*\([^:)]+\)|const\s+\w+\s*=\s*\([^:)]+\)\s*=>/g;
        let match;
        
        while ((match = implicitAnyRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Function parameters should have explicit types',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'TYPE_SAFETY_IMPLICIT_ANY'
            );
            
            this.addSuggestion(
                result,
                'Add explicit parameter types',
                'function process(data) { ... }',
                'function process(data: ProcessData): void { ... }',
                'Implicit any types can lead to type-related bugs',
                8,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    private checkForConsoleLogs(code: string, result: AnalysisResult): void {
        const consoleLogRegex = /console\.(log|warn|error|info|debug|time|timeEnd|trace|group|groupEnd|table|dir|dirxml|assert|count|countReset|groupCollapsed|profile|profileEnd|timeLog|timeStamp)\s*\(/g;
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
                'Use a proper logging library with log levels',
                `console.${match[1]}('message', data);`,
                '// Example with a logging library\nimport { logger } from \'logging-library\';\nlogger.info(\'message\', { data });',
                'Logging libraries provide better control over log levels and output destinations',
                10,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    private checkForInefficientErrorHandling(code: string, result: AnalysisResult): void {
        // Check for empty catch blocks
        const emptyCatchRegex = /catch\s*\(\s*\w*\s*\)\s*\{\s*\}/g;
        let match;
        
        while ((match = emptyCatchRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Avoid empty catch blocks',
                'high',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'ERROR_HANDLING_EMPTY_CATCH'
            );
            
            this.addSuggestion(
                result,
                'Handle or log the error properly',
                'try {\n  // Code that might throw\n} catch (e) {}',
                'try {\n  // Code that might throw\n} catch (e) {\n  console.error(\'Error occurred\', e);\n  // Or handle the error appropriately\n}',
                'Empty catch blocks can hide errors and make debugging difficult',
                15,
                lineNumber,
                'try {\n  // Code that might throw\n} catch (e) {}'
            );
        }
    }

    // Memory Management Checks
    private checkForMemoryLeaksInClosures(code: string, result: AnalysisResult): void {
        // Look for closures that might cause memory leaks by capturing large objects
        const closureRegex = /function\s*\w*\s*\([^)]*\)\s*\{[^}]*\b(?:document|window|this)\.[^=]*\s*=\s*function/g;
        let match;
        
        while ((match = closureRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Potential memory leak in closure',
                'high',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'MEMORY_LEAK_CLOSURE'
            );
            
            this.addSuggestion(
                result,
                'Avoid memory leaks in closures',
                'function createClosure() {\n  const largeObject = getLargeObject();\n  return function() {\n    // Using largeObject here\n  };\n}',
                'function createClosure() {\n  const largeObject = getLargeObject();\n  // Process data when the closure is created\n  const processedData = processData(largeObject);\n  // Clean up the large object\n  largeObject = null;\n  return function() {\n    // Use processedData instead of largeObject\n  };\n}',
                'Closures that capture large objects can cause memory leaks. Process data when the closure is created and clean up references.',
                15,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    private checkForLargeDataStructures(code: string, result: AnalysisResult): void {
        // Look for large array or object literals that could impact performance
        const largeDataRegex = /(?:\[|\{)[\s\S]{500,}?(?:\]|\})/g;
        let match;
        
        while ((match = largeDataRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Large data structure detected in code',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_LARGE_DATA_STRUCTURE'
            );
            
            this.addSuggestion(
                result,
                'Move large data structures to separate files',
                'const largeData = [/* thousands of items */];',
                '// Import from a separate file\nimport { largeData } from \'./data/largeData\';',
                'Large data structures in code can increase bundle size and memory usage. Consider loading them asynchronously or using a database.',
                10,
                lineNumber,
                match[0].substring(0, 100) + '...' // Show just the beginning
            );
        }
    }
    
    private checkForCircularReferences(code: string, result: AnalysisResult): void {
        // Look for circular references in object literals
        const circularRefRegex = /(\w+)\s*:\s*\{\s*[^}]*\b\1\b[^}]*\}/g;
        let match;
        
        while ((match = circularRefRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Potential circular reference detected',
                'high',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'MEMORY_CIRCULAR_REFERENCE'
            );
            
            this.addSuggestion(
                result,
                'Avoid circular references in objects',
                'const obj = {\n  child: { parent: obj }\n};',
                '// Use a reference by ID instead\nconst obj = { id: 1 };\nconst child = { parentId: obj.id };',
                'Circular references can cause memory leaks and issues with JSON serialization. Consider using references by ID instead.',
                12,
                lineNumber,
                match[0].trim()
            );
        }
    }

    // Network & I/O Checks
    private checkForUnoptimizedAPICalls(code: string, result: AnalysisResult): void {
        // Look for API calls without proper error handling or cancellation
        const apiCallRegex = /(?:fetch|\.(?:get|post|put|delete|patch))\([^)]*\)(?!\s*\.catch\()/g;
        let match;
        
        while ((match = apiCallRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'API call without proper error handling',
                'high',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'NETWORK_UNHANDLED_API_CALL'
            );
            
            this.addSuggestion(
                result,
                'Add error handling to API calls',
                'fetch(url).then(response => response.json())',
                'fetch(url)\n  .then(response => response.json())\n  .catch(error => console.error(\'API call failed:\', error))\n  .finally(() => setLoading(false));',
                'Always handle potential errors in API calls to prevent uncaught promise rejections and provide better user feedback.',
                15,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    private checkForUnoptimizedImageLoading(code: string, result: AnalysisResult): void {
        // Look for image loading without optimization
        const imgTagRegex = /<img\s+[^>]*src=(['"])(?!.*\.svg\1)[^'"]*\.(?:jpg|jpeg|png|webp|gif|avif)\1[^>]*>/gi;
        let match;
        
        while ((match = imgTagRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Unoptimized image loading detected',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_UNOPTIMIZED_IMAGE'
            );
            
            this.addSuggestion(
                result,
                'Optimize image loading',
                '<img src="/images/photo.jpg" alt="Photo">',
                '<img \n  src="/images/photo.jpg" \n  srcSet="/images/photo-320w.jpg 320w, /images/photo-640w.jpg 640w"\n  sizes="(max-width: 600px) 100vw, 50vw"\n  alt="Photo"\n  loading="lazy"\n  decoding="async">',
                'Use modern image formats, responsive images with srcset, and lazy loading to improve performance.',
                10,
                lineNumber,
                match[0].trim()
            );
        }
    }
    
    private checkForUnoptimizedAssetLoading(code: string, result: AnalysisResult): void {
        // Look for unoptimized asset loading (CSS, JS, fonts, etc.)
        const assetRegex = /<link\s+[^>]*(?:rel=(['"])stylesheet\1|href=(['"]).*\.(?:css|js|woff2?|eot|ttf|otf)\2)[^>]*>/gi;
        let match;
        
        while ((match = assetRegex.exec(code)) !== null) {
            const lineNumber = this.getLineNumber(code, match.index);
            this.addIssue(
                result,
                'Potentially unoptimized asset loading',
                'medium',
                lineNumber,
                match.index - code.lastIndexOf('\n', match.index) - 1,
                'PERFORMANCE_UNOPTIMIZED_ASSET'
            );
            
            this.addSuggestion(
                result,
                'Optimize asset loading',
                '<link rel="stylesheet" href="styles.css">',
                '<link \n  rel="preload" \n  href="styles.css" \n  as="style" \n  onload="this.onload=null;this.rel=\'stylesheet\'"\n>\n<noscript><link rel="stylesheet" href="styles.css"></noscript>',
                'Use resource hints like preload, preconnect, and preload for critical assets. Defer non-critical CSS and JavaScript.',
                10,
                lineNumber,
                match[0].trim()
            );
        }
    }

    // Best Practice Checks
    private checkForDeprecatedAPIs(code: string, result: AnalysisResult): void {
        // Look for deprecated APIs and methods
        const deprecatedApis = [
            { regex: /\.(getContext|createElement)\s*\([^)]*['"]webgl\b/g, name: 'WebGL 1.0' },
            { regex: /\.(createObjectURL|revokeObjectURL)\s*\(/g, name: 'URL.createObjectURL' },
            { regex: /\.(showModalDialog|attachEvent|createContextualFragment|createEventObject)\s*\(/g, name: 'Legacy API' },
            { regex: /document\.(write|writeln|open|close)\(/g, name: 'document.write' },
            { regex: /\b(?:componentWillMount|componentWillReceiveProps|UNSAFE_)\w*\b/g, name: 'Legacy React Lifecycle' }
        ];

        deprecatedApis.forEach(api => {
            let match;
            while ((match = api.regex.exec(code)) !== null) {
                const lineNumber = this.getLineNumber(code, match.index);
                this.addIssue(
                    result,
                    `Deprecated API usage: ${api.name}`,
                    'high',
                    lineNumber,
                    match.index - code.lastIndexOf('\n', match.index) - 1,
                    'DEPRECATED_API_USAGE'
                );
                
                this.addSuggestion(
                    result,
                    `Update deprecated ${api.name} API usage`,
                    match[0],
                    '// Check documentation for modern alternatives',
                    'Deprecated APIs may be removed in future versions and often have better, more secure alternatives.',
                    15,
                    lineNumber,
                    match[0].trim()
                );
            }
        });
    }
    
    private checkForUnoptimizedRendering(code: string, result: AnalysisResult): void {
        // Look for common rendering performance issues
        const renderingPatterns = [
            { 
                regex: /(?:document\.createElement|innerHTML\s*\+=|insertAdjacentHTML)\s*\([^)]*['"](?:<tr|<td|<option)/g, 
                name: 'Inefficient DOM updates',
                suggestion: 'Use document fragments or template literals for batch updates'
            },
            { 
                regex: /(?:offset|scroll|client)(?:Width|Height|Top|Left)\s*[^=!]=[^=]/g, 
                name: 'Forced synchronous layout',
                suggestion: 'Batch reads and writes to layout properties to avoid layout thrashing'
            },
            {
                regex: /\b(?:getComputedStyle|getBoundingClientRect|offsetWidth|scrollHeight|clientHeight)\s*\(/g,
                name: 'Expensive layout calculations',
                suggestion: 'Cache layout values and avoid in loops or animation frames'
            }
        ];

        renderingPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.regex.exec(code)) !== null) {
                const lineNumber = this.getLineNumber(code, match.index);
                this.addIssue(
                    result,
                    `Potential rendering performance issue: ${pattern.name}`,
                    'high',
                    lineNumber,
                    match.index - code.lastIndexOf('\n', match.index) - 1,
                    'PERFORMANCE_RENDERING_ISSUE'
                );
                
                this.addSuggestion(
                    result,
                    `Optimize rendering: ${pattern.name}`,
                    match[0],
                    `// ${pattern.suggestion}`,
                    'Optimizing rendering performance improves user experience and reduces energy consumption.',
                    12,
                    lineNumber,
                    match[0].trim()
                );
            }
        });
    }
    
    private checkForUnoptimizedAnimations(code: string, result: AnalysisResult): void {
        // Look for animations that might cause jank
        const animationPatterns = [
            { 
                regex: /setInterval\s*\([^,)]*,\s*16\s*[^)]*\)/g, 
                name: 'setInterval for animations',
                suggestion: 'Use requestAnimationFrame for smooth animations'
            },
            {
                regex: /(?:transition|animation)\s*:[^;]*\b(width|height|margin|padding|left|top|right|bottom)\b/g,
                name: 'Inefficient CSS animations',
                suggestion: 'Use transform and opacity for better performance'
            },
            {
                regex: /\b(?:offset|scroll|client)(?:Width|Height|Top|Left|Right|Bottom)\b\s*[^=!]=[^=]/g,
                name: 'Layout thrashing in animations',
                suggestion: 'Read and write layout properties outside animation loops'
            }
        ];

        animationPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.regex.exec(code)) !== null) {
                const lineNumber = this.getLineNumber(code, match.index);
                this.addIssue(
                    result,
                    `Animation performance issue: ${pattern.name}`,
                    'medium',
                    lineNumber,
                    match.index - code.lastIndexOf('\n', match.index) - 1,
                    'PERFORMANCE_ANIMATION_ISSUE'
                );
                
                this.addSuggestion(
                    result,
                    `Optimize animation: ${pattern.name}`,
                    match[0],
                    `// ${pattern.suggestion}`,
                    'Smooth animations improve user experience and reduce battery usage on mobile devices.',
                    12,
                    lineNumber,
                    match[0].trim()
                );
            }
        });
    }
    
    private checkForInefficientStateManagement(code: string, result: AnalysisResult): void {
        // Look for inefficient state management patterns
        const statePatterns = [
            {
                regex: /this\.setState\s*\(\s*\{[^}]*\}\s*(?:,\s*[^)]*)?\)/g,
                name: 'Multiple setState calls',
                suggestion: 'Batch state updates to minimize re-renders'
            },
            {
                regex: /(?:useState|useReducer|useContext|useSelector)\s*\([^)]*\)/g,
                name: 'Potential state management optimization',
                suggestion: 'Consider using context selectors or memoization to prevent unnecessary re-renders'
            },
            {
                regex: /(?:Redux\s*\.\s*)?connect\s*\(/g,
                name: 'Redux connect optimization',
                suggestion: 'Use React.memo, useMemo, and useCallback to optimize Redux-connected components'
            }
        ];

        statePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.regex.exec(code)) !== null) {
                const lineNumber = this.getLineNumber(code, match.index);
                this.addIssue(
                    result,
                    `State management: ${pattern.name}`,
                    'medium',
                    lineNumber,
                    match.index - code.lastIndexOf('\n', match.index) - 1,
                    'STATE_MANAGEMENT_ISSUE'
                );
                
                this.addSuggestion(
                    result,
                    `Optimize state management: ${pattern.name}`,
                    match[0],
                    `// ${pattern.suggestion}`,
                    'Efficient state management reduces unnecessary re-renders and improves performance.',
                    10,
                    lineNumber,
                    match[0].trim()
                );
            }
        });
    }
    
    private checkForUnoptimizedBundling(code: string, result: AnalysisResult): void {
        // Look for patterns that might lead to suboptimal bundling
        const bundlingPatterns = [
            {
                regex: /import\s+\*\s+as\s+\w+\s+from\s+['"]([^'"]*\.(?:css|scss|less))['"]/g,
                name: 'CSS import in JavaScript',
                suggestion: 'Import CSS in your main entry point or use CSS modules'
            },
            {
                regex: /import\s*\{[^}]*\}\s*from\s*['"]([^'"]*\/index\.(?:js|ts))['"]/g,
                name: 'Redundant /index in import',
                suggestion: 'Import from the directory directly instead of /index'
            },
            {
                regex: /import\s+[^\n]+\s+from\s+['"]([^'"]*\/node_modules\/[^'"]*)['"]/g,
                name: 'Direct node_modules import',
                suggestion: 'Import from the package name instead of node_modules path'
            }
        ];

        bundlingPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.regex.exec(code)) !== null) {
                const lineNumber = this.getLineNumber(code, match.index);
                this.addIssue(
                    result,
                    `Bundling issue: ${pattern.name}`,
                    'low',
                    lineNumber,
                    match.index - code.lastIndexOf('\n', match.index) - 1,
                    'BUNDLING_ISSUE'
                );
                
                this.addSuggestion(
                    result,
                    `Optimize bundling: ${pattern.name}`,
                    match[0],
                    `// ${pattern.suggestion}`,
                    'Optimized bundling reduces bundle size and improves load times.',
                    8,
                    lineNumber,
                    match[0].trim()
                );
            }
        });
    }
}
