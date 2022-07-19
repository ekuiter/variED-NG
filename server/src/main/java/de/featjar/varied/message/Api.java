package de.featjar.varied.message;

import com.google.gson.JsonObject;
import com.google.gson.annotations.Expose;
import de.featjar.varied.project.Artifact;
import de.featjar.varied.session.Collaborator;
import org.pmw.tinylog.Logger;

import java.util.Collection;

/**
 * To add a new kind of message: Add a type below and create a camel-cased inner class
 * that derives Message.IEncodable or Message.IDecodable.
 */
public class Api {
    /**
     * Types of messages. Decodable message types can also be decoded and are registered with Gson.
     */
    public enum TypeEnum {
        ERROR,
        RESET,
        ADD_ARTIFACT,
        REMOVE_ARTIFACT,
        EXPORT_ARTIFACT,
        COLLABORATOR_JOINED,
        COLLABORATOR_LEFT,
        SET_USER_PROFILE,
        JOIN_REQUEST,
        LEAVE_REQUEST,
        INITIALIZE
    }

    public static class Error extends Message implements Message.IEncodable {
        @Expose
        String error;

        public Error(Throwable throwable) {
            super(TypeEnum.ERROR, null);
            this.error = throwable.toString();
            Logger.error(throwable);
        }
    }

    public static class Reset extends Message implements Message.IDecodable {
    }

    public static class AddArtifact extends Message implements Message.IEncodable, Message.IDecodable {
        @Expose
        public String source;

        @Expose
        public Artifact.Path[] artifactPaths;

        public AddArtifact(Collection<Artifact.Path> artifactPaths) {
            super(TypeEnum.ADD_ARTIFACT, null);
            this.artifactPaths = artifactPaths.toArray(new Artifact.Path[]{});
        }
    }

    public static class RemoveArtifact extends Message implements Message.IEncodable, Message.IDecodable {
        public RemoveArtifact(Artifact.Path artifactPath) {
            super(TypeEnum.REMOVE_ARTIFACT, artifactPath);
        }
    }

    public static class ExportArtifact extends Message implements Message.IEncodable, Message.IDecodable {
        @Expose
        public String format;

        @Expose
        public String data;

        public ExportArtifact(Artifact.Path artifactPath) {
            super(TypeEnum.EXPORT_ARTIFACT, artifactPath);
        }
    }

    public static class CollaboratorJoined extends Message implements Message.IEncodable {
        @Expose
        Collaborator collaborator;

        public CollaboratorJoined(Artifact.Path artifactPath, Collaborator collaborator) {
            super(TypeEnum.COLLABORATOR_JOINED, artifactPath);
            this.collaborator = collaborator;
        }
    }

    public static class CollaboratorLeft extends Message implements Message.IEncodable {
        @Expose
        Collaborator collaborator;

        public CollaboratorLeft(Artifact.Path artifactPath, Collaborator collaborator) {
            super(TypeEnum.COLLABORATOR_LEFT, artifactPath);
            this.collaborator = collaborator;
        }
    }

    public static class SetUserProfile extends Message implements Message.IDecodable {
        @Expose
        public String name;
    }

    public static class JoinRequest extends Message implements Message.IDecodable {
    }

    public static class LeaveRequest extends Message implements Message.IDecodable {
    }

    public static class Initialize extends Message implements  Message.IEncodable {
        @Expose
        JsonObject context;

        public Initialize(Artifact.Path artifactPath, JsonObject context) {
            super(TypeEnum.INITIALIZE, artifactPath);
            this.context = context;
        }
    }
}
