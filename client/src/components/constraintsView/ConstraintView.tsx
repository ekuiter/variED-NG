import React, {ReactNode} from 'react';
import {ConstraintNode, createConstraintRenderer} from '../../model/FeatureDiagram';
import constants from '../../constants';

interface Props {
    key: string
    constraint: ConstraintNode
};

const reactConstraintRenderer = createConstraintRenderer<ReactNode>({
    neutral: null,
    _return: s => s,
    returnFeature: (f, idx) => f ? <span key={idx} style={constants.constraint.featureStyle}>{f.name}</span> : null,
    join: (ts, t) => (ts.reduce as any)((acc: ReactNode[], elem: any) =>
        acc === null ? [elem] : [...acc, t, elem], null),
    cacheKey: 'react'
});

export default class extends React.Component<Props> {
    render(): ReactNode {
        return (
            <span className="constraint">
                {this.props.constraint.render(reactConstraintRenderer)}
            </span>
        );
    }
};