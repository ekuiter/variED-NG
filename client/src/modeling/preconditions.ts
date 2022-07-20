import FeatureDiagram, {getFeatureIDsBelow, hasChildren} from './FeatureModel';
import {Formula} from './types';

const featureExists = (featureID: string, featureModel: FeatureDiagram): boolean => !!featureModel.getFeatureTree(featureID);
const featuresExist = (featureIDs: string[], featureModel: FeatureDiagram): boolean =>
    featureIDs.length === featureModel.getFeatures(featureIDs).length;

export const preconditions = {
    featureDiagram: {
        feature: {
            createBelow: featureExists,

            createAbove: (featureIDs: string[], featureModel: FeatureDiagram): boolean =>
                featureIDs.length > 0 && featuresExist(featureIDs, featureModel) && featureModel.areSiblingFeatures(featureIDs),

            remove: (featureIDs: string[], featureModel: FeatureDiagram): boolean => {
                const features = featureModel.getFeatures(featureIDs);
                return featureIDs.length === features.length
                    && !features.some(feature => feature.isRoot && (!hasChildren(feature.node) || feature.node.children!.length > 1))
                    && !features.some(feature => !!feature.node.parent && featureIDs.includes(feature.node.parent.data.id));
            },

            removeSubtree: (featureIDs: string[], featureModel: FeatureDiagram): boolean => {
                const features = featureModel.getFeatures(featureIDs);
                if (featureIDs.length !== features.length)
                    return false;
                return !features.some(feature => feature.isRoot);
            },

            moveSubtree: (featureID: string, featureParentID: string, featureModel: FeatureDiagram): boolean =>
                !getFeatureIDsBelow(featureModel.getFeatureTree(featureID)!.node).includes(featureParentID),

            setName: featureExists,
            setDescription: featureExists,

            properties: {
                setAbstract: featuresExist,
                setHidden: featuresExist,

                setOptional: (featureIDs: string[], featureModel: FeatureDiagram): boolean => {
                    const features = featureModel.getFeatures(featureIDs);
                    if (featureIDs.length !== features.length)
                        return false;
                    return !features.some(feature => feature.isRoot || feature.node.parent!.data.isGroup);
                },

                setGroupType: (featureIDs: string[], featureModel: FeatureDiagram): boolean => {
                    const features = featureModel.getFeatures(featureIDs);
                    if (featureIDs.length !== features.length)
                        return false;
                    return !features.some(feature => !feature.node.children || feature.node.children.length <= 1);
                }
            }
        },

        constraint: {
            create: (formula: Formula, featureModel: FeatureDiagram): boolean => true,

            set: (constraintID: string, formula: Formula, featureModel: FeatureDiagram): boolean => 
                !!featureModel.getConstraintNode(constraintID),

            remove: (constraintID: string, featureModel: FeatureDiagram): boolean =>
                !!featureModel.getConstraintNode(constraintID)
        }
    }
};