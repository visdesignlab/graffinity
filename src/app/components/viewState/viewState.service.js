export class ViewState {
  constructor($rootScope, $log) {
    "ngInject";
    this.isNodeHidden = {};
    this.callbacks = {};
    this.$scope = $rootScope;
    this.$log = $log;
  }

  hideNodes(nodeIndexes) {
    // this.$log.debug("hiding nodes", nodeIndexes);

    for (var i = 0; i < nodeIndexes.length; ++i) {
      this.isNodeHidden[nodeIndexes[i]] = true;
    }

    this.$scope.$broadcast('hideNodes', nodeIndexes, this.isNodeHidden);
  }

  showNodes(nodeIndexes) {
    // this.$log.debug("showing nodes", nodeIndexes);

    for (var i = 0; i < nodeIndexes.length; ++i) {
      this.isNodeHidden[nodeIndexes[i]] = false;
    }

    this.$scope.$broadcast('showNodes', nodeIndexes, this.isNodeHidden);
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
}
