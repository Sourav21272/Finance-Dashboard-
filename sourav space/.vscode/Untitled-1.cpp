// Taxi Sharing Difficulty: Medium
//Tags: Greedy, Simulation
//Problem Statement
//In a city, there are N groups of people who want to go to the airport.
//Each taxi can carry at most 4 people.
//Groups cannot be split between taxis.
//Given an array groups[] of size N, where groups[i] is the size of the i-th group (1 ≤ 
//groups[i] ≤ 4), return the minimum number of taxis required.
//Example 1:
//Input: groups = [1, 2, 4, 3, 3] 
//Output: 4
//Explanation: 
//- Group 4 → needs its own taxi 
//- Two groups of 3 → need separate taxis 
//- Group 2 + Group 1 share a taxi 
//Total taxis = 4
//Constraints:
// 1 ≤ N ≤ 10⁵
// 1 ≤ groups[i] ≤ 4
#include <stdio.h>

#include <stdio.h>

int main() {
    int N;
    scanf("%d", &N);

    int groups[N];
    int count[5] = {0}; 

    for (int i = 0; i < N; i++) {
        scanf("%d", &groups[i]);
        count[groups[i]]++;
    }

    int taxis = 0;

   
    taxis += count[4];

   
    int pair31 = (count[3] < count[1]) ? count[3] : count[1];
    taxis += count[3];         
    count[1] -= pair31;         

   
    taxis += count[2] / 2;
    count[2] %= 2;  

   
    if (count[2] == 1) {
        taxis++;
        if (count[1] >= 2)
            count[1] -= 2;
        else
            count[1] = 0;
    }

   
    if (count[1] > 0)
        taxis += (count[1] + 3) / 4; // ceil(count[1]/4)

    printf("%d\n", taxis);

    return 0;
}