def ans(n):
    if n%100 != 0:
        return "its not possible"
    combo = {}
    for d in [500,200,100]:
        combo[d] = n//d
        n %= d
    total_notes = sum(combo.values())
    return combo
print(ans(3700))