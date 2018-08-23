import React from 'react';
import {Callout, DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {getSetting} from '../../../store/settings';
import contextualMenuItems from '../../contextualMenuItems';
import {CommandBar} from 'office-ui-fabric-react/lib/CommandBar';

export default props => {
    const onDismiss = props.onDismiss,
        {gapSpace, width} = getSetting(props.settings, 'featureDiagram.treeLayout.overlay'),
        feature = props.node && props.node.feature();
    if (!feature)
        return null;
    return (
        <Callout target={props.nodeRef}
                 onDismiss={onDismiss}
                 hidden={!props.node}
                 gapSpace={gapSpace}
                 calloutWidth={width}
                 directionalHint={
                     props.direction === 'vertical'
                         ? DirectionalHint.bottomCenter
                         : DirectionalHint.rightCenter}>
            <div className="callout">
                <div className="header">
                    <p>{feature.name}</p>
                </div>
                {feature.description
                    ? <div className="inner">
                        <p>{feature.description}</p>
                    </div>
                    : <div className="inner empty"/>}
                <CommandBar
                    items={[
                        contextualMenuItems.featureDiagram.feature.new(feature.name, onDismiss),
                        contextualMenuItems.featureDiagram.feature.remove(feature.name, onDismiss)
                    ]}
                    farItems={[
                        contextualMenuItems.featureDiagram.feature.details(feature.name, props.onShowPanel)
                    ]}/>
            </div>
        </Callout>
    );
}