/* global malarkey:false, moment:false */

import { config } from './index.config';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { GithubContributorService } from '../app/components/githubContributor/githubContributor.service';
import { WebDevTecService } from '../app/components/webDevTec/webDevTec.service';
import { NavbarDirective } from '../app/components/navbar/navbar.directive';
import { MalarkeyDirective } from '../app/components/malarkey/malarkey.directive';
import { cmMatrixViewFactory } from '../app/components/connectivityMatrixView/cmMatrixViewFactory';
import { cmResource } from '../app/components/connectivityMatrix/cmResource.service';
import { cmGraphFactory } from '../app/components/connectivityMatrix/cmGraphFactory.service';
import { cmMatrixFactory } from '../app/components/connectivityMatrix/cmMatrixFactory.service';
import { cmModelFactory } from '../app/components/connectivityMatrix/cmModelFactory.service';
import { cmNodeFilterModalController } from "../app/components/connectivityMatrixView/modals/cmNodeFilterModal.controller"
import { cmAttributeModalController } from "../app/components/connectivityMatrixView/modals/cmAttributeModal.controller"
import { QueryDirective } from "../app/components/query/query.directive";

angular.module('connectivityMatrixJs', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngMessages', 'ngAria', 'ui.router', 'ui.bootstrap', 'toastr', 'ui.select'])
  .constant('malarkey', malarkey)
  .constant('moment', moment)
  .config(config)
  .config(routerConfig)
  .run(runBlock)
  .service('githubContributor', GithubContributorService)
  .service('webDevTec', WebDevTecService)
  .service('cmResource', cmResource)
  .service('cmGraphFactory', cmGraphFactory)
  .service('cmMatrixFactory', cmMatrixFactory)
  .service('cmModelFactory', cmModelFactory)
  .service('cmMatrixViewFactory', cmMatrixViewFactory)
  .controller('MainController', MainController)
  .controller('cmAttributeModalController', cmAttributeModalController)
  .controller('cmNodeFilterModalController', cmNodeFilterModalController)
  .directive('acmeNavbar', NavbarDirective)
  .directive('acmeMalarkey', MalarkeyDirective)
  .directive('queryDirective', QueryDirective);
