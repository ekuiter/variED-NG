package de.featjar.varied.util;

import de.featjar.varied.session.User;
import de.featjar.varied.api.Message;

import java.util.Collection;
import java.util.Objects;
import java.util.function.Function;
import java.util.function.Predicate;

public class Users {
    public static void broadcast(Collection<User> users, Message.IEncodable message, Predicate<User> predicate) {
        Objects.requireNonNull(message, "no message given");
        users.stream()
                .filter(predicate)
                .forEach(user -> user.send(message));
    }

    public static void broadcast(Collection<User> users, Message.IEncodable message) {
        broadcast(users, message, user -> true);
    }

    public static void broadcastToOthers(Collection<User> users, Message.IEncodable message, User user) {
        broadcast(users, message, otherUser -> otherUser != user);
    }

    public static void sendForEachUser(User targetUser, Collection<User> users, Function<User, Message.IEncodable> messageFunction) {
        users.stream()
                .filter(user -> user != targetUser)
                .forEach(user -> targetUser.send(messageFunction.apply(user)));
    }
}
