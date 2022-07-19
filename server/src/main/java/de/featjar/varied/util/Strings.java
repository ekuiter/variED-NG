package de.featjar.varied.util;

public class Strings {
    public static boolean isPresent(String s) {
        return s != null && !s.trim().isEmpty();
    }

    public static String toClassName(String prefix, String s) {
        s = s.toLowerCase();
        String[] parts = s.split("_");
        StringBuilder className = new StringBuilder(prefix);
        for (String part : parts)
            className.append(part.substring(0, 1).toUpperCase()).append(part.substring(1));
        return className.toString();
    }
}
