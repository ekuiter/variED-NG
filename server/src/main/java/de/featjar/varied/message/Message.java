package de.featjar.varied.message;

import com.google.gson.annotations.Expose;
import com.google.gson.typeadapters.RuntimeTypeAdapterFactory;
import de.featjar.varied.util.Strings;
import de.featjar.varied.project.Artifact;

import java.util.stream.Stream;

/**
 * Messages exchanged over web sockets.
 */
abstract public class Message {
    public static class Type {
        private final Api.TypeEnum typeEnum;

        private Type(Api.TypeEnum typeEnum) {
            this.typeEnum = typeEnum;
        }

        public Type(String s) throws InvalidMessageException {
            try {
                this.typeEnum = Api.TypeEnum.valueOf(s);
            } catch (IllegalArgumentException e) {
                throw new InvalidMessageException("invalid message type " + s);
            }
        }

        public String toString() {
            return typeEnum.toString();
        }

        private static String[] getTypes() {
            return Stream.of(Api.TypeEnum.values())
                    .map(Api.TypeEnum::toString)
                    .toArray(String[]::new);
        }

        static RuntimeTypeAdapterFactory<Message> registerSubtypes(RuntimeTypeAdapterFactory<Message> runtimeTypeAdapterFactory) {
            for (String type : getTypes())
                try {
                    Class<Message> klass = (Class<Message>) Class.forName(Strings.toClassName(Api.class.getName() + "$", type));
                    if (IDecodable.class.isAssignableFrom(klass))
                        runtimeTypeAdapterFactory = runtimeTypeAdapterFactory.registerSubtype(klass, type);
                } catch (ClassNotFoundException ignored) {
                }
            return runtimeTypeAdapterFactory;
        }
    }

    /**
     * every message stores its type for serialization
     */
    @Expose
    private Type type;

    /**
     * every message may carry a path to the concerned artifact
     */
    @Expose
    private Artifact.Path artifactPath;

    public boolean isType(Api.TypeEnum typeEnum) {
        return type.typeEnum == typeEnum;
    }

    public Artifact.Path getArtifactPath() {
        return artifactPath;
    }

    public Type getType() {
        return type;
    }

    Message() {
    }

    Message(Api.TypeEnum typeEnum, Artifact.Path artifactPath) {
        this.type = new Type(typeEnum);
        this.artifactPath = artifactPath;
    }

    public String toString() {
        return new MessageSerializer.MessageEncoder().encode(this);
    }

    // may be sent by the server
    public interface IEncodable {
    }

    // may be received by the server
    public interface IDecodable {
    }

    public static class InvalidMessageException extends Exception {
        public InvalidMessageException(String message) {
            super(message);
        }
    }
}