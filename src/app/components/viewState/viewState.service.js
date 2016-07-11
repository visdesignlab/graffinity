/*global d3 */

import {Utils} from "../utils/utils"

export class ViewState {
  constructor($rootScope, $log) {
    "ngInject";
    this.attributeNodeGroup = {};
    this.isNodeIDFiltered = {};
    this.isNodeHidden = {};
    this.filterRanges = {};
    this.filterValues = {};
    this.hasFilters = false;
    this.$scope = $rootScope;
    this.$log = $log;
  }

  ///**
  // * Get the hidden values for the current group.
  // */
  //getOrCreateFilterValues(attribute, attributeNodeGroup) {
  //  let valueList = this.filterValues[attribute];
  //  if (valueList == undefined) {
  //    this.filterValues[attribute] = [];
  //    valueList = this.filterValues[attribute];
  //  }
  //
  //  if (valueList[attributeNodeGroup] == undefined) {
  //    this.filterValues[attribute][attributeNodeGroup] = [];
  //  }
  //
  //  return this.filterValues[attribute][attributeNodeGroup];
  //}
  //
  //static getFilterValuesAsSelection(nodeAttributes, filterValues) {
  //  let selection = {};
  //  for (var i = 0; i < nodeAttributes.length; ++i) {
  //    selection[nodeAttributes[i]] = filterValues.indexOf(nodeAttributes[i]) == -1;
  //  }
  //  return selection;
  //}
  //
  ///**
  // * Get the range for the current attribute, or create one if it doesn't exist.
  // */
  //getOrCreateFilterRange(attribute, attributeNodeGroup, nodeAttributes) {
  //  let rangeList = this.filterRanges[attribute];
  //  if (rangeList == undefined) {
  //    this.filterRanges[attribute] = [];
  //    rangeList = this.filterRanges[attribute];
  //  }
  //
  //  if (rangeList[attributeNodeGroup] == undefined) {
  //    this.filterRanges[attribute][attributeNodeGroup] = [d3.min(nodeAttributes), d3.max(nodeAttributes)];
  //  }
  //
  //  return this.filterRanges[attribute][attributeNodeGroup];
  //}
  //
  ///**
  // * Converts a list of nodeIndexes to an object used as a dictionary.
  // * object[nodeIndex] = !isNodeHidden[nodeIndex]
  // */
  //getHiddenNodesAsSelection(nodeIndexes) {
  //  let selection = {};
  //  for (var i = 0; i < nodeIndexes.length; ++i) {
  //    selection[nodeIndexes[i]] = !this.isNodeIDFiltered[nodeIndexes[i]];
  //  }
  //  return selection;
  //}
  //
  getAttributeNodeGroup(attributeNodeGroup) {
    return this.attributeNodeGroup[attributeNodeGroup];
  }

  getQuantitativeFilter(attribute, attributeNodeGroup) {
    return this.quantitativeFilters[attributeNodeGroup][attribute];
  }

  getCategoricalFilter(attribute, attributeNodeGroup) {
    return this.categoricalFilters[attributeNodeGroup][attribute];
  }

  isPathFiltered(path) {
    let model = this.model;

    let str = "";
    for (let i = 0; i < path.length; i = i + 2) {
      str += this.model.getNodeAttr([path[i]], "state")[0] + " ";
    }

    for (let i = 0; i < path.length; i = i + 2) {
      let currentAttributeNodeGroup = 2;
      if (i == 0) {
        currentAttributeNodeGroup = 0;
      } else if (i == path.length - 1) {
        currentAttributeNodeGroup = 1;
      }
      let attributes = model.getAvailableAttributes();
      for (let j = 0; j < attributes.length; ++j) {
        let attribute = attributes[j];

        if (model.isCategoricalAttribute(attribute)) {
          let value = model.getNodeAttr([path[i]], attribute)[0];
          if (!this.categoricalFilters[currentAttributeNodeGroup][attribute][value]) {
            return true;
          }
        } else {
          let value = model.getNodeAttr([path[i]], attribute)[0];
          if (this.quantitativeFilters[currentAttributeNodeGroup][attribute][0] > value || this.quantitativeFilters[currentAttributeNodeGroup][attribute][1] < value) {
            return true;
          }
        }
      }
    }
    return false;
  }

