/**
 * This file contains FeatureIDE compatible bindings.
 * Because operations are implemented on the server using FeatureIDE, we need to mimic
 * its API if we want to provide optimistic UI on the client. Only methods that are
 * actually used have to be implemented here. (The original API is shown in comments.)
 * (There are other approaches, such as compiling/transpiling FeatureIDE automatically
 * to JavaScript with TeaVM, Cheerpj or JSweet. Due to many (big) dependencies, this
 * is not feasible though, and this approach is very lightweight.)
 */

import constants from './constants';
import {FeatureType} from './modeling/types';

const serialization = constants.server.featureModel.serialization;

class IFeatureStructure {
    correspondingFeature: IFeature;
    parent: IFeatureStructure | null = null;
    children: IFeatureStructure[] = [];
    and: boolean = true;
    multiple: boolean = false;
    mandatory: boolean = false;
    hidden: boolean = false;
    concrete: boolean = true;

    // void addChild(IFeatureStructure newChild);
    addChild(newChild: IFeatureStructure): void {
        this.children.push(newChild);
        newChild.setParent(this);
    }
    // void addChildAtPosition(int index, IFeatureStructure newChild);
    addChildAtPosition(index: number, newChild: IFeatureStructure): void {
        if (index > this.getChildrenCount())
			this.children.push(newChild);
		else
			this.children.splice(index, 0, newChild);
		newChild.setParent(this);
    }
    // void changeToAlternative();
    changeToAlternative(): void {
        if (this.getChildrenCount() <= 1)
			return;
		this.and = false;
		this.multiple = false;
    }
    // void changeToAnd();
    changeToAnd(): void {
        this.and = true;
		this.multiple = false;
    }
    // void changeToOr();
    changeToOr(): void {
        if (this.getChildrenCount() <= 1)
			return;
		this.and = false;
		this.multiple = true;
    }
	// IFeatureStructure cloneSubtree(IFeatureModel newFeatureModel);
    // int getChildIndex(IFeatureStructure feature);
    getChildIndex(feature: IFeatureStructure): number {
        return this.children.indexOf(feature);
    }
    // List<IFeatureStructure> getChildren();
    getChildren(): IFeatureStructure[] {
        return this.children;
    }
    // int getChildrenCount();
    getChildrenCount(): number {
        return this.children.length;
    }
    // IFeature getFeature();
    getFeature(): IFeature {
        return this.correspondingFeature;
    }
	// IFeatureStructure getFirstChild();
	// IFeatureStructure getLastChild();
    // IFeatureStructure getParent();
    getParent(): IFeatureStructure | null {
        return this.parent;
    }
	// Collection<IConstraint> getRelevantConstraints();
    // boolean hasChildren();
    hasChildren(): boolean {
        return this.getChildrenCount() > 0;
    }
	// boolean hasVisibleChildren(boolean showHiddenFeatures);
	// boolean hasHiddenParent();
	// boolean hasInlineRule();
    // boolean isAbstract();
    isAbstract(): boolean {
        return !this.isConcrete();
    }
    // boolean isAlternative();
    isAlternative(): boolean {
        return !this.and && !this.multiple && this.getChildrenCount() > 1;
    }
	// boolean isAncestorOf(IFeatureStructure next);
    // boolean isAnd();
    isAnd(): boolean {
        return this.and || this.getChildrenCount() <= 1;
    }
	// boolean isANDPossible();
    // boolean isConcrete();
    isConcrete(): boolean {
        return this.concrete;
    }
	// boolean isFirstChild(IFeatureStructure child);
    // boolean isHidden();
    isHidden(): boolean {
        return this.hidden;
    }
    // boolean isMandatory();
    isMandatory(): boolean {
        return this.parent === null || !this.parent.isAnd() || this.mandatory;
    }
	// boolean isMandatorySet();
    // boolean isMultiple();
    isMultiple(): boolean {
        return this.multiple && this.getChildrenCount() > 1;
    }
    // boolean isOr();
    isOr(): boolean {
        return !this.and && this.multiple && this.getChildrenCount() > 1;
    }
	// boolean isRoot();
    // void removeChild(IFeatureStructure child);
    removeChild(child: IFeatureStructure): void {
        const idx = this.children.indexOf(child);
        if (idx === -1)
            throw new Error('no such element');
        this.children.splice(idx, 1);
		child.setParent(null);
    }
    // IFeatureStructure removeLastChild();
    removeLastChild(): IFeatureStructure {
        const child = this.children.pop();
        if (!child)
            throw new Error('there is no last child');
		child.setParent(null);
		return child;
    }
	// void replaceChild(IFeatureStructure oldChild, IFeatureStructure newChild);
    // void setAbstract(boolean value);
    setAbstract(value: boolean): void {
        this.concrete = !value;
    }
    // void setAlternative();
    setAlternative(): void {
        this.and = false;
        this.multiple = false;
    }
    // void setAnd();
    setAnd(): void {
        this.and = true;
    }
	// void setAND(boolean and);
    // void setChildren(List<IFeatureStructure> children);
    setChildren(children: IFeatureStructure[]): void {
        this.children.length = 0;
        children.forEach(child => this.addChild(child));
    }
    // void setHidden(boolean hid);
    setHidden(hidden: boolean): void {
        this.hidden = hidden;
    }
    // void setMandatory(boolean mandatory);
    setMandatory(mandatory: boolean): void {
        this.mandatory = mandatory;
    }
    // void setMultiple(boolean multiple);
    setMultiple(multiple: boolean): void {
        this.multiple = multiple;
    }
    // void setOr();
    setOr(): void {
        this.and = false;
        this.multiple = true;
    }
    // void setParent(IFeatureStructure newParent);
    setParent(newParent: IFeatureStructure | null): void {
        if (newParent === this.parent)
			return;
		this.parent = newParent;
    }
	// void setRelevantConstraints();
	// void setRelevantConstraints(List<IConstraint> constraints);
}

