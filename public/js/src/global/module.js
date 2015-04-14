angular.module('opsee.global', ['opsee.global.controllers', 'opsee.global.directives', 'opsee.global.services', 'opsee.global.filters']);


/**
 * $pageTitle
 * ==========
 *
 * Allows to control the page title from the AngularJS route system, controllers
 * or any other component through an injectable service.
 *
 * ### ngPageTitle - Page title service
 *
 * To get started add the module to your app and configure the page title
 * provider:
 *
 * ```js
 * angular.module('app', ['ngPageTitle'])
 * .config(function($pageTitleProvider) {
 *   // Use the current doc title
 *   $pageTitleProvider.setDefaultTitle();
 *   // Set a custom default title
 *   $pageTitleProvider.setDefaultTitle('My App');
 * });
 * ```
 *
 * Then setup the `$pageTitle` property along your routes:
 *
 * ```js
 * $routeProvider.when('path/to', {
 *   // ...
 *   pageTitle: 'Route title'
 * });
 * ```
 *
 * The document title will automatically update every time the route changes
 * with success.
 *
 * It's also possible to change the routes within any component that supports
 * injection through the `$pageTitle` service, with the `set` method:
 *
 * ```js
 * function MyAppCtrl($pageTitle) {
 *   $pageTitle.set('Controller title');
 * }
 * ```
 */
angular.module('ngPageTitle', ['ngRoute'])
.provider('$pageTitle', function() {
  var defaultTitle, base = '', suffix = '';

  this.setBase = function(value){
    base = value;
  }
  this.setSuffix = function(value){
    suffix = value;
  }
  this.setDefault = function(value) {
    defaultTitle = value;
  };

  /**
   * @name $pageTitle
   * @requires $rootScope
   * @requires $window
   *
   * @description
   * The `$pageTitle` service factory.
   *
   * ### Methods:
   *  - $pageTitle.get()
   *  - $pageTitle.set(value)
   */
  function PageTitleService($rootScope, $window, $routeParams) {
    var _currentTitle;

    /**
     * Returns the current document title.
     * @return {string}
     */
    function _get() {
      return $window.document.title;
    }

    /**
     * Sets the document title.
     * @param {String} title - The title.
     */
    function _set(value) {
      _currentTitle = value || defaultTitle;
      _currentTitle = base+_currentTitle;
      _currentTitle = _currentTitle.match(suffix) ? _currentTitle  : _currentTitle+suffix;
      $window.document.title = _currentTitle;
    }

    // Set up the default title to the document, if none provide use the current
    // document title as the default title.
    if (defaultTitle) {
      $window.document.title = defaultTitle;
    } else {
      defaultTitle = $window.document.title;
    }

    // Bind to angular route system.
    $rootScope.$on('$routeChangeSuccess', function(event, route) {
      var _pageTitle;
      if (route && angular.isDefined(route.$$route)) {
        if(typeof route.$$route.pageTitle == 'function'){
          _pageTitle = route.$$route.pageTitle($routeParams);
        }else{
          _pageTitle = route.$$route.pageTitle || null;
        }
      }
      _set(_pageTitle);
    });

    return {
      get: _get,
      set: _set
    }
  }

  this.$get = ['$rootScope', '$window', '$routeParams', PageTitleService];
});