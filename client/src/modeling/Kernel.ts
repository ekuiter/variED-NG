import {ArtifactPath} from '../types';
import {KernelContext, State, KernelData} from '../store/types';
import {GroupType, KernelFeatureModel, KernelConstraintFormula, KernelCombinedEffect} from './types';

class Kernel {

    static run<T>(state: State, artifactPath: ArtifactPath | undefined, fn: (kernel: Kernel) => T):
    [KernelContext, T] {
        return [null, null] as unknown as [KernelContext, T];
    }

    static initialize(artifactPath: ArtifactPath, siteID: string, context: string):
    [KernelContext, KernelCombinedEffect] {
        return [null, null] as unknown as [KernelContext, KernelCombinedEffect];
    }

    _initialize(siteID: string, context: string): KernelCombinedEffect {
        return null as unknown as KernelCombinedEffect;
    }

    generateOperation(POSequence: KernelData): [KernelFeatureModel, string] {
        const [kernelFeatureModel, operation]: [KernelData, string] = [null, null] as unknown as [KernelData, string];
        return [kernelFeatureModel, operation];
    }

    generateHeartbeat(): string {
        return null as unknown as string;
    }

    receiveMessage(message: string): KernelCombinedEffect {
        return null as unknown as KernelCombinedEffect;
    }

    resolveConflict(versionID: string): KernelFeatureModel {
        return null as unknown as KernelFeatureModel;
    }

    GC(): void {
    }

    operationCompose(...POSequences: KernelData[]): KernelData {
    }

    operationCreateFeatureBelow(parentID: string): KernelData {
    }

    operationCreateFeatureAbove(...IDs: string[]): KernelData {
    }

    operationRemoveFeatureSubtree(ID: string): KernelData {
    }

    operationMoveFeatureSubtree(ID: string, parentID: string): KernelData {
    }

    operationRemoveFeature(ID: string): KernelData {
    }

    operationSetFeatureOptional(ID: string, isOptional: boolean): KernelData {
    }

    operationSetFeatureGroupType(ID: string, groupType: GroupType): KernelData {
    }

    operationSetFeatureProperty(ID: string, property: string, value: any): KernelData {
    }

    operationCreateConstraint(formula: KernelConstraintFormula): KernelData {
    }

    operationSetConstraint(ID: string, formula: KernelConstraintFormula): KernelData {
    }

    operationRemoveConstraint(ID: string): KernelData {
    }
}

export default Kernel;