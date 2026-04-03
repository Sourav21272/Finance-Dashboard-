def min_taxis(groups):
    count = [0] * 5
    for g in groups:
        count[g] += 1

    taxis = 0
    taxis += count[4]

    pair = min(count[3], count[1])
    taxis += count[3]
    count[1] -= pair

    taxis += count[2] // 2
    if count[2] % 2:
        taxis += 1
        count[1] -= min(2, count[1])

    if count[1] > 0:
        taxis += (count[1] + 3) 

    return taxis

groups = [1, 2, 4, 3, 3]
print(min_taxis(groups))
