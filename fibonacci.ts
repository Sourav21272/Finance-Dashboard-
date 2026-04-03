// Function to generate Fibonacci series iteratively
function fibonacciIterative(n: number): number[] {
    const series: number[] = [];
    let a = 0, b = 1;
    
    for (let i = 0; i < n; i++) {
        series.push(a);
        const temp = a + b;
        a = b;
        b = temp;
    }
    
    return series;
}

// Function to generate Fibonacci series recursively
function fibonacciRecursive(n: number): number {
    if (n <= 1) return n;
    return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}

// Function to print the series
function printFibonacciSeries(n: number) {
    console.log("Iterative Fibonacci Series:");
    console.log(fibonacciIterative(n).join(", "));
    
    console.log("\nRecursive Fibonacci Series:");
    const recursiveSeries: number[] = [];
    for (let i = 0; i < n; i++) {
        recursiveSeries.push(fibonacciRecursive(i));
    }
    console.log(recursiveSeries.join(", "));
}

// Example usage
const length = 10;
printFibonacciSeries(length);
