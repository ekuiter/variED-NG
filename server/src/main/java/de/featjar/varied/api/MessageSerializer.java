package de.featjar.varied.api;

import com.google.gson.*;
import com.google.gson.reflect.TypeToken;
import com.google.gson.typeadapters.RuntimeTypeAdapterFactory;

import javax.websocket.Decoder;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;
import java.lang.reflect.Type;

/**
 * Utilities for serializing messages.
 */
public class MessageSerializer {
    /**
     * register message class hierarchy with GSON
     */
    private static final RuntimeTypeAdapterFactory<Message> runtimeTypeAdapterFactory =
            Message.Type.registerSubtypes(RuntimeTypeAdapterFactory.of(Message.class, "type", true));

    /**
     * type hint for GSON
     */
    private static final TypeToken<Message> typeToken = new TypeToken<>() {
    };

    /**
     * GSON facilitates JSON serialization
     */
    private static final Gson gson = new GsonBuilder()
            .excludeFieldsWithoutExposeAnnotation()
            .registerTypeAdapterFactory(runtimeTypeAdapterFactory)
            .registerTypeAdapter(Message.Type.class, new MessageTypeTypeAdapter())
            .create();

    /**
     * instructs Java's WebSocket library to encode messages with JSON
     */
    public static class MessageEncoder implements Encoder.Text<Message> {
        public String encode(Message message) {
            return gson.toJson(message);
        }

        public void init(EndpointConfig endpointConfig) {
        }

        public void destroy() {
        }
    }

    /**
     * decodes message objects from JSON (respecting the polymorphic class hierarchy)
     */
    public static class MessageDecoder implements Decoder.Text<Message> {
        public Message decode(String s) {
            return gson.fromJson(s, typeToken.getType());
        }

        public boolean willDecode(String s) {
            return s != null;
        }

        public void init(EndpointConfig endpointConfig) {
        }

        public void destroy() {
        }
    }

    private static class MessageTypeTypeAdapter implements JsonSerializer<Message.Type>, JsonDeserializer<Message.Type> {
        public JsonElement serialize(Message.Type src, Type typeOfSrc, JsonSerializationContext context) {
            return new JsonPrimitive(src.toString());
        }

        public Message.Type deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
            try {
                return new Message.Type(json.getAsJsonPrimitive().getAsString());
            } catch (Message.InvalidMessageException e) {
                throw new JsonParseException(e);
            }
        }
    }
}
