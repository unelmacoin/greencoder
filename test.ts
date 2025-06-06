// Test file for Green Coder analysis

// Inefficient loop with array length in condition
function processItems(items: string[]) {
    for (let i = 0; i < items.length; i++) {
        console.log(`Processing item ${i}: ${items[i]}`);
    }
}

// Unused variable
const unusedVar = 'This variable is not used';

// Inefficient string concatenation in loop
function buildString(parts: string[]): string {
    let result = '';
    for (const part of parts) {
        result += part; // Inefficient string concatenation
    }
    return result;
}

// Using any type
function processData(data: any) {
    return JSON.stringify(data);
}

// Console.log in production code
function debugInfo() {
    console.log('Debug information');
}

// Inefficient array method usage
const numbers = [1, 2, 3, 4, 5];
const doubled: number[] = [];
for (let i = 0; i < numbers.length; i++) {
    doubled.push(numbers[i] * 2);
}

// Memory leak potential
class CacheManager {
    private cache: Record<string, any> = {};
    private size = 0;
    
    set(key: string, value: any) {
        this.cache[key] = value;
        this.size++;
        // No mechanism to limit cache size or remove old entries
    }
    
    get(key: string) {
        return this.cache[key];
    }
}
