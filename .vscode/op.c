#include <stdio.h>
#include <pthread.h>

// Global variable
int n;

// Thread function
void* calculate_average(void* arg)
{
    int sum = 0;
    double average;

    // Loop to calculate sum of natural numbers
    for(int i = 1; i <= n; i++)
    {
        sum += i;
    }

    // Calculate average
    average = (double)sum / n;

    // Print result
    printf("Sum = %d\n", sum);
    printf("Average = %.2f\n", average);

    pthread_exit(NULL);
}

int main()
{
    pthread_t thread;

    printf("Enter value of n: ");
    scanf("%d", &n);

    // Create thread
    pthread_create(&thread, NULL, calculate_average, NULL);

    // Wait for thread to finish
    pthread_join(thread, NULL);

    return 0;
}