class IFeatureProperty {
    correspondingFeature: IFeature;
    description: string = '';

    // IFeatureProperty clone(IFeature newFeature);
    // String getDescription();
    getDescription(): string {
        return this.description;
    }
	// String getDisplayName();
	// IFeature getFeature();
	// FeatureStatus getFeatureStatus();
    // void setDescription(CharSequence description);
    setDescription(description: string): void {
        this.description = description;
    }
	// void setDisplayName(CharSequence name);
	// void setFeatureStatus(FeatureStatus status);
	// void setFeatureStatus(FeatureStatus stat, boolean fire);
	// boolean isConstraintSelected();
	// boolean selectConstraint(boolean state);
}

class IFeature {
    name: string;
    featureStructure: IFeatureStructure;
    property: IFeatureProperty;

    // IFeature clone(IFeatureModel newFeatureModel, IFeatureStructure newStructure);
    // IFeatureProperty getProperty();
    getProperty(): IFeatureProperty {
        return this.property;
    }
	// IPropertyContainer getCustomProperties();
    // IFeatureStructure getStructure();
    getStructure(): IFeatureStructure {
        return this.featureStructure;
    }
    // String createTooltip(Object... objects);
    // IFeatureModel getFeatureModel();
	// long getInternalId();
    // String getName();
    getName(): string {
        return this.name;
    }
	// void setName(String name);
}

class IFeatureModelStructure {
    correspondingFeatureModel: IFeatureModel;
    rootFeature: IFeatureStructure;

	// IFeatureModelStructure clone(IFeatureModel newFeatureNodel);
	// IFeatureModel getFeatureModel();
	// Collection<IFeature> getFeaturesPreorder();
    // IFeatureStructure getRoot();
    getRoot(): IFeatureStructure {
        return this.rootFeature;
    }
	// boolean hasAbstract();
	// boolean hasAlternativeGroup();
	// boolean hasAndGroup();
	// boolean hasConcrete();
	// boolean hasHidden();
	// boolean hasIndetHidden();
	// boolean hasMandatoryFeatures();
	// boolean hasOptionalFeatures();
	// boolean hasOrGroup();
	// int numAlternativeGroup();
	// int numOrGroup();
    // void replaceRoot(IFeatureStructure feature);
    replaceRoot(feature: IFeatureStructure): void {
        this.correspondingFeatureModel.deleteFeatureFromTable(this.rootFeature.getFeature());
		feature.setParent(null);
		this.rootFeature = feature;
    }
    // void setRoot(IFeatureStructure root);
    setRoot(root: IFeatureStructure): void {
        this.rootFeature = root;
    }
	// boolean hasFalseOptionalFeatures();
	// boolean hasUnsatisfiableConstraints();
	// boolean hasTautologyConstraints();
	// boolean hasDeadConstraints();
	// boolean hasVoidModelConstraints();
	// boolean hasRedundantConstraints();
	// boolean hasDeadFeatures();
	// void setShowHiddenFeatures(boolean showHiddenFeatures);
}

