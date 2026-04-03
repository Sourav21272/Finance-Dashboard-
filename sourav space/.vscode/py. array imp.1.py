# 1. WAPP to demonstrate the copy operation on an array
import copy

arr1 = [10, 20, 30, 40, 50]
print("Original array:", arr1)

# Copy using slicing
arr2 = arr1[:]
print("Copied array using slicing:", arr2)

# Copy using copy module
arr3 = copy.copy(arr1)
print("Copied array using copy.copy():", arr3)


# 2. WAPP to demonstrate the array element accessing through array index
print("\nAccessing elements through index:")
for i in range(len(arr1)):
    print(f"Element at index {i} = {arr1[i]}")


# 3. WAPP to display the different slicing operations on array
print("\nArray Slicing Examples:")
print("arr1[1:4]  =", arr1[1:4])     # From index 1 to 3
print("arr1[:3]  =", arr1[:3])       # From start to index 2
print("arr1[2:]  =", arr1[2:])       # From index 2 to end
print("arr1[-3:] =", arr1[-3:])      # Last 3 elements
print("arr1[::-1] =", arr1[::-1])    # Reverse array
