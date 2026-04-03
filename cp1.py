def search (arr,target):
    low=0
    high=len(arr)-1
    while low <=high:
      mid=low+(high -low)//2
      if target ==arr[mid]:
        return mid
      elif target < arr [mid]:
        high=mid -1
      else:
        low =mid + 1 
    return -1
arr=[1,3,5,6]
target =5 
print(search (arr,target))
