(function(){

angular.module('opsee.user.services', []);

function User($resource, $rootScope, _, $localStorage, $state, $q, $analytics, USER_DEFAULTS, ENDPOINTS, SlackService, gravatarService){
  var User = $resource(ENDPOINTS.user,
    {
      id:'@_id'
    },
    {
      update:{
        method:'PATCH'
      }
    });
  User.prototype.setDefaults = function(){
    _.defaults(this, USER_DEFAULTS);
    this.populateSlack();
    return this;
  }
  User.prototype.populateSlack = function(){
    var self = this;
    var deferred = $q.defer();
    SlackService.getProfile().then(function(data){
      self.integrations.slack.user = data;
      self.setImage();
      deferred.resolve();
    }, function(){
      self.setImage();
      deferred.resolve();
    });
    return deferred.promise;
  }
  User.prototype.setImage = function(){
    var self = this;
    function slackSet(data){
      self.bio.img = data.user.profile.image_192;
      self.bio.imgService = 'Slack';
    }
    if(this.integrations.slack.user){
      slackSet(self.integrations.slack);
    }else{
      SlackService.getProfile().then(function(data){
        slackSet(data);
      }, function(){
        //no slack integration found, default to gravatar
        self.bio.img = gravatarService.url(self.account.email || self.email, {s:200});
        self.bio.imgService = 'Gravatar';
      });
    }
    return this;
  }
  // User.prototype.hasPermission = function(string){
  //   return this.permissions.indexOf(string) > -1;
  // }
  User.prototype.hasUser = function(){
    return !!this.id;
  }
  User.prototype.logout = function(){
    $analytics.eventTrack('logout', {category:'User'});
    delete $localStorage.user;
    delete $localStorage.authToken;
    $rootScope.user = new User().setDefaults();
    $state.go('login');
  }
  return User;
}
angular.module('opsee.user.services').factory('User', User);

var userDefaults = {
  account:{
    email:null,
    password:null
  },
  bio:{
    name:null
  },
  aws:{
    accessKey:null,
    secretKey:null
  },
  teams:[
  ],
  integrations:{
    slack:{
      access_token:null,
      user:null
    }
  }
}
angular.module('opsee.user.services').constant('USER_DEFAULTS', userDefaults);


function UserService($q, $resource, $rootScope, $analytics, User, ENDPOINTS){
  return{
    set:function(USER){
      $rootScope.user = new User(USER).setDefaults().setPrefs();
    },
    edit:function(user,options) {
      var deferred = $q.defer();
      //used for editing users and creating new ones
      saved = options && options.isEditing ? User.update(user) : User.save(user);
      saved.$promise.then(function(res){
        deferred.resolve(res);
      }, function(err){
        deferred.reject(err);
      })
      return deferred.promise;
    },
    create:function(user){
      var path = $resource(ENDPOINTS.api+'/signups');
      // saved = path.save(user);
      return path.save(user).$promise;
      return saved.$promise;
    },
    claim:function(user){
      if(user && user.password && user.activationId){
        var path = $resource(ENDPOINTS.api+'/activations/'+user.activationId+'/activate');
        return path.save(user).$promise;
      }else{
        return $q.reject({data:{error:'Bad credentials.'}});
      }
    },
    createOrg:function(user){
      if(user && user.name && user.subdomain){
        var path = $resource(ENDPOINTS.api+'/orgs');
        return path.save(user).$promise;
      }else{
        return $q.reject({data:{error:'Bad credentials.'}});
      }
    },
    login:function(user){
      $analytics.eventTrack('login', {category:'User'});
      if(user && user.account.email){
        var data = {
          password:user.account.password,
          email:user.account.email
        }
        var path = $resource(ENDPOINTS.api+'/authenticate/password');
        saved = path.save(data);
        return saved.$promise;
      }else{
        return $q.reject();
      }
    },
    passwordForgot:function(user){
      var path = $resource(ENDPOINTS.api+'/password-forgot');
      saved = path.save(user.account.email);
      return saved.$promise;
    }
  }
}
angular.module('opsee.user.services').service('UserService', UserService);

})();