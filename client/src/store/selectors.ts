/**
 * Selectors are used to cache objects that result from the Redux state.
 * For example, a feature model should not be recomputed every time any part of the Redux
 * store changes, but only when parts related to the feature model change.
 */

import createCachedSelector from 're-reselect';
import FeatureDiagram from '../modeling/FeatureModel';
import {State, Session, FeatureDiagramSession} from './types';
import logger from '../helpers/logger';
import {ArtifactPath, isArtifactPathEqual, artifactPathToString, artifactPathCacheKey} from '../types';
import {FeatureModel} from '../modeling/types';
import {getCurrentArtifactPath} from '../router';

export function isFeatureDiagramSession(session?: Session): session is FeatureDiagramSession {
    return typeof session !== 'undefined' &&
        (<FeatureDiagramSession>session).kernelFeatureModel !== undefined;
}

export function isEditingFeatureModel(state: State): boolean {
    const currentArtifactPath = getCurrentArtifactPath(state.sessions);
    if (!currentArtifactPath)
        return false;
    const session = lookupSession(state.sessions, currentArtifactPath);
    return isFeatureDiagramSession(session);
}

const lookupSession = (sessions: Session[], artifactPath: ArtifactPath): Session => {
    const session = sessions
            .find(session => isArtifactPathEqual(session.artifactPath, artifactPath));
        if (!session)
            throw new Error(`did not join session for artifact ${artifactPathToString(artifactPath)}`);
        return session;
};

export const getSession = createCachedSelector(
    (state: State, artifactPath: ArtifactPath) => lookupSession(state.sessions, artifactPath),
    session => session)(
        (_state: State, artifactPath: ArtifactPath) => artifactPathCacheKey(artifactPath));

export function getCurrentSession(state: State): Session | undefined {
    const currentArtifactPath = getCurrentArtifactPath(state.sessions);
    return currentArtifactPath ? getSession(state, currentArtifactPath) : undefined;
}

const featureModelSessionKeySelector = <T>(key: string) => (state: State, artifactPath: ArtifactPath): T | undefined => {
    const session = getSession(state, artifactPath);
    if (session && isFeatureDiagramSession(session))
        return (session as any)[key];
    return undefined;
};

export const getFeatureModel = createCachedSelector(
    featureModelSessionKeySelector('kernelFeatureModel'),
    featureModelSessionKeySelector('collapsedFeatureIDs'),
    (kernelFeatureModel?: FeatureModel, collapsedFeatureIDs?: string[]): FeatureDiagram | undefined => {
        logger.infoTagged({tag: 'redux'}, () => 'updating feature model selector');
        if (!kernelFeatureModel || !collapsedFeatureIDs)
            return undefined;
        return new FeatureDiagram(kernelFeatureModel).collapse(collapsedFeatureIDs);
    }
)((_state: State, artifactPath: ArtifactPath) => artifactPathCacheKey(artifactPath));

export function getCurrentFeatureModel(state: State): FeatureDiagram | undefined {
    const currentArtifactPath = getCurrentArtifactPath(state.sessions);
    return currentArtifactPath ? getFeatureModel(state, currentArtifactPath) : undefined;
}