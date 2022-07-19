package de.featjar.varied.session;

import de.featjar.varied.Socket;
import de.featjar.varied.message.Message;
import de.featjar.varied.util.Collaborators;
import org.pmw.tinylog.Logger;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class CollaboratorManager {
    private static CollaboratorManager instance;
    private final Map<UUID, Collaborator> collaborators = new ConcurrentHashMap<>();

    private CollaboratorManager() {
    }

    public static CollaboratorManager getInstance() {
        return instance == null ? instance = new CollaboratorManager() : instance;
    }

    public void resetInstance() {
        collaborators.clear();
    }

    public UUID register(Socket socket, UUID siteID) {
        Collaborator collaborator;
        if (siteID != null) {
            if (collaborators.containsKey(siteID)) {
                collaborator = collaborators.get(siteID);
                collaborator.setSocket(socket);
                collaborator.sendPending();
            } else
                throw new RuntimeException("site ID " + siteID + " not registered");
        } else {
            collaborator = new Collaborator(socket);
            collaborators.put(collaborator.getSiteID(), collaborator);
        }
        collaborator.sendInitialInformation();
        Logger.info("registered site {}", collaborator.getSiteID());
        return collaborator.getSiteID();
    }

    public void unregister(UUID siteID) {
        Objects.requireNonNull(siteID, "site ID not provided");
        if (collaborators.containsKey(siteID)) {
            collaborators.get(siteID).leaveAll();
            Logger.info("unregistered site {}", siteID);
            // todo logout
        }
    }

    public void broadcast(Message.IEncodable message) {
        Collaborators.broadcast(collaborators.values(), message);
    }

    public void onMessage(UUID siteID, Message message) throws Message.InvalidMessageException {
        Collaborator collaborator = collaborators.get(siteID);
        if (collaborator != null)
            collaborator.onMessage(message);
    }
}