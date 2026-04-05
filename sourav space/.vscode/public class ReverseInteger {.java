public class ReverseInteger {
    public static int reverse(int x) {
        int rev = 0;
        
        while (x != 0) {
            int digit = x % 10;   // take last digit
            x = x / 10;           // remove last digit

            // Check for overflow BEFORE multiplying by 10
            if (rev > Integer.MAX_VALUE / 10 || (rev == Integer.MAX_VALUE / 10 && digit > 7)) {
                return 0; // overflow
            }
            if (rev < Integer.MIN_VALUE / 10 || (rev == Integer.MIN_VALUE / 10 && digit < -8)) {
                return 0; // underflow
            }

            rev = rev * 10 + digit; // push digit into rev
        }
        
        return rev;
    }

    public static void main(String[] args) {
        int x1 = 123;
        int x2 = -123;
        int x3 = 120;
        int x4 = 1534236469;

        System.out.println(reverse(x1)); // 321
        System.out.println(reverse(x2)); // -321
        System.out.println(reverse(x3)); // 21
        System.out.println(reverse(x4)); // 0 (overflow case)
    }
}