export class IFeatureModel {
    serializedFeatureModel: object;
    featureTable: {[x: string]: IFeature} = {};
    structure: IFeatureModelStructure;

    createFeature(name: string): IFeature {
        const feature = new IFeature(),
            featureStructure = new IFeatureStructure(),
            featureProperty = new IFeatureProperty();
        feature.name = name;
        feature.featureStructure = featureStructure;
        feature.property = featureProperty;
        featureStructure.correspondingFeature = feature;
        featureProperty.correspondingFeature = feature;
        return feature;
    }

    // a serialized JSON feature model as received from the server
    static fromJSON(serializedFeatureModel: object): IFeatureModel {
        if (!serializedFeatureModel[serialization.STRUCT] || serializedFeatureModel[serialization.STRUCT].length !== 1)
            throw new Error('feature model has no structure');
    
        const featureModel = new IFeatureModel(),
            featureModelStructure = new IFeatureModelStructure();
        featureModel.structure = featureModelStructure;
        featureModelStructure.correspondingFeatureModel = featureModel;
        featureModel.serializedFeatureModel = serializedFeatureModel;
    
        function parseFeatures(nodes: object[], parent: IFeature | null): void {
            nodes.forEach(node => {
                const type = node[serialization.TYPE],
                    name = node[serialization.NAME];
                if (featureModel.getFeature(name) !== null)
                    throw new Error('Duplicate entry for feature: ' + name);
                const feature = featureModel.createFeature(name);
                if (node[serialization.DESCRIPTION])
                    feature.getProperty().setDescription(node[serialization.DESCRIPTION]);
                feature.getStructure().setMandatory(true);
                if (type === FeatureType.and)
                    feature.getStructure().setAnd();
                else if (type === FeatureType.alt)
                    feature.getStructure().setAlternative();
                else if (type === FeatureType.or)
                    feature.getStructure().setOr();
                else if (type === FeatureType.feature) {}
                else
                    throw new Error('Unknown feature type: ' + type);
                feature.getStructure().setAbstract(!!node[serialization.ABSTRACT]);
                feature.getStructure().setMandatory(!!node[serialization.MANDATORY]);
                feature.getStructure().setHidden(!!node[serialization.HIDDEN]);
                featureModel.addFeature(feature);
                if (parent === null)
                    featureModel.getStructure().setRoot(feature.getStructure());
                else
                    parent.getStructure().addChild(feature.getStructure());
                if (node['children'] && node['children'].length > 0)
                    parseFeatures(node['children'], feature);
            });
        }
    
        parseFeatures(serializedFeatureModel[serialization.STRUCT], null);
        return featureModel;
    }

    // serializes feature model back to JSON (to allow storing in Redux)
    toJSON(): object {
        function writeAttributes(obj: object, feature: IFeature): object {
            obj[serialization.NAME] = feature.getName();
            if (feature.getStructure().isHidden())
                obj[serialization.HIDDEN] = true;
            if (feature.getStructure().isMandatory() &&
                ((feature.getStructure().getParent() !== null && feature.getStructure().getParent()!.isAnd()) ||
                    feature.getStructure().getParent() == null))
                    obj[serialization.MANDATORY] = true;
            if (feature.getStructure().isAbstract())
                obj[serialization.ABSTRACT] = true;
            const description = feature.getProperty().getDescription();
            if (description !== null && description.trim())
                obj[serialization.DESCRIPTION] = description.replace("\r", "");
            return obj;
        }

        function serializeFeature(feature: IFeature | null): object {
            if (feature == null)
                throw new Error('no feature given');
            const children = feature.getStructure().getChildren()
                .map(featureStructure => featureStructure.getFeature());
    
            if (children.length === 0)
                return writeAttributes({type: FeatureType.feature}, feature);
            else {
                const obj = {
                    type: feature.getStructure().isAnd()
                    ? FeatureType.and
                    : feature.getStructure().isOr()
                        ? FeatureType.or
                        : feature.getStructure().isAlternative()
                            ? FeatureType.alt
                            : 'unknown',
                    children: children.map(serializeFeature)
                };
                return writeAttributes(obj, feature);    
            }
        }

        return {
            ...this.serializedFeatureModel,
            struct: [serializeFeature(this.getStructure().getRoot().getFeature())]
        };
    }

