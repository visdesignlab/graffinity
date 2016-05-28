/*global d3 */
export class ViewState {
  constructor($rootScope, $log) {
    "ngInject";
    this.isNodeHidden = {};
    this.filterRanges = {};
    this.$scope = $rootScope;
    this.$log = $log;
  }

  /**
   * Get the range for the current attribute, or create one if it doesn't exist.
   */
  getOrCreateFilterRange(attribute, nodeAttributeGroup, nodeAttributes) {
    let rangeList = this.filterRanges[attribute];
    if (rangeList == undefined) {
      this.filterRanges[attribute] = [];
      rangeList = this.filterRanges[attribute];
    }

    if (rangeList[nodeAttributeGroup] == undefined) {
      this.filterRanges[attribute][nodeAttributeGroup] = [d3.min(nodeAttributes), d3.max(nodeAttributes)];
    }

    return this.filterRanges[attribute][nodeAttributeGroup];
  }

  /**
   * Converts a list of nodeIndexes to an object used as a dictionary.
   * object[nodeIndex] = !isNodeHidden[nodeIndex]
   */
  getHiddenNodesAsSelection(nodeIndexes) {
    let selection = {};
    for (var i = 0; i < nodeIndexes.length; ++i) {
      selection[nodeIndexes[i]] = !this.isNodeHidden[nodeIndexes[i]];
    }
    return selection;
  }

  /**
   *
   */
  hideNodes(nodeIndexes) {
    for (var i = 0; i < nodeIndexes.length; ++i) {
      this.isNodeHidden[nodeIndexes[i]] = true;
    }

    this.$scope.$broadcast('hideNodes', nodeIndexes, this.isNodeHidden);
  }

  reset() {
    this.isNodeHidden = {};
    this.filterRanges = {};
  }

  setCurrentModel(model) {
    this.model = model;
  }

  setFilterRange(attribute, nodeAttributeGroup, range) {
    this.filterRanges[attribute][nodeAttributeGroup] = range;
  }

  /**
   * Converts a nodeSelection to isNodeHidden.
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

  setHoveredNode(node) {
    this.$scope.$broadcast('hoverNode', node);
  }

  showNodes(nodeIndexes) {
    if (nodeIndexes.length == 0) {
      return;
    }

    for (var i = 0; i < nodeIndexes.length; ++i) {
      this.isNodeHidden[nodeIndexes[i]] = false;
    }

    this.$scope.$broadcast('showNodes', nodeIndexes, this.isNodeHidden);
  }
}
