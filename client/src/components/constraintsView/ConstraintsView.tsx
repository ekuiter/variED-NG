import React from 'react';
import FeatureModel, {Constraint} from '../../modeling/FeatureModel';
import {DetailsList, IColumn, SelectionMode} from '@fluentui/react';
import i18n from '../../i18n';
import ConstraintView from './ConstraintView';

export function enableConstraintsView(featureModel?: FeatureModel): boolean {
    return featureModel ? featureModel.constraints.length > 0 : false;
}

interface Props {
    featureModel: FeatureModel
};

export default class extends React.Component<Props> {
    render() {
        const columns: IColumn[] = [{
            key: 'constraint',
            name: i18n.t('commandPalette.constraint'),
            minWidth: 0,
            isRowHeader: true,
            onRender: (constraint: Constraint) => (
                <ConstraintView key={constraint.getKey()} constraint={constraint}/>
            )
        }];

        return (
            <div data-is-scrollable={true} className="scrollable">
                <DetailsList
                    items={this.props.featureModel.constraints}
                    columns={columns}
                    compact={true}
                    selectionMode={SelectionMode.none}
                    isHeaderVisible={false}/>
            </div>
        );
    }
}