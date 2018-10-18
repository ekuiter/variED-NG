/**
 * Selectors are used to cache objects that result from the Redux state.
 * For example, a feature model should not be recomputed every time any part of the Redux
 * store changes, but only when parts related to the feature model change.
 */

import {createSelector} from 'reselect';
import FeatureModel from '../server/FeatureModel';
import {State} from './types';

export const getFeatureModel = createSelector(
    (state: State) => state.server.featureModel,
    (state: State) => state.ui.featureDiagram.collapsedFeatureNames,
    (featureModel: FeatureModel, collapsedFeatureNames: string[]) =>
        featureModel ? new FeatureModel(featureModel, collapsedFeatureNames) : undefined
);