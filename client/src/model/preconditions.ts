import FeatureDiagram, {getFeatureIDsBelow, hasChildren} from './FeatureDiagram';
import {Formula} from './types';

const featureExists = (featureID: string, featureModel: FeatureDiagram): boolean => !!featureModel.getFeatureTree(featureID);
const featuresExist = (featureIDs: string[], featureModel: FeatureDiagram): boolean =>
    featureIDs.length === featureModel.getFeatureTrees(featureIDs).length;

export const preconditions = {
    featureDiagram: {
        feature: {
            createBelow: featureExists,

            createAbove: (featureIDs: string[], featureModel: FeatureDiagram): boolean =>
                featureIDs.length > 0 && featuresExist(featureIDs, featureModel) && featureModel.areSiblingFeatures(featureIDs),

            remove: (featureIDs: string[], featureModel: FeatureDiagram): boolean => {
                const features = featureModel.getFeatureNodes(featureIDs);
                return featureIDs.length === features.length
                    && !features.some(feature => feature.data.isRoot && (!hasChildren(feature) || feature.children!.length > 1))
                    && !features.some(feature => !!feature.parent && featureIDs.includes(feature.parent.data.id));
            },

            removeSubtree: (featureIDs: string[], featureModel: FeatureDiagram): boolean => {
                const features = featureModel.getFeatureTrees(featureIDs);
                if (featureIDs.length !== features.length)
                    return false;
                return !features.some(feature => feature.isRoot);
            },

            moveSubtree: (featureID: string, featureParentID: string, featureModel: FeatureDiagram): boolean =>
                !getFeatureIDsBelow(featureModel.getFeatureNode(featureID)!).includes(featureParentID),

            setName: featureExists,
            setDescription: featureExists,

            properties: {
                setAbstract: featuresExist,
                setHidden: featuresExist,

                setOptional: (featureIDs: string[], featureModel: FeatureDiagram): boolean => {
                    const features = featureModel.getFeatureNodes(featureIDs);
                    if (featureIDs.length !== features.length)
                        return false;
                    return !features.some(feature => feature.data.isRoot || feature.parent!.data.isGroup);
                },

                setGroupType: (featureIDs: string[], featureModel: FeatureDiagram): boolean => {
                    const features = featureModel.getFeatureTrees(featureIDs);
                    if (featureIDs.length !== features.length)
                        return false;
                    return !features.some(feature => !feature.children || feature.children.length <= 1);
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