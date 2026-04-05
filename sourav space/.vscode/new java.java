 public class AtomicInteger {
AtomicInteger count =  new AtomicInteger(0);

Runnable task = ()-> {
    for (int i = 0, i< 1000; i++){
        count.incrementandget();
    }
};}