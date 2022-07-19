import FeatureModel from './FeatureModel';
import {ApiConstraintFormula} from './types';

const featureExists = (featureID: string, featureModel: FeatureModel): boolean => !!featureModel.getFeature(featureID);
const featuresExist = (featureIDs: string[], featureModel: FeatureModel): boolean =>
    featureIDs.length === featureModel.getFeatures(featureIDs).length;

export const preconditions = {
    featureDiagram: {
        feature: {
            createBelow: featureExists,

            createAbove: (featureIDs: string[], featureModel: FeatureModel): boolean =>
                featureIDs.length > 0 && featuresExist(featureIDs, featureModel) && featureModel.isSiblingFeatures(featureIDs),

            remove: (featureIDs: string[], featureModel: FeatureModel): boolean => {
                const features = featureModel.getFeatures(featureIDs);
                return featureIDs.length === features.length
                    && !features.some(feature => feature.isRoot && (!feature.hasChildren || feature.node.children!.length > 1))
                    && !features.some(feature => !!feature.node.parent && featureIDs.includes(feature.node.parent.feature().ID));
            },

            removeSubtree: (featureIDs: string[], featureModel: FeatureModel): boolean => {
                const features = featureModel.getFeatures(featureIDs);
                if (featureIDs.length !== features.length)
                    return false;
                return !features.some(feature => feature.isRoot);
            },

            moveSubtree: (featureID: string, featureParentID: string, featureModel: FeatureModel): boolean =>
                !featureModel.getFeature(featureID)!.getFeatureIDsBelow().includes(featureParentID),

            setName: featureExists,
            setDescription: featureExists,

            properties: {
                setAbstract: featuresExist,
                setHidden: featuresExist,

                setOptional: (featureIDs: string[], featureModel: FeatureModel): boolean => {
                    const features = featureModel.getFeatures(featureIDs);
                    if (featureIDs.length !== features.length)
                        return false;
                    return !features.some(feature => feature.isRoot || feature.node.parent!.feature().isGroup);
                },

                setGroupType: (featureIDs: string[], featureModel: FeatureModel): boolean => {
                    const features = featureModel.getFeatures(featureIDs);
                    if (featureIDs.length !== features.length)
                        return false;
                    return !features.some(feature => !feature.node.children || feature.node.children.length <= 1);
                }
            }
        },

        constraint: {
            create: (formula: ApiConstraintFormula, featureModel: FeatureModel): boolean => true,

            set: (constraintID: string, formula: ApiConstraintFormula, featureModel: FeatureModel): boolean => 
                !!featureModel.getConstraint(constraintID),

            remove: (constraintID: string, featureModel: FeatureModel): boolean =>
                !!featureModel.getConstraint(constraintID)
        }
    }
};