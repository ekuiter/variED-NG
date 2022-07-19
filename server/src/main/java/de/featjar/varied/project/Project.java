package de.featjar.varied.project;

import de.featjar.varied.util.Strings;
import org.pmw.tinylog.Logger;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class Project {
    private final String name;
    private final Map<String, Artifact> artifacts = new ConcurrentHashMap<>();

    public Project(String name) {
        if (!Strings.isPresent(name))
            throw new RuntimeException("no name given for project");
        if (name.contains(Artifact.Path.SEPARATOR))
            throw new RuntimeException(Artifact.Path.SEPARATOR + " not allowed in project name");
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public String toString() {
        return name;
    }

    Artifact getArtifact(String name) {
        return artifacts.get(name.toLowerCase());
    }

    public void addArtifact(Artifact artifact) {
        Logger.info("adding artifact {} to project {}", artifact, this);
        String name = artifact.getName().toLowerCase();
        if (!Strings.isPresent(name))
            throw new RuntimeException("no name given for artifact");
        if (artifact.getProject() != this)
            throw new RuntimeException("artifact registered with another project");
        if (artifacts.containsValue(artifact))
            throw new RuntimeException("artifact already registered");
        if (artifacts.containsKey(name))
            throw new RuntimeException("another artifact already has that name, choose another name");
        artifacts.put(name, artifact);
    }

    public void removeArtifact(Artifact artifact) {
        Logger.info("removing artifact {} from project {}", artifact, this);
        artifacts.remove(artifact.getName().toLowerCase());
    }

    public Collection<Artifact> getArtifacts() {
        return artifacts.values();
    }
}