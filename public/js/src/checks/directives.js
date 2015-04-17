(function(){

angular.module('opsee.checks.directives', []);

function checkInputs(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/inputs.html',
    scope:{
      check:'=',
      checkStep:'=?'
    },
    controller:function($scope, $http, $filter, _, NotificationSettings, Intervals, Verbs, Protocols, StatusCodes, Relationships, AssertionTypes, AssertionTest){
      $scope.groups = [
        {
          name:'US Group 1'
        },
        {
          name:'Europe Group 2'
        },
        {
          name:'US Group 2'
        }
      ],
      $scope.protocols = Protocols;
      $scope.notificationSettings = NotificationSettings;
      $scope.intervals = Intervals;
      $scope.verbs = Verbs;
      $scope.relationships = Relationships;
      $scope.assertionTypes = AssertionTypes;

      //kick these off, 1 is required
      $scope.check.addItem('assertions');
      $scope.check.addItem('notifications');
      StatusCodes().then(function(res){
        $scope.codes = res;
      });

      function genCheckResponse(res){
        $scope.checkResponse = res;
        $scope.checkResponse.responseHeaders = _.pairs(res.headers());
        $scope.checkResponse.dataString = typeof $scope.checkResponse.data == 'object' ? $filter('json')($scope.checkResponse.data) : $scope.checkResponse.data;
        $scope.checkResponse.language = null;
        var type = res.headers()['content-type'];
        if(type.match('css')){
          $scope.checkResponse.language = 'css';
        }else if(type.match('html')){
          $scope.checkResponse.language = 'html';
        }

        console.log(type);
        console.log($scope.checkResponse);
      }
      $http.get('/public/lib/know-your-http-well/json/status-codes.json').then(function(res){
      // $http.get('/public/js/src/user/partials/inputs.html').then(function(res){
      // $http.get('/public/css/src/style.css').then(function(res){
        genCheckResponse(res);
      }, function(res){
        genCheckResponse(res);
      })

      $scope.changeAssertionType = function(type,$index){
        $scope.check.assertions[$index].type = type;
        $scope.check.assertions[$index].value = null;
      }
      $scope.changeAssertionRelationship = function(relationship,assertion){
        assertion.relationship = relationship;
        if(relationship.name.match('Is Empty|Is Not Empty') && assertion.type && assertion.type.name != 'Response Header'){
         assertion.value = '';
        }
      }
      $scope.assertionPassing = function($index){
        return AssertionTest($scope.check.assertions[$index],$scope.checkResponse);
      }
      $scope.sendTestNotification = function(){
        console.log($scope.check);
      }
      $scope.finishCreate = function(){
        console.log($scope.check);
      }
    }//end controller
  }
}
angular.module('opsee.checks.directives').directive('checkInputs', checkInputs);


// var PieAvatar = React.createClass({
//   getInitialState: function() {
//     return {
//       instance_state: 'running',
//       health: 100
//     }
//   },
//   componentDidMount: function() {
//     var percentage;
//     if (this.state.health >= 100) {
//       percentage = 99.9;
//     } else if (this.state.health < 0) {
//       percentage = 0;
//     } else {
//       percentage = Math.round(this.state.health);
//     }
//     var loader = document.getElementById('loader');
//     var w = 40;
//     var α = (percentage/100)*360;
//     var π = Math.PI;
//     // α %= 360;
//     var r = ( α * π / 180 );
//     var x = Math.sin( r ) * (w/2);
//     var y = Math.cos( r ) * - (w/2);
//     var mid = ( α > 180 ) ? 1 : 0;
//     var path = 'M 0 0 v -' + (w/2) + ' A ' + (w/2) + ' ' + (w/2) + ' 1 ' + mid + ' 1 ' +  x  + ' ' +  y  + ' z';
//     loader.setAttribute( 'd', path );
//   },
//   render: function() {
//     var txt;
//     if (this.state.instance_state == 'running') {
//       txt = Math.round(this.state.health) + '%';
//     } else {
//       txt = '';
//     }
//     return (
//       <div>
//         <div className={'avatar' + ' ' + this.state.instance_state}>
//           <svg>
//             <path id="loader" transform="translate(20, 20)"/>
//           </svg>
//           <div className='avatar_inner'>{txt}</div>
//         </div>
//         <div className='pie_slice'></div>
//       </div>
//     );
//   }
// });

// React.render(<PieAvatar/>, document.getElementById('pie_avatar'));

})();//IIFE