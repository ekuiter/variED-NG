import React, {CSSProperties} from 'react';
import {StateDerivedProps, State} from '../store/types';
import {getArtifactPathFromLocation} from '../router';
import {isArtifactPathEqual, RouteProps} from '../types';
import SplitView from './SplitView';
import ConstraintsView, {enableConstraintsView} from './constraintsView/ConstraintsView';
import logger from '../helpers/logger';
import {getCurrentSession, isFeatureDiagramSession, getCurrentFeatureModel} from '../store/selectors';
import actions from '../store/actions';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';
import FeatureDiagramView from './featureDiagramView/FeatureDiagramView';
import {Spinner, SpinnerSize} from '@fluentui/react';

type FeatureDiagramRouteProps = StateDerivedProps & RouteProps;

class FeatureDiagramRoute extends React.Component<FeatureDiagramRouteProps> {
    componentDidMount() {
        this.onRouteChanged();
    }

    componentDidUpdate(prevProps: FeatureDiagramRouteProps) {
        if (this.props.location !== prevProps.location)
            this.onRouteChanged();
    }

    onRouteChanged() {
        const artifactPath = getArtifactPathFromLocation();
            if (artifactPath && !this.props.sessions!.find(session =>
                isArtifactPathEqual(session.artifactPath, artifactPath))) {
                    this.props.onJoinRequest!({artifactPath}); // TODO: error handling
                }
    }

    render() {
        return <SplitView
            settings={this.props.settings!}
            onSetSetting={this.props.onSetSetting!}
            renderPrimaryView={(style: CSSProperties) =>
                this.props.featureModel
                    ? <FeatureDiagramView
                        featureDiagramLayout={this.props.featureDiagramLayout!}
                        currentArtifactPath={this.props.currentArtifactPath!}
                        settings={this.props.settings!}
                        {...this.props}
                        style={style}/>
                    : <div style={{display: 'flex'}}>
                        <Spinner size={SpinnerSize.large}/>
                    </div>}
            renderSecondaryView={() => <ConstraintsView featureModel={this.props.featureModel!}/>}
            enableSecondaryView={() => enableConstraintsView(this.props.featureModel)}/>;
    }
}

export default withRouter(connect(
    logger.mapStateToProps('FeatureModelRouteContainer', (state: State): StateDerivedProps => {
        const session = getCurrentSession(state),
            props: StateDerivedProps = {
                settings: state.settings,
                sessions: state.sessions,
                overlay: state.overlay,
                overlayProps: state.overlayProps,
                myself: state.myself
            };
            if (!session || !isFeatureDiagramSession(session))
                return props;
        return {
            ...props,
            featureModel: getCurrentFeatureModel(state),
            currentArtifactPath: session.artifactPath,
            featureDiagramLayout: session.layout,
            isSelectMultipleFeatures: session.isSelectMultipleFeatures,
            selectedFeatureIDs: session.selectedFeatureIDs,
            users: session.users
        };
    }),
    (dispatch): StateDerivedProps => ({
        onSetSetting: payload => dispatch(actions.settings.set(payload)),
        onJoinRequest: payload => dispatch<any>(actions.server.joinRequest(payload)),
        onShowOverlay: payload => dispatch(actions.ui.overlay.show(payload)),
        onHideOverlay: payload => dispatch(actions.ui.overlay.hide(payload)),
        onSetSelectMultipleFeatures: payload => dispatch(actions.ui.featureDiagram.feature.setSelectMultiple(payload)),
        onSelectFeature: payload => dispatch(actions.ui.featureDiagram.feature.select(payload)),
        onDeselectFeature: payload => dispatch(actions.ui.featureDiagram.feature.deselect(payload)),
        onExpandFeatures: payload => dispatch(actions.ui.featureDiagram.feature.expand(payload)),
        onDeselectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.deselectAll()),
        onToggleFeatureGroupType: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.toggleGroup(payload)),
        onToggleFeatureOptional: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.toggleOptional(payload))
    })
)(FeatureDiagramRoute));