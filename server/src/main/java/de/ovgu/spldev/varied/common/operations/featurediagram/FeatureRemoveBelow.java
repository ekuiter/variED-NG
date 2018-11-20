package de.ovgu.spldev.varied.common.operations.featurediagram;

import de.ovgu.featureide.fm.core.base.IFeature;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.common.operations.BatchOperation;
import de.ovgu.spldev.varied.common.util.BridgeUtils;
import de.ovgu.spldev.varied.common.util.FeatureUtils;

import java.util.LinkedList;
import java.util.List;

// adapted from FeatureTreeDeleteOperation
public class FeatureRemoveBelow extends BatchOperation {
    private IFeatureModel featureModel;
    private LinkedList<IFeature> featureList = new LinkedList<>();
    private LinkedList<IFeature> containedFeatureList = new LinkedList<>();
    private LinkedList<IFeature> andList = new LinkedList<>();
    private LinkedList<IFeature> orList = new LinkedList<>();
    private LinkedList<IFeature> alternativeList = new LinkedList<>();

    public FeatureRemoveBelow(IFeatureModel featureModel, String featureUUID, Object batchContext) throws InvalidOperationException {
        this.featureModel = featureModel;

        // do nothing if the feature has already been removed by another operation in a batch message
        if (featureModel.getFeature(featureUUID) == null && batchContext != null &&
                ((LinkedList<String>) batchContext).contains(featureUUID))
            return;

        IFeature _feature = FeatureUtils.requireFeature(featureModel, featureUUID);
        if (_feature.getStructure().isRoot())
            throw new InvalidOperationException("can not delete root feature and its children");
        final LinkedList<IFeature> list = new LinkedList<>();
        list.add(_feature);
        getFeaturesToDelete(list);

        if (containedFeatureList.isEmpty()) {
            for (final IFeature feat : featureList) {
                if (feat.getStructure().isAnd()) {
                    andList.add(feat);
                } else if (feat.getStructure().isOr()) {
                    orList.add(feat);
                } else if (feat.getStructure().isAlternative()) {
                    alternativeList.add(feat);
                }
                addOperation(new FeatureRemove(featureModel, feat.getName()));
            }
        } else {
            throw new InvalidOperationException("can not delete features because some are contained in constraints");
        }
    }

    public static Object createBatchContext() {
        return new LinkedList<String>();
    }

    public Object nextBatchContext(Object batchContext) {
        LinkedList<String> featuresToDelete = (LinkedList<String>) batchContext;
        featuresToDelete.addAll(BridgeUtils.getFeatureUUIDs(featureList));
        return featuresToDelete;
    }

    private void getFeaturesToDelete(List<IFeature> linkedList) {
        for (final IFeature feat : linkedList) {
            feat.getStructure().setRelevantConstraints();
            if (!feat.getStructure().getRelevantConstraints().isEmpty()) {
                containedFeatureList.add(feat);
            }
            if (feat.getStructure().hasChildren()) {
                getFeaturesToDelete(BridgeUtils.convertToFeatureList(feat.getStructure().getChildren()));
            }
            featureList.add(feat);
        }
    }

    protected void _undo() throws InvalidOperationException {
        super._undo();
        // Set the right group types for the features
        for (final IFeature ifeature : andList) {
            if (featureModel.getFeature(ifeature.getName()) != null) {
                featureModel.getFeature(ifeature.getName()).getStructure().changeToAnd();
            }
        }
        for (final IFeature ifeature : alternativeList) {
            if (featureModel.getFeature(ifeature.getName()) != null) {
                featureModel.getFeature(ifeature.getName()).getStructure().changeToAlternative();
            }
        }
        for (final IFeature ifeature : orList) {
            if (featureModel.getFeature(ifeature.getName()) != null) {
                featureModel.getFeature(ifeature.getName()).getStructure().changeToOr();
            }
        }
    }
}
