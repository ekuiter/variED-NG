/**
 * The feature diagram is the visual representation of a feature model.
 * There may be different kinds of feature diagrams, referred to as layouts.
 */

import React from 'react';
import VerticalTreeLayout from './treeLayout/VerticalTreeLayout';
import HorizontalTreeLayout from './treeLayout/HorizontalTreeLayout';
import stringify from 'json-stable-stringify';
import {cloneSettings, traverseSettings, Settings} from '../../store/settings';
import {FeatureDiagramLayoutType, ArtifactPath} from '../../types';

const layoutMap = {
    [FeatureDiagramLayoutType.verticalTree]: VerticalTreeLayout,
    [FeatureDiagramLayoutType.horizontalTree]: HorizontalTreeLayout
};

interface Props {
    featureDiagramLayout: FeatureDiagramLayoutType,
    settings: Settings,
    currentArtifactPath: ArtifactPath,
    [x: string]: any
};

export default class extends React.Component<Props> {
    getKey({settings}: {settings: Settings}): string {
        // The key uniquely identifies the layout component instance. If the key changes, the
        // instance is unmounted and a new one is mounted. This is useful for forcing rerenders.
        const clonedFeatureDiagramSettings = cloneSettings(settings.featureDiagram),
            doNotRerenderForPaths: string[] = settings.featureDiagram.doNotRerenderForPaths;
        traverseSettings(clonedFeatureDiagramSettings,
            function(this: object, path: string, key: string, _value: any) {
                // filter settings that should not trigger a rerender
                if (doNotRerenderForPaths.includes(path))
                    (this as any)[key] = undefined;
            });
        // add debug flag to key (as it is managed outside of the featureDiagram settings,
        // but should also trigger a rerender)
        (clonedFeatureDiagramSettings as any).debug = settings.developer.debug;
        // also, we completely rerender the feature diagram when switching feature models
        (clonedFeatureDiagramSettings as any).currentArtifactPath = this.props.currentArtifactPath;        
        return stringify(clonedFeatureDiagramSettings);
    }

    render() {
        const {featureDiagramLayout, ...props} = this.props,
            LayoutComponent: any = layoutMap[featureDiagramLayout];
        return (
            <LayoutComponent key={this.getKey(props)} debug={props.settings.developer.debug} {...props}/>
        );
    }
}