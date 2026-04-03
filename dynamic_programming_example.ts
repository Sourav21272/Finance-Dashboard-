// Dynamic Programming Example

// Memoization (Top-down) approach for Fibonacci
function fibMemo(n: number, memo: Map<number, number> = new Map()): number {
    if (n <= 1) return n;
    if (memo.has(n)) return memo.get(n)!;
    
    const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    memo.set(n, result);
    return result;
}

// Bottom-up approach for Fibonacci
function fibDP(n: number): number {
    if (n <= 1) return n;
    
    let dp = new Array(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}

// Example usage
console.log("Fibonacci of 10 using memoization:", fibMemo(10));
console.log("Fibonacci of 10 using bottom-up DP:", fibDP(10));
