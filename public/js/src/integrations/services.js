(function(){

angular.module('opsee.integrations.services', []);

var INTEGRATIONS_DETAILS = {
  slack:{
    endpoints:{
      auth:'https://slack.com/oauth/authorize',
      token:'https://slack.com/api/oauth.access',
      test:'https://slack.com/api/auth.test',
      postMessage:'https://slack.com/api/chat.postMessage',
      userInfo:'https://slack.com/api/users.info'
    },
    creds:{
      client_id:'3378465181.4743809532',
      client_secret:'e2f8119000f1805c2770d8cda24eccdf'
    }
  }
}
angular.module('opsee.integrations.services').constant('INTEGRATIONS_DETAILS',INTEGRATIONS_DETAILS);

function SlackService($http, $q, $localStorage, INTEGRATIONS_DETAILS){
  var obj = {
    token:function(data){
      if(data){
        data.client_id = INTEGRATIONS_DETAILS.slack.creds.client_id;
        data.client_secret = INTEGRATIONS_DETAILS.slack.creds.client_secret;
        data.scope = 'identify,read,post,client,admin';
        return $http.get(INTEGRATIONS_DETAILS.slack.endpoints.token, {
          params:data
        });
      }
    },
    getProfile:function(){
      if($localStorage.slackAccessToken){
        return $http.get(INTEGRATIONS_DETAILS.slack.endpoints.test, {
          params:{
            token:$localStorage.slackAccessToken
          }
        }).then(function(res){
          return $http.get(INTEGRATIONS_DETAILS.slack.endpoints.userInfo, {
            params:{
              token:$localStorage.slackAccessToken,
              user:res.data.user_id
            }
          });
        });
      }else{
        var d = $q.defer();
        d.reject();
        return d.promise;
      }
    },
    sendTest:function(){
      //send test directly to current user
      obj.getProfile().then(function(res){
        return $http.get(INTEGRATIONS_DETAILS.slack.endpoints.postMessage, {
          params:{
            token:$localStorage.slackAccessToken,
            channel:res.data.user.id,
            text:'Thanks for signing up, '+res.data.user.profile.first_name+'! - The Opsee Team',
          }
        });
      });
    }
  }
  return obj;
}

angular.module('opsee.integrations.services').service('SlackService', SlackService);

})();