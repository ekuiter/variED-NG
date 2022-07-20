package de.featjar.varied.util;

import de.featjar.model.FeatureModel;
import de.featjar.model.io.FeatureModelFormatManager;
import de.featjar.util.data.Result;
import de.featjar.util.io.IO;
import org.pmw.tinylog.Logger;

import java.io.IOException;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;

public class FeatureModels {
    public static FeatureModel load(URL url) {
        Logger.debug("loading feature model from {}", url);
        return IO.load(url, FeatureModelFormatManager.getInstance()).orElseThrow();
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
}
