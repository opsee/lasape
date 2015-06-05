(function(){

angular.module('opsee.global.directives', []);

function statefulBtn(){
  return {
    restrict:'EA',
    scope:{
      value:'=',
      send:'='
    },
    controller:function($scope){
      $scope.options = {
        original:{
          text:'Test'
        },
        inProgress:{
          text:'Testing...'
        },
        success:{
          text:'Success!'
        },
        error:{
          text:'Error.'
        }
      }
      $scope.state = $scope.state || $scope.options.original;
      $scope.click = function(){
        $scope.state = $scope.options.inProgress;
        $scope.send().then(function(res){
          $scope.state = $scope.options.success;
        }, function(err){
          $scope.state = $scope.options.error;
        })
      }
    }
  }
}
angular.module('opsee.global.directives').directive('statefulBtn', statefulBtn);

function preventDefaultA(){
  return {
    restrict: 'E',
    link: function(scope, elem, attrs) {
      if(attrs.ngClick || attrs.href === '' || attrs.href === '#'){
        elem.on('click', function(e){
            e.preventDefault();
        });
      }
    }
 };
}
angular.module('opsee.global.directives').directive('preventDefaultA', preventDefaultA);

function opseeLoader(){
  return {
    restrict: 'AE',
    template:new Array(6).join('<i></i>')
 };
}
angular.module('opsee.global.directives').directive('opseeLoader', opseeLoader);

function contextMenu(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/global/partials/context-menu.html',
    controller:function($scope){
      console.log($scope);
    }
  }
}
angular.module('opsee.global.directives').directive('contextMenu', contextMenu);

function opseeHeader(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/global/partials/header.html',
    controller:function($scope, $location, $state, $rootScope, Global) {
      $scope.navbarEntries = [
        {
          title:'Checks',
          sref:'checks',
          children:[]
        },
        {
          title:'More',
          sref:'more',
          children:[]
        }
      ];
      $scope.isActive = function (string) {
        if($state.current.name == string){
          return true;
        }
        return false;
      };
      $scope.navCollapsed = true
      $scope.$on('$stateChangeSuccess', function(event, toState, toParams) {
        $scope.navCollapsed = true;
      });
    }
  }
}
angular.module('opsee.global.directives').directive('opseeHeader', opseeHeader);

function opseeFooter(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/global/partials/footer.html',
    controller:function($scope, $location, $state, $rootScope, Global) {
      // $scope.user = $rootScope.user;
      $scope.entries = [
        {
          title:'Checks',
          link:'checks',
          children:[]
        },
        {
          title:'More',
          link:'more',
          children:[]
        }
      ];
      $scope.isActive = function (string) {
        if($state.current.name == string){
          return true;
        }
        return false;
      };
      $scope.navCollapsed = true
      $scope.$on('$stateChangeSuccess', function(event, toState, toParams) {
        $scope.navCollapsed = true;
      });
    }
  }
}
angular.module('opsee.global.directives').directive('opseeFooter', opseeFooter);

function mdToolbar(){
  return {
    restrict:'EA',
    replace:true,
    transclude:'element',
    scope:{
      title:'@?',
      btnPosition:'@?'
    },
    templateUrl:'/public/js/src/global/partials/md-toolbar.html',
    controller:function($scope, $state){
      $scope.title = $scope.title || $state.current.title;
    }
  }
}
angular.module('opsee.global.directives').directive('mdToolbar', mdToolbar);

function toggleSwitch(){
  return {
    restrict:'AE',
    replace:true,
    template:'<div class="toggle-switch" ng-class="{active:ngModel == true}" ng-click="ngModel = !ngModel" ng-swipe-left="ngModel = false" ng-swipe-right="ngModel = true"><div class="knob"></div></div>',
    scope:{
      ngModel:'='
    }
  }
}
angular.module('opsee.global.directives').directive('toggleSwitch', toggleSwitch);

function srOnly(){
  return {
    restrict:'C',
    link:function($scope,$element,$attrs){
      $element.attr('tabindex','-1');
    }
  }
}
angular.module('opsee.global.directives').directive('srOnly', srOnly);

function defaultMessages(){
  return {
    restrict:'EA',
    scope:{
      ngModel:'='
    },
    templateUrl:'/public/js/src/global/partials/default-messages.html'
  }
}
angular.module('opsee.global.directives').directive('defaultMessages', defaultMessages);

//we are shimming bootstrap dropdowns to support multiple [dropdown-toggle]
// see https://github.com/angular-ui/bootstrap/issues/796
// and https://github.com/plarsson/bootstrap/commit/644dc5222634477b1251a86b709106f888535cb5

