package de.featjar.varied.session;

import de.featjar.model.Feature;
import de.featjar.varied.api.Api;
import de.featjar.varied.api.Message;
import de.featjar.varied.api.Payload;
import de.featjar.varied.project.Artifact;
import de.featjar.varied.util.Users;
import de.featjar.varied.util.FeatureModels;
import org.pmw.tinylog.Logger;

import java.util.*;

/**
 * A session consists of a set of users that view and edit a artifact together.
 */
public abstract class Session {
    protected Artifact.Path artifactPath;
    protected Set<User> users = new HashSet<>();

    Session(Artifact.Path artifactPath) {
        this.artifactPath = artifactPath;
    }

    public String toString() {
        return artifactPath.toString();
    }

    protected abstract void _join(User newUser);

    protected abstract void _leave(User oldUser);

    protected abstract boolean _onMessage(User user, Message.IDecodable message);

    public boolean isInProcess() {
        return users.size() > 0;
    }

    public Artifact.Path getArtifactPath() {
        return artifactPath;
    }

    public Set<User> getUsers() {
        return users;
    }

    public void join(User newUser) {
        Logger.info("{} joins session {}", newUser, this);
        if (!users.add(newUser))
            throw new RuntimeException("user already joined");
        _join(newUser);
        Users.broadcastToOthers(users, new Api.UserJoined(artifactPath, newUser), newUser);
        Users.sendForEachUser(newUser, users, user -> new Api.UserJoined(artifactPath, user));
    }

    public void leave(User oldUser) {
        Logger.info("{} leaves session {}", oldUser, this);
        if (!users.remove(oldUser))
            throw new RuntimeException("user already left");
        _leave(oldUser);
        Users.broadcastToOthers(users, new Api.UserLeft(artifactPath, oldUser), oldUser);
    }

    public void onMessage(User user, Message message) throws Message.InvalidMessageException {
        if (!_onMessage(user, (Message.IDecodable) message))
            throw new Message.InvalidMessageException("message can not be processed");
    }

    public static class FeatureModel extends Session {
        protected final de.featjar.model.FeatureModel featureModel;

        public FeatureModel(Artifact.Path artifactPath, de.featjar.model.FeatureModel featureModel) {
            super(artifactPath);
            this.featureModel = featureModel;
            Objects.requireNonNull(featureModel, "no initial feature model given");
        }

        public de.featjar.model.FeatureModel getFeatureModel() {
            return featureModel;
        }

        protected boolean _onMessage(User user, Message.IDecodable message) {
            if (message instanceof Api.ExportArtifact) {
                Api.ExportArtifact exportArtifactMessage = (Api.ExportArtifact) message;
                exportArtifactMessage.data = FeatureModels.serialize(getFeatureModel(), exportArtifactMessage.format);
                user.send(exportArtifactMessage);
                return true;
            }

            if (message instanceof Api.OperationFeatureCreateBelow) {
                String featureParentID = ((Api.OperationFeatureCreateBelow) message).featureParentID;
                Feature feature = featureModel.getFeature(featureModel.getIdentifier().getFactory().parse(featureParentID)).orElseThrow();
                feature.mutate().createFeatureBelow();
                Users.broadcast(users, getArtifactData());
                return true;
            }

            if (message instanceof Api.OperationFeatureRemove) {
                Arrays.stream(((Api.OperationFeatureRemove) message).featureIDs)
                        .map(featureID -> featureModel.getFeature(featureModel.getIdentifier().getFactory().parse(featureID)).orElseThrow())
                        .forEach(feature -> feature.mutate().remove());
                Users.broadcast(users, getArtifactData());
                return true;
            }

            return false;
        }

        protected void _join(User newUser) {
            newUser.send(getArtifactData());
        }

        private Api.ArtifactData getArtifactData() {
            return new Api.ArtifactData(artifactPath, Payload.fromFeatureModel(featureModel));
        }

        protected void _leave(User oldUser) {
        }
    }
}
