(function(){

angular.module('opsee.integrations.services', []);

var INTEGRATIONS_DETAILS = {
  slack:{
    endpoints:{
      auth:'https://slack.com/oauth/authorize',
      token:'https://slack.com/api/oauth.access'
    },
    creds:{
      client_id:'3378465181.4743809532',
      client_secret:'e2f8119000f1805c2770d8cda24eccdf'
    }
  }
}
angular.module('opsee.integrations.services').constant('INTEGRATIONS_DETAILS',INTEGRATIONS_DETAILS);

function SlackService(INTEGRATIONS_DETAILS, $http){
  return {
    token:function(data){
      if(data){
        data.client_id = INTEGRATIONS_DETAILS.slack.creds.client_id;
        data.client_secret = INTEGRATIONS_DETAILS.slack.creds.client_secret;
        return $http.get(INTEGRATIONS_DETAILS.slack.endpoints.token, {
          params:data
        });
      }
    }
  }
}

angular.module('opsee.integrations.services').service('SlackService', SlackService);

})();