angular.module('ui.bootstrap.dropdown', ['ui.bootstrap.position']);
angular.module('ui.bootstrap.dropdown').constant('dropdownConfig', {
  openClass: 'open'
});
angular.module('ui.bootstrap.dropdown').service('dropdownService', ['$document', '$rootScope', function($document, $rootScope) {
  var openScope = null;

  this.open = function( dropdownScope ) {
    if ( !openScope ) {
      $document.bind('click', closeDropdown);
      $document.bind('keydown', escapeKeyBind);
    }

    if ( openScope && openScope !== dropdownScope ) {
        openScope.isOpen = false;
    }

    openScope = dropdownScope;
  };

  this.close = function( dropdownScope ) {
    if ( openScope === dropdownScope ) {
      openScope = null;
      $document.unbind('click', closeDropdown);
      $document.unbind('keydown', escapeKeyBind);
    }
  };

  var closeDropdown = function( evt ) {
    // This method may still be called during the same mouse event that
    // unbound this event handler. So check openScope before proceeding.
    if (!openScope) { return; }

    if( evt && openScope.getAutoClose() === 'disabled' )  { return ; }

    var toggleElements = openScope.getToggleElements();
    var skip = false;
    if(evt && toggleElements) {
      angular.forEach(toggleElements, function(toggleElement) {
        if (toggleElement[0].contains(evt.target) ) {
            skip = true;
        }
      });
    }

    if(skip) {
      return;
     }

    var $element = openScope.getElement();
    if( evt && openScope.getAutoClose() === 'outsideClick' && $element && $element[0].contains(evt.target) ) {
      return;
    }

    openScope.isOpen = false;

    if (!$rootScope.$$phase) {
      openScope.$apply();
    }
  };

  var escapeKeyBind = function( evt ) {
    if ( evt.which === 27 ) {
      openScope.focusToggleElement();
      closeDropdown();
    }
  };
}]);

angular.module('ui.bootstrap.dropdown').controller('DropdownController', function($scope, $attrs, $parse, dropdownConfig, dropdownService, $animate, $position, $document) {
  var self = this,
      scope = $scope.$new(), // create a child scope so we are not polluting original one
      openClass = dropdownConfig.openClass,
      getIsOpen,
      setIsOpen = angular.noop,
      toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop,
      toggleElements = [],
      appendToBody = false;

  this.init = function( element ) {
    self.$element = element;

    if ( $attrs.isOpen ) {
      getIsOpen = $parse($attrs.isOpen);
      setIsOpen = getIsOpen.assign;

      $scope.$watch(getIsOpen, function(value) {
        scope.isOpen = !!value;
      });
    }

    appendToBody = angular.isDefined($attrs.dropdownAppendToBody);

    if ( appendToBody && self.dropdownMenu ) {
      $document.find('body').append( self.dropdownMenu );
      element.on('$destroy', function handleDestroyEvent() {
        self.dropdownMenu.remove();
      });
    }
  };

  this.toggle = function( open ) {
    return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
  };

  // Allow other directives to watch status
  this.isOpen = function() {
    return scope.isOpen;
  };

 this.addToggleElement = function(element) {
   toggleElements.push(element);
 };

 scope.getToggleElements = function() {
   return toggleElements;
  }

  scope.getAutoClose = function() {
    return $attrs.autoClose || 'always'; //or 'outsideClick' or 'disabled'
  };

  scope.getElement = function() {
    return self.$element;
  };

  scope.focusToggleElement = function() {
    if (toggleElements && toggleElements.length > 0) {
      toggleElements[0][0].focus();
    }
  };

  scope.$watch('isOpen', function( isOpen, wasOpen ) {
    if ( appendToBody && self.dropdownMenu ) {
      var pos = $position.positionElements(self.$element, self.dropdownMenu, 'bottom-left', true);
      self.dropdownMenu.css({
        top: pos.top + 'px',
        left: pos.left + 'px',
        display: isOpen ? 'block' : 'none'
      });
    }

    $animate[isOpen ? 'addClass' : 'removeClass'](self.$element, openClass);

    if ( isOpen ) {
      scope.focusToggleElement();
      dropdownService.open( scope );
    } else {
      dropdownService.close( scope );
    }

    setIsOpen($scope, isOpen);
    if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
      toggleInvoker($scope, { open: !!isOpen });
    }
  });

  $scope.$on('$locationChangeSuccess', function() {
    scope.isOpen = false;
  });

  $scope.$on('$destroy', function() {
    scope.$destroy();
  });
})

angular.module('ui.bootstrap.dropdown').directive('dropdown', function() {
  return {
    controller: 'DropdownController',
    link: function(scope, element, attrs, dropdownCtrl) {
      dropdownCtrl.init( element );
    }
  };
})

angular.module('ui.bootstrap.dropdown').directive('dropdownMenu', function() {
  return {
    restrict: 'AC',
    require: '?^dropdown',
    link: function(scope, element, attrs, dropdownCtrl) {
      if ( !dropdownCtrl ) {
        return;
      }
      dropdownCtrl.dropdownMenu = element;
    }
  };
})

angular.module('ui.bootstrap.dropdown').directive('dropdownToggle', function() {
  return {
    require: '?^dropdown',
    priority:1000,
    link: function(scope, element, attrs, dropdownCtrl) {
      if ( !dropdownCtrl ) {
        return;
      }

      dropdownCtrl.addToggleElement(element);

      var toggleDropdown = function(event) {
        event.preventDefault();

        if ( !element.hasClass('disabled') && !attrs.disabled ) {
          scope.$apply(function() {
            dropdownCtrl.toggle();
          });
        }
      };

      element.bind('click', toggleDropdown);

      // WAI-ARIA
      element.attr({ 'aria-haspopup': true, 'aria-expanded': false });
      scope.$watch(dropdownCtrl.isOpen, function( isOpen ) {
        element.attr('aria-expanded', !!isOpen);
      });

      scope.$on('$destroy', function() {
        element.unbind('click', toggleDropdown);
      });
    }
  };
});


})();//IIFE