package de.featjar.varied.session;

import de.featjar.varied.message.Api;
import de.featjar.varied.message.Message;
import de.featjar.varied.project.Artifact;
import de.featjar.varied.util.Collaborators;
import de.featjar.varied.util.FeatureModels;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import org.pmw.tinylog.Logger;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * A session consists of a set of collaborators that view and edit a artifact together.
 */
public abstract class Session {
    protected Artifact.Path artifactPath;
    protected Set<Collaborator> collaborators = new HashSet<>();

    Session(Artifact.Path artifactPath) {
        this.artifactPath = artifactPath;
    }

    public String toString() {
        return artifactPath.toString();
    }

    protected abstract void _join(Collaborator newCollaborator);

    protected abstract void _leave(Collaborator oldCollaborator);

    protected abstract boolean _onMessage(Collaborator collaborator, Message.IDecodable message);

    public boolean isInProcess() {
        return collaborators.size() > 0;
    }

    public Artifact.Path getArtifactPath() {
        return artifactPath;
    }

    public Set<Collaborator> getCollaborators() {
        return collaborators;
    }

    public void join(Collaborator newCollaborator) {
        Logger.info("{} joins session {}", newCollaborator, this);
        // collaborator may re-join to obtain new initialization context,
        // therefore do not check "add" return value here
        if (!collaborators.add(newCollaborator))
            throw new RuntimeException("collaborator already joined");
        _join(newCollaborator);
        Collaborators.broadcastToOthers(collaborators, new Api.CollaboratorJoined(artifactPath, newCollaborator), newCollaborator);
        Collaborators.sendForEachCollaborator(newCollaborator, collaborators, collaborator -> new Api.CollaboratorJoined(artifactPath, collaborator));
    }

    public void leave(Collaborator oldCollaborator) {
        Logger.info("{} leaves session {}", oldCollaborator, this);
        if (!collaborators.remove(oldCollaborator))
            throw new RuntimeException("collaborator already left");
        _leave(oldCollaborator);
        Collaborators.broadcastToOthers(collaborators, new Api.CollaboratorLeft(artifactPath, oldCollaborator), oldCollaborator);
    }

    public void onMessage(Collaborator collaborator, Message message) throws Message.InvalidMessageException {
        if (!_onMessage(collaborator, (Message.IDecodable) message))
            throw new Message.InvalidMessageException("message can not be processed");
    }

    public static class FeatureModel extends Session {
        protected final IFeatureModel initialFeatureModel;

        public FeatureModel(Artifact.Path artifactPath, IFeatureModel initialFeatureModel) {
            super(artifactPath);
            this.initialFeatureModel = initialFeatureModel;
            Objects.requireNonNull(initialFeatureModel, "no initial feature model given");
        }

        public IFeatureModel toFeatureModel() {
            return initialFeatureModel;
        }

        protected boolean _onMessage(Collaborator collaborator, Message.IDecodable message) {
            if (message instanceof Api.ExportArtifact) {
                Api.ExportArtifact exportArtifactMessage = (Api.ExportArtifact) message;
                exportArtifactMessage.data = FeatureModels.serializeFeatureModel(toFeatureModel(), exportArtifactMessage.format);
                collaborator.send(exportArtifactMessage);
                return true;
            }

            return false;
        }

        protected void _join(Collaborator newCollaborator) {
            newCollaborator.send(new Api.Initialize(artifactPath, "init"));
        }

        protected void _leave(Collaborator oldCollaborator) {
        }
    }
}
