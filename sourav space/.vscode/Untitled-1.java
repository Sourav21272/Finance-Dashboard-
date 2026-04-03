// ...existing code...
public class MinimumTaxis {
    public static int minTaxis(int[] groups) {
        int[] count = new int[5]; // index 1-4
        for (int g : groups) count[g]++;
        int taxis = count[4];
        // Match 3s with 1s
        int match = Math.min(count[3], count[1]);
        taxis += count[3];
        count[1] -= match; 
        // Pair 2s together
        taxis += count[2] / 2;
        if (count[2] % 2 == 1) {
            taxis++;
            count[1] = Math.max(0, count[1] - 2);
        } 
        // Handle remaining 1s
        if (count[1] > 0) {
            taxis += (count[1] + 3) / 4; // ceil division
        }
        return taxis;
    }
    public static void main(String[] args) {
        int[] groups = {1, 2, 4, 3, 3, 2, 1, 1};
        System.out.println(minTaxis(groups)); // Output: 5
    }
}
// ...existing code...