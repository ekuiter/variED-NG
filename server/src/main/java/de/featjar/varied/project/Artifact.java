package de.featjar.varied.project;

import com.google.gson.annotations.Expose;
import de.featjar.varied.session.Session;
import de.featjar.varied.util.FeatureModels;
import de.featjar.varied.util.Strings;

import java.net.URL;
import java.util.Objects;
import java.util.function.Supplier;

public abstract class Artifact {
    private final String name;
    private final Project project;

    Artifact(Project project, String name) {
        Objects.requireNonNull(project, "no project given");
        if (!Strings.isPresent(name))
            throw new RuntimeException("no name given for artifact");
        if (name.contains(Path.SEPARATOR))
            throw new RuntimeException(Path.SEPARATOR + " not allowed in artifact name");
        this.name = name;
        this.project = project;
    }

    public String getName() {
        return name;
    }

    public Project getProject() {
        return project;
    }

    public Path getPath() {
        return new Path(project.getName(), name);
    }

    public String toString() {
        return getPath().toString();
    }

    abstract public Session getSession();

    public static class Path {
        static String SEPARATOR = "/";

        @Expose
        String project;

        @Expose
        String artifact;

        Path(String projectName, String artifactName) {
            this.project = projectName;
            this.artifact = artifactName;
        }

        public String getProjectName() {
            if (project == null)
                throw new RuntimeException("no project given in artifact path");
            return project;
        }

        public String getArtifactName() {
            if (artifact == null)
                throw new RuntimeException("no artifact given in artifact path");
            return artifact;
        }

        public String toString() {
            return getProjectName() + SEPARATOR + getArtifactName();
        }
    }

    public static class FeatureModel extends Artifact {
        private final Supplier<de.featjar.model.FeatureModel> featureModelSupplier;
        private Session session;

        public FeatureModel(Project project, String name, String source) {
            this(project, name, source, name + ".xml");
        }

        public FeatureModel(Project project, String name, String source, String fileName) {
            this(project, name, () -> FeatureModels.load(source, fileName));
        }

        public FeatureModel(Project project, String name, URL url) {
            this(project, name, () -> FeatureModels.load(url));
        }

        public FeatureModel(Project project, String name, Supplier<de.featjar.model.FeatureModel> featureModelSupplier) {
            super(project, name);
            this.featureModelSupplier = featureModelSupplier;
        }

        public Session getSession() {
            if (this.session == null)
                this.session = new Session.FeatureModel(getPath(), featureModelSupplier.get());
            return session;
        }
    }
}
