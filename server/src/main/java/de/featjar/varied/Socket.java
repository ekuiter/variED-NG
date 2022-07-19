package de.featjar.varied;

import de.featjar.varied.api.Api;
import de.featjar.varied.api.Message;
import de.featjar.varied.api.MessageSerializer;
import de.featjar.varied.session.UserManager;
import org.pmw.tinylog.Logger;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.EOFException;
import java.util.Objects;
import java.util.UUID;

@ServerEndpoint(
        value = "/socket/{userID}",
        encoders = MessageSerializer.MessageEncoder.class,
        decoders = MessageSerializer.MessageDecoder.class)
public class Socket {
    private Session session;
    private UUID userID;

    // This essentially forces the server to handle only one message at a time.
    // This assumption simplifies multithreaded access to feature models, but limits server performance.
    private static final Object lock = new Object();

    @OnOpen
    public void onOpen(@PathParam("userID") String _userID, Session session) {
        synchronized (lock) {
            try {
                Objects.requireNonNull(_userID, "user ID not supplied");
                Logger.debug("WebSocket opened for user {}", userID);
                this.session = session;
                session.setMaxIdleTimeout(0);
                try {
                    this.userID = UUID.fromString(_userID);
                    UserManager.getInstance().register(this, userID);
                } catch (Throwable t) {
                    send(new Api.Error(t));
                    session.close();
                }
            } catch (Throwable t) {
                Logger.error(t);
            }
        }
    }

    @OnClose
    public void onClose() {
        synchronized (lock) {
            Logger.debug("WebSocket closed for user {}", userID);
            UserManager.getInstance().unregister(userID);
        }
    }

    @OnMessage
    public void onMessage(Message message) {
        synchronized (lock) {
            try {
                try {
                    UserManager.getInstance().onMessage(userID, message);
                } catch (Throwable t) {
                    send(new Api.Error(t));
                }
            } catch (SendException e) {
                Logger.error(e);
            }
        }
    }

    @OnError
    public void onError(Throwable t) {
        synchronized (lock) {
            try {
                Logger.debug("WebSocket error:");
                Logger.debug(t);
                // Most likely cause is a user closing their browser. Check to see if
                // the root cause is EOF and if it is ignore it.
                // Protect against infinite loops. (see Apache Tomcat examples)
                int count = 0;
                Throwable root = t;
                while (root.getCause() != null && count < 20) {
                    root = root.getCause();
                    count++;
                }
                // If this is triggered by the user closing their browser ignore it. Else, close the socket.
                if (!(root instanceof EOFException)) {
                    Logger.debug("closing WebSocket due to unexpected error");
                    session.close();
                }
            } catch (Throwable t2) {
                Logger.error(t2);
            }
        }
    }

    public void send(Message.IEncodable message) throws SendException {
        try {
            session.getBasicRemote().sendObject(message);
        } catch (Exception e) {
            throw new SendException(e);
        }
    }

    public static class SendException extends Exception {
        SendException(Throwable cause) {
            super(cause);
        }
    }
}