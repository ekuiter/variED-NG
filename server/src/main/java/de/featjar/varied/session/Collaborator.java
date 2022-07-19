package de.featjar.varied.session;

import com.google.gson.annotations.Expose;
import de.featjar.varied.Socket;
import de.featjar.varied.message.Api;
import de.featjar.varied.message.Message;
import de.featjar.varied.project.Artifact;
import de.featjar.varied.project.Project;
import de.featjar.varied.project.ProjectManager;
import de.featjar.varied.util.Collaborators;
import me.atrox.haikunator.Haikunator;
import org.pmw.tinylog.Logger;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Collaborator {
    @Expose
    private UUID siteID;

    @Expose
    private String name;

    private Socket socket;
    private final Queue<Message.IEncodable> outgoingQueue = new LinkedList<>();

    private static final Haikunator haikunator = new Haikunator().setDelimiter(" ").setTokenLength(0);
    private final Set<Session> sessions = new HashSet<>();

    private static String capitalize(final String words) {
        return Stream.of(words.trim().split("\\s"))
                .filter(word -> word.length() > 0)
                .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1))
                .collect(Collectors.joining(" "));
    }

    private static String generateName() {
        return capitalize(haikunator.haikunate());
    }

    Collaborator(Socket socket) {
        this(UUID.randomUUID(), generateName(), socket);
    }

    private Collaborator(UUID siteID, String name, Socket socket) {
        this.siteID = siteID;
        this.name = name;
        this.socket = socket;
    }

    private void _send(Message.IEncodable message) throws Socket.SendException {
        Logger.info("sending {} message to collaborator {}", ((Message) message).getType(), this);
        socket.send(message);
    }

    void sendPending() {
        while (outgoingQueue.peek() != null) {
            Message.IEncodable message = outgoingQueue.peek();
            try {
                _send(message);
            } catch (Socket.SendException e) {
                return;
            }
            outgoingQueue.remove();
        }
    }

    public void send(Message.IEncodable message) {
        outgoingQueue.add(message);
        sendPending();
    }

    void sendInitialInformation() {
        Logger.info("sending initial information to collaborator {}", this);
        send(new Api.CollaboratorJoined(null, this));
        send(new Api.AddArtifact(ProjectManager.getInstance().getArtifactPaths()));
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        broadcastUpdatedProfile();
    }

    public UUID getSiteID() {
        return siteID;
    }

    public String toString() {
        return getSiteID().toString();
    }

    public void setSocket(Socket socket) {
        this.socket = socket;
    }

    void onMessage(Message message) throws Message.InvalidMessageException {
        Objects.requireNonNull(message, "no message given");
        Logger.info("received {} message from collaborator {}", message.getType(), this);

        if (message.isType(Api.TypeEnum.RESET)) {
            Logger.info("resetting server");
            ProjectManager.getInstance().resetInstance();
            CollaboratorManager.getInstance().resetInstance();
            return;
        }

        if (message.isType(Api.TypeEnum.SET_USER_PROFILE)) {
            Logger.info("setting user profile of collaborator {}", this);
            this.setName(((Api.SetUserProfile) message).name);
            return;
        }

        Artifact.Path artifactPath = message.getArtifactPath();
        if (artifactPath == null)
            throw new Message.InvalidMessageException("no artifact path given");

        if (message.isType(Api.TypeEnum.ADD_ARTIFACT)) {
            Logger.info("adding new artifact {}", artifactPath);
            if (ProjectManager.getInstance().getArtifact(artifactPath) != null)
                throw new RuntimeException("artifact for path " + artifactPath + " already exists");
            Project project = ProjectManager.getInstance().getProject(artifactPath);
            if (project == null) {
                String projectName = artifactPath.getProjectName();
                Logger.info("adding new project {}", projectName);
                project = new Project(projectName);
                ProjectManager.getInstance().addProject(project);
            }
            String source = ((Api.AddArtifact) message).source;
            Artifact artifact;
            if (source == null)
                artifact = new Artifact.FeatureModel(project, artifactPath.getArtifactName(),
                        ProjectManager.getResourcePath("examples/" + ProjectManager.EMPTY + ".xml"));
            else
                artifact = new Artifact.FeatureModel(project, artifactPath.getArtifactName(), source);
            project.addArtifact(artifact);
            CollaboratorManager.getInstance().broadcast(new Api.AddArtifact(Arrays.asList(artifactPath)));
            return;
        }

        if (message.isType(Api.TypeEnum.REMOVE_ARTIFACT)) {
            Logger.info("removing artifact {}", artifactPath);
            Artifact artifact = ProjectManager.getInstance().getArtifact(artifactPath);
            if (artifact == null)
                throw new RuntimeException("no artifact found for path " + artifactPath);
            if (artifact.getSession().isInProcess())
                throw new RuntimeException("session for artifact is still in process");
            ProjectManager.getInstance().getProject(artifactPath).removeArtifact(artifact);
            CollaboratorManager.getInstance().broadcast(new Api.RemoveArtifact(artifactPath));
            return;
        }

        Artifact artifact = ProjectManager.getInstance().getArtifact(artifactPath);
        if (artifact == null)
            throw new Message.InvalidMessageException("no artifact found for path " + artifactPath);
        Session session = artifact.getSession();
        Logger.debug("message concerns session {}", session);

        if (message.isType(Api.TypeEnum.JOIN_REQUEST) || message.isType(Api.TypeEnum.LEAVE_REQUEST)) {
            if (message.isType(Api.TypeEnum.JOIN_REQUEST))
                join(session);
            if (message.isType(Api.TypeEnum.LEAVE_REQUEST))
                leave(session);
            return;
        }

        for (Session _Session : sessions)
            if (_Session == session) {
                session.onMessage(this, message);
                return;
            }

        throw new Message.InvalidMessageException("did not join session for given artifact path");
    }

    private void join(Session session) {
        session.join(this);
        sessions.add(session);
    }

    private void leave(Session session) {
        session.leave(this);
        sessions.remove(session);
    }

    public void leaveAll() {
        for (Session session : sessions)
            session.leave(this);
        sessions.clear();
    }

    private void broadcastUpdatedProfile() {
        send(new Api.CollaboratorJoined(null, this));
        for (Session session : sessions)
            Collaborators.broadcastToOthers(session.getCollaborators(),
                    new Api.CollaboratorJoined(session.getArtifactPath(), this), this);
    }
}
