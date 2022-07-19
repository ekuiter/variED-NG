package de.featjar.varied.api;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import de.featjar.formula.structure.Formula;
import de.featjar.formula.structure.atomic.literal.BooleanLiteral;
import de.featjar.formula.structure.compound.*;
import de.featjar.model.Feature;
import de.featjar.model.FeatureModel;
import de.featjar.model.FeatureTree;

public class Payload {
    public static JsonObject fromFeatureModel(FeatureModel featureModel) {
        JsonObject root = new JsonObject();
        root.add("featureTree", fromFeatureTree(featureModel.getFeatureTree()));
        JsonObject constraints = new JsonObject();
        featureModel.getConstraints().forEach(constraint -> {
            JsonObject o = new JsonObject();
            o.addProperty("ID", constraint.getIdentifier().toString());
            o.add("formula", fromFormula(constraint.getFormula()));
            constraints.add(constraint.getIdentifier().toString(), o);
        });
        root.add("constraints", constraints);
        return root;
    }

    private static JsonObject fromFeatureTree(FeatureTree featureTree) {
        Feature feature = featureTree.getFeature();
        JsonObject o = new JsonObject();
        o.addProperty("id", feature.getIdentifier().toString());
        o.addProperty("parentId", featureTree.getParent().map(parent -> parent.getFeature().getIdentifier().toString()).orElse(null));
        o.addProperty("name", feature.getName());
        o.addProperty("description", feature.getDescription().orElse(null));
        o.addProperty("groupType", featureTree.isAnd() ? "and" : featureTree.isOr() ? "or" : "alternative");
        o.addProperty("optional", !featureTree.isMandatory());
        o.addProperty("hidden", feature.isHidden());
        o.addProperty("abstract", feature.isAbstract());
        JsonArray c = new JsonArray();
        featureTree.getChildren().stream().map(Payload::fromFeatureTree).forEach(c::add);
        o.add("children", c);
        return o;
    }

    private static JsonArray fromFormula(Formula formula) {
        JsonArray a = new JsonArray();
        if (formula == null)
            return a;

        if (formula instanceof BooleanLiteral) {
            final BooleanLiteral literal = (BooleanLiteral) formula;
            if (literal.isPositive())
                a.add(String.valueOf(literal.getVariable()));
            else {
                JsonArray opNot = new JsonArray();
                opNot.add("not");
                opNot.add(String.valueOf(literal.getVariable()));
                a.add(opNot);
            }
            return a;
        } else if (formula instanceof Or)
            a.add("or");
        else if (formula instanceof Biimplies)
            a.add("biimplies");
        else if (formula instanceof Implies)
            a.add("implies");
        else if (formula instanceof And)
            a.add("and");
        else if (formula instanceof Not)
            a.add("not");
        else {
            a.add("error:" + formula.getName());
            return a;
        }

        for (final Formula child : formula.getChildren())
            a.add(fromFormula(child));
        return a;
    }
}
