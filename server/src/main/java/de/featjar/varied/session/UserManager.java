package de.featjar.varied.session;

import de.featjar.varied.Socket;
import de.featjar.varied.api.Message;
import de.featjar.varied.util.Users;
import org.pmw.tinylog.Logger;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class UserManager {
    private static UserManager instance;
    private final Map<UUID, User> users = new ConcurrentHashMap<>();

    private UserManager() {
    }

    public static UserManager getInstance() {
        return instance == null ? instance = new UserManager() : instance;
    }

    public void resetInstance() {
        users.clear();
    }

    public void register(Socket socket, UUID userID) {
        User user;
        if (users.containsKey(userID)) {
            user = users.get(userID);
            user.setSocket(socket);
            user.sendPending();
        } else {
            user = new User(userID, socket);
            users.put(userID, user);
        }
        user.sendInitialInformation();
        Logger.info("registered user {}", userID);
    }

    public void unregister(UUID userID) {
        Objects.requireNonNull(userID, "user ID not provided");
        if (users.containsKey(userID)) {
            users.get(userID).leaveAll();
            Logger.info("unregistered user {}", userID);
            // todo logout
        }
    }

    public void broadcast(Message.IEncodable message) {
        Users.broadcast(users.values(), message);
    }

    public void onMessage(UUID userID, Message message) throws Message.InvalidMessageException {
        User user = users.get(userID);
        if (user != null)
            user.onMessage(message);
    }
}