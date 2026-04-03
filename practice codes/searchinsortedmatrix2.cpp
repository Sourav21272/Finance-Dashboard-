#include <bits/stdc++.h>
using namespace std;
/*Problem Statement: You have been given a 2-D array 'mat' of size 'N x M' where 'N' and 'M' denote the number of rows and columns, respectively. The elements of each row and each column are sorted in non-decreasing order.
But, the first element of a row is not necessarily greater than the last element of the previous row (if it exists).
You are given an integer ‘target’, and your task is to find if it exists in the given 'mat' or not.*/
/*
One key point to notice here is that the first element of a row is not necessarily greater than the last element of the previous row (if it exists). This means the matrix is not necessarily entirely sorted although each row and column is sorted in non-decreasing order.

The extremely naive approach is to get the answer by checking all the elements of the given matrix. So, we will traverse the matrix and check every element if it is equal to the given ‘target’.

Algorithm:

We will use a loop(say i) to select a particular row at a time.
Next, for every row, we will use another loop(say j) to traverse each column.
Inside the loops, we will check if the element i.e. matrix[i][j] is equal to the ‘target’. If we found any matching element, we will return true.
Finally, after completing the traversal, if we found no matching element, we will return false.
Time Complexity: O(N X M), where N = given row number, M = given column number.
Reason: In order to traverse the matrix, we are using nested loops running for n and m times respectively.

Space Complexity: O(1) as we are not using any extra space.
*/
bool bruite(vector <vector <int>> amatrix,int target){
    int n = matrix.size(),m= matrix[0].size();
    for(int i=0; i<n; i++){
        for(int j=0; j<m; j++){
            if(matrix[i][j]==target) return true;
        }
    }return false;
}
/*
We are going to use the Binary Search algorithm to optimize the approach.

The primary objective of the Binary Search algorithm is to efficiently determine the appropriate half to eliminate, thereby reducing the search space by half. It does this by determining a specific condition that ensures that the target is not present in that half.

The question specifies that each row in the given matrix is sorted. Therefore, to determine if the target is present in a specific row, we don't need to search column by column. Instead, we can efficiently use the binary search algorithm.

Algorithm:

We will use a loop(say i) to select a particular row at a time.
Next, for every row, i, we will check if it contains the target using binary search.
After applying binary search on row, i, if we found any element equal to the target, we will return true. Otherwise, we will move on to the next row.
Finally, after completing all the row traversals, if we found no matching element, we will return false.
Time Complexity: O(N*logM), where N = given row number, M = given column number.
Reason: We are traversing all rows and it takes O(N) time complexity. And for all rows, we are applying binary search. So, the total time complexity is O(N*logM).

Space Complexity: O(1) as we are not using any extra space
*/
