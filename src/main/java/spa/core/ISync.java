package spa.core;

public interface ISync {
    void scope() throws Exception;
    Sync $ = new Sync();
    public class Sync {
        public void $(Object lock, ISync sync) throws Exception {
            synchronized(lock) {
                sync.scope();
            }
        }
    }
}