  //
  ///**
  // *
  // */
  //hideNodes(nodeIndexes) {
  //  for (var i = 0; i < nodeIndexes.length; ++i) {
  //    this.isNodeIDFiltered[nodeIndexes[i]] = true;
  //  }
  //
  //  this.$scope.$broadcast('hideNodes', nodeIndexes, this.isNodeIDFiltered);
  //}
  //
  //isNodeVisibleInAllFilters(nodeIndex, attributeNodeGroup, filterRanges, model, isNodeIDFiltered, filterValues) {
  //  let visible = true;
  //
  //  if (!isNodeIDFiltered[nodeIndex]) {
  //
  //    let attributes = Object.keys(filterRanges);
  //    for (var i = 0; i < attributes.length; ++i) {
  //      let attribute = attributes[i];
  //      let filterRange = filterRanges[attribute][attributeNodeGroup];
  //      let nodeAttribute = model.getNodeAttr([nodeIndex], attribute);
  //      if (filterRange) {
  //        if (filterRange[0] > nodeAttribute || filterRange[1] < nodeAttribute) {
  //          visible = false;
  //        }
  //      }
  //    }
  //
  //    attributes = Object.keys(filterValues);
  //    for (i = 0; i < attributes.length; ++i) {
  //      let attribute = attributes[i];
  //      let filterValue = filterValues[attribute][attributeNodeGroup];
  //      let nodeAttribute = model.getNodeAttr([nodeIndex], attribute)[0];
  //      if (filterValue) {
  //        if (filterValue.indexOf(nodeAttribute) != -1) {
  //          visible = false;
  //        }
  //      }
  //    }
  //
  //
  //  } else {
  //    visible = false;
  //  }
  //
  //  return visible;
  //}
  //
  //reset() {
  //  this.hasFilters = false;
  //  this.isNodeIDFiltered = {};
  //  this.isNodeHidden = {};
  //  this.filterRanges = {};
  //}
  //
  setAttributeNodeGroup(nodeIndexes, attributeNodeGroup) {
    this.attributeNodeGroup[attributeNodeGroup] = nodeIndexes;
  }

  setModel(model) {
    this.model = model;
    this.setAttributeNodeGroup(Utils.getFlattenedLists(model.getRowNodeIndexes()), 0);
    this.setAttributeNodeGroup(Utils.getFlattenedLists(model.getColNodeIndexes()), 1);
    this.setAttributeNodeGroup(Utils.getFlattenedLists(model.getIntermediateNodeIndexes()), 2);

    this.numAttributeNodeGroups = 3;

    this.resetFilters();
  }

  setCategoricalFilter(attribute, attributeNodeGroup, filter) {
    this.categoricalFilters[attributeNodeGroup][attribute] = filter;
    this.$scope.$broadcast('filterChanged');
  }

  setQuantitativeFilter(attribute, attributeNodeGroup, filter) {
    this.quantitativeFilters[attributeNodeGroup][attribute] = filter;
    this.$scope.$broadcast('filterChanged');
  }

  /**
   * Populates this.categoricalFilters and this.quantitativeFilters
   * categoricalFilters is an object
   * keys are attributeNodeGroups
   * values are objects -
   *    keys are attribute names
   *    values are allowed attribute values
   */
  resetFilters() {
    let model = this.model;
    let attributes = model.getAvailableAttributes();

    this.categoricalFilters = {};
    this.quantitativeFilters = {};

    // Loop over all attribute node groups
    for (let i = 0; i < this.numAttributeNodeGroups; ++i) {
      let currentNodeIndexes = this.getAttributeNodeGroup(i);
      this.categoricalFilters[i] = {};
      this.quantitativeFilters[i] = {};

      // For each attribute, add it's values to the filters
      for (let j = 0; j < attributes.length; ++j) {
        let attribute = attributes[j];

        if (model.isCategoricalAttribute(attribute)) {
          let values = model.getNodeAttr(currentNodeIndexes, attribute);
          values = Utils.getUniqueValues(values);
          this.categoricalFilters[i][attribute] = {};
          for (let k = 0; k < values.length; ++k) {
            this.categoricalFilters[i][attribute][values[k]] = true;
          }
        } else {
          let values = model.getNodeAttr(currentNodeIndexes, attribute);
          this.quantitativeFilters[i][attribute] = [d3.min(values), d3.max(values)];
        }
      }

      // Add the 'id' field to the filters.
      this.categoricalFilters[i][model.getCmGraph().getNodeIdName()] = [];
    }
  }

