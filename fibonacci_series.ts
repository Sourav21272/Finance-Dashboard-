class FibonacciSeries {
    // Generate series using iteration
    public getIterativeSeries(n: number): number[] {
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

    // Generate series using recursion
    public getRecursiveNumber(n: number): number {
        if (n <= 1) return n;
        return this.getRecursiveNumber(n - 1) + this.getRecursiveNumber(n - 2);
    }

    // Generate series using dynamic programming
    public getDPSeries(n: number): number[] {
        const series: number[] = new Array(n);
        series[0] = 0;
        if (n > 1) {
            series[1] = 1;
            for (let i = 2; i < n; i++) {
                series[i] = series[i-1] + series[i-2];
            }
        }
        return series;
    }

    // Print all series implementations
    public printAllSeries(n: number): void {
        console.log("Iterative Fibonacci Series:");
        console.log(this.getIterativeSeries(n).join(", "));

        console.log("\nRecursive Fibonacci Series:");
        const recursiveSeries = Array.from({length: n}, (_, i) => this.getRecursiveNumber(i));
        console.log(recursiveSeries.join(", "));

        console.log("\nDynamic Programming Fibonacci Series:");
        console.log(this.getDPSeries(n).join(", "));
    }
}

// Example usage
const fib = new FibonacciSeries();
fib.printAllSeries(10);
