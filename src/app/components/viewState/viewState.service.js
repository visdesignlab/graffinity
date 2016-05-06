export class ViewState {
  constructor($rootScope) {
    "ngInject";
    this.isNodeHidden = {};
    this.callbacks = {};
    this.$scope = $rootScope;
  }

  hideNodes(nodeIndexes) {
    for (var i = 0; i < nodeIndexes.length; ++i) {
      this.isNodeHidden[nodeIndexes[i]] = true;
    }

    this.$scope.$broadcast('hideNodes', nodeIndexes, this.isNodeHidden);
  }

  showNodes(nodeIndexes) {
    for (var i = 0; i < nodeIndexes.length; ++i) {
      this.isNodeHidden[nodeIndexes[i]] = false;
    }

    this.$scope.$broadcast('showNodes', nodeIndexes, this.isNodeHidden);
  }
}
