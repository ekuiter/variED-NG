package de.featjar.varied.util;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import de.featjar.formula.structure.Formula;
import de.featjar.formula.structure.atomic.literal.BooleanLiteral;
import de.featjar.formula.structure.atomic.literal.Literal;
import de.featjar.formula.structure.compound.*;
import de.featjar.model.FeatureModel;
import de.featjar.model.io.FeatureModelFormatManager;
import de.featjar.util.data.Result;
import de.featjar.util.io.IO;
import org.pmw.tinylog.Logger;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

public class FeatureModels {
    public static FeatureModel load(Path path) {
        Logger.debug("loading feature model from {}", path);
        return IO.load(path, FeatureModelFormatManager.getInstance()).orElseThrow();
    }

    public static FeatureModel load(String source, String fileName) {
        Logger.debug("loading feature model from a string");
        return IO.load(source, Paths.get(fileName), FeatureModelFormatManager.getInstance()).orElseThrow();
    }

    public static String serialize(FeatureModel featureModel, String formatId) {
        Logger.debug("serializing feature model with format {}", formatId);
        if (featureModel == null)
            throw new RuntimeException("no feature model given");
        return FeatureModelFormatManager.getInstance().getFormatById(formatId).flatMap(format -> {
            try {
                return Result.of(IO.print(featureModel, format));
            } catch (IOException e) {
                return Result.empty(e);
            }
        }).orElseThrow();
    }

    public static String serialize(FeatureModel featureModel) {
        return serialize(featureModel, "de.featjar.model.io.xml.XmlFeatureModelFormat");
    }

    public static JsonObject toJson(FeatureModel featureModel) {
        JsonObject root = new JsonObject();

        JsonObject features = new JsonObject();
        featureModel.getFeatures().forEach(feature -> {
            JsonObject o = new JsonObject();
            o.addProperty("ID", feature.getIdentifier().toString());
            o.addProperty("parent-ID", feature.getFeatureTree().getParent().map(p -> p.getFeature().getIdentifier().toString()).orElse(null));
            o.addProperty("name", feature.getName());
            o.addProperty("description", feature.getDescription().orElse(null));
            o.addProperty("group-type", feature.getFeatureTree().isAnd() ? "and" : feature.getFeatureTree().isOr() ? "or" : "alternative");
            o.addProperty("optional?", !feature.getFeatureTree().isMandatory());
            o.addProperty("hidden?", feature.isHidden());
            o.addProperty("abstract?", feature.isAbstract());
            features.add(feature.getIdentifier().toString(), o);
        });
        root.add("features", features);

        JsonObject constraints = new JsonObject();
        featureModel.getConstraints().forEach(constraint -> {
            JsonObject o = new JsonObject();
            o.addProperty("ID", constraint.getIdentifier().toString());
            final JsonArray op = new JsonArray();
            createConstraint(op, constraint.getFormula());
            o.add("formula", op);
            o.addProperty("graveyarded?", false);
            if (false)
                constraints.add(constraint.getIdentifier().toString(), o);
        });
        root.add("constraints", constraints);

        JsonObject childrenCache = new JsonObject();
        featureModel.getFeatures().forEach(feature -> {
            JsonArray o = new JsonArray();
            feature.getFeatureTree().getChildren().forEach(c -> o.add(c.getFeature().getIdentifier().toString()));
            childrenCache.add(feature.getIdentifier().toString(), o);
        });
        root.add("children-cache", childrenCache);

        return root;
    }

    private static void createConstraint(JsonArray formulaList, Formula formula) {
        if (formula == null)
            return;

        final JsonArray op = new JsonArray();
        if (formula instanceof BooleanLiteral) {
            final BooleanLiteral literal = (BooleanLiteral) formula;
            if (literal.isPositive())
                formulaList.add(String.valueOf(literal.getVariable()));
            else {
                JsonArray opNot = new JsonArray();
                opNot.add("not");
                opNot.add(String.valueOf(literal.getVariable()));
                formulaList.add(opNot);
            }
            return;
        } else if (formula instanceof Or)
            op.add(("disj"));
        else if (formula instanceof Biimplies)
            op.add(("eq"));
        else if (formula instanceof Implies)
            op.add(("imp"));
        else if (formula instanceof And)
            op.add(("conj"));
        else if (formula instanceof Not)
            op.add(("not"));
        else {
            //Logger.error("unknown operator " + formula.getClass() + " encountered");
            return;
        }

        for (final Formula child : formula.getChildren())
            createConstraint(op, child);

        formulaList.add((op));
    }
}
