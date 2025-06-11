/*
## Coding Challenge: Summation to n

Provide 3 unique implementations of the following function in JavaScript.

Input: n - any integer
Assuming this input will always produce a result lesser than Number.MAX_SAFE_INTEGER.

Output: return - summation to n, i.e. sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15.

*/

// Solution 1: Mathematical Formula (Most Efficient)
// Using the arithmetic series formula: n(n+1)/2
function sum_to_n_a(n) {
    // Handle negative numbers by using absolute value and maintaining sign
    if (n === 0) return 0;
    
    const absN = Math.abs(n);
    const result = (absN * (absN + 1)) / 2;
    
    // If original n was negative, return negative sum
    return n < 0 ? -result : result;
}

// Solution 2: Iterative Loop (Classic Approach)
// Simple for loop accumulating sum
function sum_to_n_b(n) {
    if (n === 0) return 0;
    
    let sum = 0;
    const absN = Math.abs(n);
    
    for (let i = 1; i <= absN; i++) {
        sum += i;
    }
    
    // If original n was negative, return negative sum
    return n < 0 ? -sum : sum;
}

// Solution 3: Recursive Approach with Memoization (Creative)
// Using recursion with caching for optimization
function sum_to_n_c(n) {
    // Memoization cache stored as static property
    sum_to_n_c.cache = sum_to_n_c.cache || {};
    
    if (n === 0) return 0;
    
    const absN = Math.abs(n);
    const cacheKey = absN.toString();
    
    // Check cache first
    if (sum_to_n_c.cache[cacheKey] !== undefined) {
        return n < 0 ? -sum_to_n_c.cache[cacheKey] : sum_to_n_c.cache[cacheKey];
    }
    
    // Recursive calculation
    if (absN === 1) {
        sum_to_n_c.cache[cacheKey] = 1;
    } else {
        sum_to_n_c.cache[cacheKey] = absN + sum_to_n_c(absN - 1);
    }
    
    // Return with appropriate sign
    return n < 0 ? -sum_to_n_c.cache[cacheKey] : sum_to_n_c.cache[cacheKey];
}

// Test cases to verify all solutions work correctly
console.log("Testing all solutions:");
console.log("sum_to_n(5) should equal 15:");
console.log("Solution A:", sum_to_n_a(5));
console.log("Solution B:", sum_to_n_b(5));
console.log("Solution C:", sum_to_n_c(5));

console.log("\nsum_to_n(0) should equal 0:");
console.log("Solution A:", sum_to_n_a(0));
console.log("Solution B:", sum_to_n_b(0));
console.log("Solution C:", sum_to_n_c(0));

console.log("\nsum_to_n(-3) should equal -6:");
console.log("Solution A:", sum_to_n_a(-3));
console.log("Solution B:", sum_to_n_b(-3));
console.log("Solution C:", sum_to_n_c(-3));

console.log("\nsum_to_n(100) performance test:");
console.time("Solution A (Formula)");
console.log("Result:", sum_to_n_a(100));
console.timeEnd("Solution A (Formula)");

console.time("Solution B (Loop)");
console.log("Result:", sum_to_n_b(100));
console.timeEnd("Solution B (Loop)");

console.time("Solution C (Recursive)");
console.log("Result:", sum_to_n_c(100));
console.timeEnd("Solution C (Recursive)");