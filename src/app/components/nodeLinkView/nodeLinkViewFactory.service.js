import {NodeLinkView} from "./nodeLinkView"

export class NodeLinkViewFactory {
  constructor($log) {
    'ngInject';
    this.$log = $log;
  }

  createNodeLinkView(svg, model, scope, viewState, mainController) {
    return new NodeLinkView(svg, model, this.$log, scope, viewState, mainController);
  }
}
