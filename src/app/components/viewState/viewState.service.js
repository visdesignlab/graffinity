/*global d3 */

import {Utils} from "../utils/utils"

export class ViewState {
  constructor($rootScope, $log) {
    "ngInject";
    this.attributeNodeGroup = {};
    this.isNodeIDFiltered = {};
    this.isNodeHidden = {};
    this.filterRanges = {};
    this.$scope = $rootScope;
    this.$log = $log;
  }

  /**
   * Get the range for the current attribute, or create one if it doesn't exist.
   */
  getOrCreateFilterRange(attribute, attributeNodeGroup, nodeAttributes) {
    let rangeList = this.filterRanges[attribute];
    if (rangeList == undefined) {
      this.filterRanges[attribute] = [];
      rangeList = this.filterRanges[attribute];
    }

    if (rangeList[attributeNodeGroup] == undefined) {
      this.filterRanges[attribute][attributeNodeGroup] = [d3.min(nodeAttributes), d3.max(nodeAttributes)];
    }

    return this.filterRanges[attribute][attributeNodeGroup];
  }

  /**
   * Converts a list of nodeIndexes to an object used as a dictionary.
   * object[nodeIndex] = !isNodeHidden[nodeIndex]
   */
  getHiddenNodesAsSelection(nodeIndexes) {
    let selection = {};
    for (var i = 0; i < nodeIndexes.length; ++i) {
      selection[nodeIndexes[i]] = !this.isNodeIDFiltered[nodeIndexes[i]];
    }
    return selection;
  }

  getAttributeNodeGroup(attributeNodeGroup) {
    return this.attributeNodeGroup[attributeNodeGroup];
  }

  /**
   *
   */
  hideNodes(nodeIndexes) {
    for (var i = 0; i < nodeIndexes.length; ++i) {
      this.isNodeIDFiltered[nodeIndexes[i]] = true;
    }

    this.$scope.$broadcast('hideNodes', nodeIndexes, this.isNodeIDFiltered);
  }

  isNodeVisibleInAllFilters(nodeIndex, attributeNodeGroup, filterRanges, model, isNodeIDFiltered) {
    let visible = true;
    if (!isNodeIDFiltered[nodeIndex]) {
      let attributes = Object.keys(filterRanges);
      for (var i = 0; i < attributes.length; ++i) {
        let attribute = attributes[i];
        let filterRange = filterRanges[attribute][attributeNodeGroup];
        let nodeAttribute = model.getNodeAttr([nodeIndex], attribute);
        if (filterRange) {
          if (filterRange[0] > nodeAttribute || filterRange[1] < nodeAttribute) {
            visible = false;
          }
        }
      }
    } else {
      visible = false;
    }
    return visible;
  }

  reset() {
    this.isNodeIDFiltered = {};
    this.isNodeHidden = {};
    this.filterRanges = {};
  }

  setAttributeNodeGroup(nodeIndexes, attributeNodeGroup) {
    this.attributeNodeGroup[attributeNodeGroup] = nodeIndexes;
  }

  setCurrentModel(model) {
    this.model = model;
    this.setAttributeNodeGroup(Utils.getFlattenedLists(model.getRowNodeIndexes()), 0);
    this.setAttributeNodeGroup(Utils.getFlattenedLists(model.getColNodeIndexes()), 1);
    this.setAttributeNodeGroup(Utils.getFlattenedLists(model.getIntermediateNodeIndexes()), 2);
  }

  setFilterRange(attribute, attributeNodeGroup, range) {
    let nodeIndexes = this.getAttributeNodeGroup(attributeNodeGroup);
    let showNodes = [];
    let hideNodes = [];

    let wasNodeVisible = [];
    for (var i = 0; i < nodeIndexes.length; ++i) {
      wasNodeVisible.push(this.isNodeVisibleInAllFilters(nodeIndexes[i], attributeNodeGroup, this.filterRanges, this.model, this.isNodeIDFiltered));
    }

    this.filterRanges[attribute][attributeNodeGroup] = range;
    let isNodeVisible = [];
    for (i = 0; i < nodeIndexes.length; ++i) {
      isNodeVisible.push(this.isNodeVisibleInAllFilters(nodeIndexes[i], attributeNodeGroup, this.filterRanges, this.model, this.isNodeIDFiltered));
    }

    for (i = 0; i < nodeIndexes.length; ++i) {
      if (!wasNodeVisible[i] && isNodeVisible[i]) {
        this.isNodeHidden[nodeIndexes[i]] = false;
        showNodes.push(nodeIndexes[i]);
      } else if (wasNodeVisible[i] && !isNodeVisible[i]) {
        this.isNodeHidden[nodeIndexes[i]] = true;
        hideNodes.push(nodeIndexes[i]);
      }
    }
    //console.log("showNodes", hideNodes);
    this.$scope.$broadcast('showNodes', showNodes);
    this.$scope.$broadcast('hideNodes', hideNodes);
    this.$scope.$broadcast("updateQuantitativeAttributeFilter", attribute, attributeNodeGroup, range);
  }

  /**
   * Converts a nodeSelection to isNodeIDFiltered.
   */
  setHiddenNodesFromSelection(selection) {
    let hideNodes = [];
    let showNodes = [];
    for (var key in selection) {
      let nodeId = parseInt(key);
      if (selection[key]) {
        showNodes.push(nodeId);
      } else {
        hideNodes.push(nodeId);
      }
    }
    this.hideNodes(hideNodes);
    this.showNodes(showNodes);
  }

  setHoveredNodes(nodes) {
    this.$scope.$broadcast('hoverNodes', nodes);
  }

  clearSelection() {
    this.$scope.$broadcast("clearSelection");
  }

  showNodes(nodeIndexes) {
    if (nodeIndexes.length == 0) {
      return;
    }

    for (var i = 0; i < nodeIndexes.length; ++i) {
      this.isNodeIDFiltered[nodeIndexes[i]] = false;
    }

    this.$scope.$broadcast('showNodes', nodeIndexes, this.isNodeIDFiltered);
  }
}