    // long getId();
    // String getFactoryID();
    // void addConstraint(IConstraint constraint);
    // void addConstraint(IConstraint constraint, int index);
    // boolean addFeature(IFeature feature);
    addFeature(feature: IFeature): boolean {
        const name = feature.getName();
		if (this.featureTable.hasOwnProperty(name))
			return false;
		this.featureTable[name] = feature;
		return true;
    }
    // IFeatureModel clone(IFeature newRoot);
    // void createDefaultValues(CharSequence projectName);
    // boolean deleteFeature(IFeature feature);
    deleteFeature(feature: IFeature): boolean {
        if (feature === this.structure.getRoot().getFeature())
            return false;

        const name = feature.getName();
        if (!this.featureTable.hasOwnProperty(name))
            return false;

        const parent = feature.getStructure().getParent();

        if (parent!.getChildrenCount() === 1) {
            if (feature.getStructure().isAnd()) {
                parent!.setAnd();
            } else if (feature.getStructure().isAlternative()) {
                parent!.setAlternative();
            } else {
                parent!.setOr();
            }
        }

        const index = parent!.getChildIndex(feature.getStructure());
        while (feature.getStructure().hasChildren()) {
            parent!.addChildAtPosition(index, feature.getStructure().removeLastChild());
        }

        parent!.removeChild(feature.getStructure());
        delete this.featureTable[name];
        // featureOrderList.remove(name);
        return true;
    }
    // void deleteFeatureFromTable(IFeature feature);
    deleteFeatureFromTable(feature: IFeature): void {
        delete this.featureTable[feature.getName()];
    }
    // FeatureModelAnalyzer getAnalyser();
    // int getConstraintCount();
    // int getConstraintIndex(IConstraint constraint);
    // List<IConstraint> getConstraints();
    // IFeature getFeature(CharSequence name);
    getFeature(name: string): IFeature | null {
        return this.featureTable[name] || null;
    }
    // List<String> getFeatureOrderList();
    // Iterable<IFeature> getFeatures();
    getFeatures(): IFeature[] {
        return Object.values(this.featureTable);
    }
    // Iterable<IFeature> getVisibleFeatures(boolean showHiddenFeatures);
    // int getNumberOfFeatures();
    // IFeatureModelProperty getProperty();
    // RenamingsManager getRenamingsManager();
    // IFeatureModelStructure getStructure();
    getStructure(): IFeatureModelStructure {
        return this.structure;
    }
    // void handleModelDataChanged();
    // void handleModelDataLoaded();
    // boolean isFeatureOrderUserDefined();
    // void removeConstraint(IConstraint constraint);
    // void removeConstraint(int index);
    // void replaceConstraint(IConstraint constraint, int index);
    // void reset();
    // void setConstraints(final Iterable<IConstraint> constraints);
    // void setFeatureOrderList(final List<String> featureOrderList);
    // void setFeatureOrderUserDefined(boolean featureOrderUserDefined);
    // void setFeatureTable(final Hashtable<String, IFeature> featureTable);
    // Map<String, IFeature> getFeatureTable();
    // IFeatureModel clone();
    // Object getUndoContext();
    // void setUndoContext(Object undoContext);
    // void setFeatureOrderListItem(int i, String newName);
    // void setSourceFile(Path file);
    // Path getSourceFile();
    // long getNextElementId();
    // void setConstraint(int index, IConstraint constraint);
}