  //setFilterRange(attribute, attributeNodeGroup, range) {
  //  this.hasFilters = true;
  //
  //  let nodeIndexes = this.getAttributeNodeGroup(attributeNodeGroup);
  //  let showNodes = [];
  //  let hideNodes = [];
  //
  //  let wasNodeVisible = [];
  //  for (var i = 0; i < nodeIndexes.length; ++i) {
  //    wasNodeVisible.push(this.isNodeVisibleInAllFilters(nodeIndexes[i], attributeNodeGroup, this.filterRanges, this.model, this.isNodeIDFiltered, this.filterValues));
  //  }
  //
  //  this.filterRanges[attribute][attributeNodeGroup] = range;
  //  let isNodeVisible = [];
  //  for (i = 0; i < nodeIndexes.length; ++i) {
  //    isNodeVisible.push(this.isNodeVisibleInAllFilters(nodeIndexes[i], attributeNodeGroup, this.filterRanges, this.model, this.isNodeIDFiltered, this.filterValues));
  //  }
  //
  //  for (i = 0; i < nodeIndexes.length; ++i) {
  //    if (!wasNodeVisible[i] && isNodeVisible[i]) {
  //      this.isNodeHidden[nodeIndexes[i]] = false;
  //      showNodes.push(nodeIndexes[i]);
  //    } else if (wasNodeVisible[i] && !isNodeVisible[i]) {
  //      this.isNodeHidden[nodeIndexes[i]] = true;
  //      hideNodes.push(nodeIndexes[i]);
  //    }
  //  }
  //
  //  this.$scope.$broadcast('showNodes', showNodes);
  //  this.$scope.$broadcast('hideNodes', hideNodes);
  //  this.$scope.$broadcast("updateQuantitativeAttributeFilter", attribute, attributeNodeGroup, range);
  //}
  //
  //setFilterValuesFromSelection(attribute, attributeNodeGroup, selection) {
  //  this.hasFilters = true;
  //
  //  let nodeIndexes = this.getAttributeNodeGroup(attributeNodeGroup);
  //  let wasNodeVisible = [];
  //  let showNodes = [];
  //  let hideNodes = [];
  //  for (var i = 0; i < nodeIndexes.length; ++i) {
  //    wasNodeVisible.push(this.isNodeVisibleInAllFilters(nodeIndexes[i], attributeNodeGroup, this.filterRanges, this.model, this.isNodeIDFiltered, this.filterValues));
  //  }
  //
  //
  //  this.filterValues[attribute][attributeNodeGroup] = [];
  //  for (var key in selection) {
  //    if (!selection[key]) {
  //      this.filterValues[attribute][attributeNodeGroup].push(key);
  //    }
  //  }
  //
  //  let isNodeVisible = [];
  //  for (i = 0; i < nodeIndexes.length; ++i) {
  //    isNodeVisible.push(this.isNodeVisibleInAllFilters(nodeIndexes[i], attributeNodeGroup, this.filterRanges, this.model, this.isNodeIDFiltered, this.filterValues));
  //  }
  //
  //  for (i = 0; i < nodeIndexes.length; ++i) {
  //    if (!wasNodeVisible[i] && isNodeVisible[i]) {
  //      this.isNodeHidden[nodeIndexes[i]] = false;
  //      showNodes.push(nodeIndexes[i]);
  //    } else if (wasNodeVisible[i] && !isNodeVisible[i]) {
  //      this.isNodeHidden[nodeIndexes[i]] = true;
  //      hideNodes.push(nodeIndexes[i]);
  //    }
  //  }
  //  //console.log("showNodes", hideNodes);
  //  this.$scope.$broadcast('showNodes', showNodes);
  //  this.$scope.$broadcast('hideNodes', hideNodes);
  //
  //  this.$log.debug(isNodeVisible, wasNodeVisible);
  //}
  //
  ///**
  // * Converts a nodeSelection to isNodeIDFiltered.
  // */
  //setHiddenNodesFromSelection(selection) {
  //  let hideNodes = [];
  //  let showNodes = [];
  //  for (var key in selection) {
  //    let nodeId = parseInt(key);
  //    if (selection[key]) {
  //      showNodes.push(nodeId);
  //    } else {
  //      hideNodes.push(nodeId);
  //    }
  //  }
  //  this.hideNodes(hideNodes);
  //  this.showNodes(showNodes);
  //}
  //
  setHoveredNodes(nodes) {
    this.$scope.$broadcast('hoverNodes', nodes);
  }

  clearSelection() {
    this.$scope.$broadcast("clearSelection");
  }

  //
  //showNodes(nodeIndexes) {
  //  if (nodeIndexes.length == 0) {
  //    return;
  //  }
  //
  //  for (var i = 0; i < nodeIndexes.length; ++i) {
  //    this.isNodeIDFiltered[nodeIndexes[i]] = false;
  //  }
  //
  //  this.$scope.$broadcast('showNodes', nodeIndexes, this.isNodeIDFiltered);
  //}
}
