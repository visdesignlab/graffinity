/* global malarkey:false, moment:false*/
let production = false;

import {config} from './index.config';
import {routerConfig} from './index.route';
import {runBlock} from './index.run';
import {MainController} from './main/main.controller';
import {cmMatrixViewFactory} from '../app/components/connectivityMatrixView/cmMatrixViewFactory';
import {cmResource} from '../app/components/connectivityMatrix/cmResource.service';
import {cmGraphFactory} from '../app/components/connectivityMatrix/cmGraphFactory.service';
import {cmMatrixFactory} from '../app/components/connectivityMatrix/cmMatrixFactory.service';
import {cmModelFactory} from '../app/components/connectivityMatrix/cmModelFactory.service';
import {ModalListFilterController} from "../app/components/modals/modalListFilter.controller.js"
import {ModalHistogramFilterController} from "../app/components/modals/modalHistogramFilter.controller"
import {QueryDirective} from "../app/components/query/query.directive";
import {NumPathsDirective} from "../app/components/numPaths/numPaths.directive";
import {ModalService} from "../app/components/modals/modals.service.js";
import {ViewState} from "../app/components/viewState/viewState.service";
import {NodeLinkViewDirective} from "../app/components/nodeLinkView/nodeLinkView.directive"
import {PathListViewDirective} from "../app/components/pathListView/pathListView.directive"
import {AdjustableColorScaleDirective} from "../app/components/adjustableColorScale/adjustableColorScale.directive.js"
import {ColorScaleService} from "../app/components/adjustableColorScale/colorScale.service"
import {QueryBuilderDirective} from "../app/components/queryBuilder/queryBuilder.directive"
import {CypherGeneratorService} from "../app/components/queryBuilder/cypherGenerator.service"
import {DataSelectionService} from "../app/components/dataSelection/dataSelection.service"
import {DataSelectionController} from '../app/components/dataSelection/dataSelection.controller'

angular.module('connectivityMatrixJs', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngMessages', 'ngAria', 'ui.router', 'ui.bootstrap', 'toastr', 'ui.select', 'ngTagsInput'])
  .constant('malarkey', malarkey)
  .constant('moment', moment)
  .constant('resource', production ? "http://54.164.73.78:8000/" : "http://localhost:8000/")
  .config(config)
  .config(routerConfig)
  .run(runBlock)
  .service('cmResource', cmResource)
  .service('cmGraphFactory', cmGraphFactory)
  .service('cmMatrixFactory', cmMatrixFactory)
  .service('cmModelFactory', cmModelFactory)
  .service('cmMatrixViewFactory', cmMatrixViewFactory)
  .service('viewState', ViewState)
  .controller('MainController', MainController)
  .controller('ModalListFilterController', ModalListFilterController)
  .controller('ModalHistogramFilterController', ModalHistogramFilterController)
  .directive('queryDirective', QueryDirective)
  .directive('numPathsDirective', () => new NumPathsDirective())
  .service('modalService', ModalService)
  .directive("nodeLinkViewDirective", () => new NodeLinkViewDirective())
  .directive("pathListViewDirective", () => new PathListViewDirective())
  .directive("adjustableColorScaleDirective", () => new AdjustableColorScaleDirective())
  .service("colorScaleService", ColorScaleService)
  .service("cypherGeneratorService", CypherGeneratorService)
  .directive("queryBuilder", () => new QueryBuilderDirective())
  .service("dataSelectionService", DataSelectionService)
  .controller("DataSelectionController", DataSelectionController);
