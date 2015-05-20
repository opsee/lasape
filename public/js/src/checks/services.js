(function(){

angular.module('opsee.checks.services', []);

function Check($resource, $rootScope, $q, _, Global, CHECK_DEFAULTS, ENDPOINTS, CHECK_SCHEMAS, moment, NotificationSettings){
  var check = $resource(ENDPOINTS.api+'/check',
    {
      checkId:'@_id'
    },
    {
      update:{method:'PUT'}
    });
    check.prototype.actions = [
      {
        id:'silence',
        title:'Silence for...',
        childrenActive:true,
        run:function(){
          this.childrenActive = true;
        },
        actions:[
          {
            title:'1 minute',
            run:function(){
              return this.setSilence(1,'m');
            }
          },
          {
            title:'10 minutes',
            run:function(){
              return this.setSilence(10,'m');
            }
          },
          {
            title:'1 hour',
            run:function(){
              return this.setSilence(1,'h');
            }
          }
        ]
      },
      {
        id:'delete',
        title:'Edit',
        actions:[
          {
            title:'Delete Check',
            run:function(){
              return console.log('delete');
            }
          }
        ],
        run:function(){
          // var deferred = $q.defer();
          // Global.confirm('Delete this check?').then(function(){
          //   $rootScope.$emit('notify','Deleted check.');
          // });
          // deferred.resolve();
          // return deferred.promise;
        }
      }
    ]
    check.prototype.setSilence = function(length,unit){
      var deferred = $q.defer();
      var c = this;
      c.status.silence.startDate = new Date();
      c.status.silence.duration = moment.duration(length,unit).asMilliseconds();
      if($rootScope.user.hasUser()){
        c.status.silence.user = $rootScope.user.name || $rootScope.user.email;
        c.status.silence.user = 'you';
      }
      deferred.resolve();
      return deferred.promise;
    }
    check.prototype.setDefaults = function(){
      _.defaults(this, CHECK_DEFAULTS);
      return this;
    }
  check.prototype.getInfo = function(){
    var self = this;
    switch(self.status.state){
      case 'running':
      if(self.status.silence.remaining > 0){
        self.status.silence.diff = moment(self.status.silence.startDate).fromNow();
        self.status.silence.humanDuration = moment.duration(self.status.silence.duration).humanize();
        self.status.silence.user = self.status.silence.user || '[username]';
        return 'Silenced for '+ self.status.silence.humanDuration + ' by '+self.status.silence.user+'.';
      }else{
        return 'Running for X minutes';
      }
      break;
      case 'unmonitored':
      return 'This check is currently unmonitored.';
      break;
      case 'stopped':
      return 'This check is stopped in AWS.';
      break;
     }
    return self.info;
  }
  check.prototype.menu = function(section){
    this.actions.forEach(function(a){
      a.childrenActive = false;
      if(section && a.id != section){
        a.hidden = true;
      }
    });
    Global.contextMenu(this,'/public/js/src/checks/partials/single-context-menu.html');
  }
  check.prototype.addItem = function(selection){
    if(!selection){return false;}
    var target;
    try{
      //eval here allows us to write simple strings in html
      eval('var target=this.'+selection);
    }catch(err){
      console.log(err);
    }
    if(!target){return false;}
    var length = target.length;
    var schema;
    try{
      //eval here allows us to write simple strings in html
      eval('schema=CHECK_SCHEMAS.'+selection);
    }catch(err){
      console.log(err);
    }
    var cond1 = length && !angular.equals(target[length-1],schema);
    var cond2 = !length;
    target.push(angular.copy(schema));
  }
  check.prototype.removeItem = function(selection, $index, msg){
    if(!selection || $index == undefined){return false;}
    var target;
    try{
      //eval here allows us to write simple strings in html
      eval('var target=this.'+selection);
    }catch(err){
      console.log(err);
    }
    if(!target){return false;}
    var msg = msg || 'Remove this item?';
    $rootScope.global.confirm(msg, true).then(function(){
      target.splice($index,1);
    });
  }
  return check;
}
angular.module('opsee.checks.services').factory('Check', Check);


function CheckService($q, $resource, $rootScope, Check, ENDPOINTS){
  return{
    edit:function(check,options) {
      var deferred = $q.defer();
      //used for editing checks and creating new ones
      saved = options && options.isEditing ? Check.update(check) : Check.save(check);
      saved.$promise.then(function(res){
        deferred.resolve(res);
      }, function(err){
        deferred.reject(err);
      })
      return deferred.promise;
    },
    create:function(check){
      if(check && check.account.email){
        var _check = {
          name:check.bio.name,
          email:check.account.email
        }
        var path = $resource(ENDPOINTS.api+'/signups');
        saved = path.save(_check);
        return saved.$promise;
      }else{
        return $q.reject();
      }
    }
  }
}
angular.module('opsee.checks.services').service('CheckService', CheckService);


var checkDefaults = {
  name:null,
  message:null,
  type:null,
  interval:null,
  http:{
    protocol:null,
    authentications:[],
    headers:[]
  },
  notifications:[],
  assertions:[]
}
angular.module('opsee.checks.services').constant('CHECK_DEFAULTS', checkDefaults);

var checkSchemas = {
  http:{
    authentications:{
      username:null,
      password:null
    },
    headers:{
      key:null,
      value:null
    }
  },
  notifications:{
    type:null,
    options:{},
    value:null
  },
  assertions:{
    code:null,
    relationship:null,
    value:null
  }
}
angular.module('opsee.checks.services').constant('CHECK_SCHEMAS', checkSchemas);

function AssertionTest(){
  var internals = {
    'Equal To':function(response,test){
      return angular.equals(response,test);
    },
    'Not Equal To':function(response,test){
      return !angular.equals(response,test);
    },
    'Is Empty':function(response){
      return _.isEmpty(response);
    },
    'Is Not Empty':function(response){
      return !_.isEmpty(response);
    },
    'Contains':function(response,test){
      if(typeof response === 'string' && typeof test === 'string'){
        response = response.toLowerCase();
        test = test.toLowerCase();
        return !!response.match(test);
      }
      return false;
    },
    'RegExp':function(response,test){
      if(typeof response === 'string' && typeof test === 'string'){
        return !!response.match(test);
      }
      return false;
    }
  }
  return function(assertion,res){
    if(!assertion || !res || assertion.value===null || !assertion.relationship.name){return false;}
    var name = assertion.type.name;
    var relationship = assertion.relationship.name;
    switch(name){
      case 'Status Code':
        try{
          var code = assertion.value;
          var status = res.status.toString();
          return internals[relationship].call(this,status,code);
        }catch(err){
          return false;
        }
      break;
      case 'Header':
        try{
          var name = typeof assertion.value.name == 'object' ? assertion.value.name[0] : assertion.value.name;
          var value = typeof assertion.value.value == 'object' ? assertion.value.value[1] : assertion.value.value;
          var header = _.chain(res.responseHeaders).filter(function(h){
            return h[0] == name;
          }).first().value();
          if(relationship == 'Is Empty'){
            if(!header){
              return true;
            }
            return !header[1];
          }else if(relationship == 'Is Not Empty'){
            return !!header[1];
          }
          if(!header){
            return false;
          }
          return internals[relationship].call(this,header[1],value);
        }catch(err){
          return false;
        }
      break;
      case 'Response Body':
      try{
        var text = assertion.value;
        var body = JSON.stringify(res.data);
        if(relationship == 'Is Empty'){
          return !body;
        }else if(relationship == 'Is Not Empty'){
          return !!body;
        }
        return internals[relationship].call(this,body,text);
      }catch(err){
        return false;
      }
      break;
    }
  }
}
angular.module('opsee.checks.services').service('AssertionTest',AssertionTest);


function Verbs(){
  return[
    {
      name:'GET'
    },
    {
      name:'POST'
    },
    {
      name:'PUT'
    },
    {
      name:'DELETE'
    },
    {
      name:'PATCH'
    }
  ]
}
angular.module('opsee.global.services').service('Verbs', Verbs);


function Protocols(){
  return[
    {
      name:'HTTP'
    },
    {
      name:'MySQL'
    },
    {
      name:'Other'
    }
  ]
}
angular.module('opsee.global.services').service('Protocols', Protocols);

function StatusCodes($q, $http, _){
  return function(){
    var deferred = $q.defer();
    $http.get('/public/lib/know-your-http-well/json/status-codes.json').then(function(res){
      var array = _.chain(res.data).reject(function(n){
        return n.phrase.match(/\*\*/);
      }).sortBy(function(n){
        return n.code;
      }).value();
      deferred.resolve(array);
    }, function(res){
      deferred.reject(res);
    });
    return deferred.promise;
  }
}
angular.module('opsee.global.services').service('StatusCodes', StatusCodes);

function Relationships(){
  return[
    {
      name:'Equal To',
      title:'Exactly equal to.'
    },
    {
      name:'Not Equal To',
      title:'Not equal to.'
    },
    {
      name:'Is Empty',
      title:'Is empty.'
    },
    {
      name:'Is Not Empty',
      title:'Is not empty.'
    },
    // {
    //   name:'Greater Than'
    // },
    // {
    //   name:'Less Than'
    // },
    {
      name:'Contains',
      title:'Contains all text.'
    },
    {
      name:'RegExp',
      title:'^2 etc.'
    }
  ]
}
angular.module('opsee.global.services').service('Relationships', Relationships);

function AssertionTypes(){
  return[
    {
      name:'Status Code',
      title:'2XX-5XX'
    },
    {
      name:'Header',
      title:'Response Header, auth, etc.'
    },
    {
      name:'Response Body',
      title:'Data from the response'
    },
  ]
}
angular.module('opsee.global.services').service('AssertionTypes', AssertionTypes);

})();//IIFE