package de.featjar.varied.util;

import de.featjar.varied.session.Collaborator;
import de.featjar.varied.message.Message;

import java.util.Collection;
import java.util.Objects;
import java.util.function.Function;
import java.util.function.Predicate;

public class Collaborators {
    public static void broadcast(Collection<Collaborator> collaborators, Message.IEncodable message, Predicate<Collaborator> predicate) {
        Objects.requireNonNull(message, "no message given");
        collaborators.stream()
                .filter(predicate)
                .forEach(collaborator -> collaborator.send(message));
    }

    public static void broadcast(Collection<Collaborator> collaborators, Message.IEncodable message) {
        broadcast(collaborators, message, collaborator -> true);
    }

    public static void broadcastToOthers(Collection<Collaborator> collaborators, Message.IEncodable message, Collaborator collaborator) {
        broadcast(collaborators, message, otherCollaborator -> otherCollaborator != collaborator);
    }

    public static void sendForEachCollaborator(Collaborator targetCollaborator, Collection<Collaborator> collaborators, Function<Collaborator, Message.IEncodable> messageFunction) {
        collaborators.stream()
                .filter(collaborator -> collaborator != targetCollaborator)
                .forEach(collaborator -> targetCollaborator.send(messageFunction.apply(collaborator)));
    }
}
