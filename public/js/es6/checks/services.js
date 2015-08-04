(() => {

angular.module('opsee.checks.services', []);

function Check($resource, $rootScope, $q, _, Global, CHECK_DEFAULTS, ENDPOINTS, CHECK_SCHEMAS, moment, NotificationSettings){
  const check = $resource(ENDPOINTS.api+'/check',
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
            title:'Delete Item',
            run:function(){
              return console.log('delete');
            }
          }
        ],
        run:function(){
          // const deferred = $q.defer();
          // Global.confirm('Delete this check?').then(() => {
          //   $rootScope.$emit('notify','Deleted check.');
          // });
          // deferred.resolve();
          // return deferred.promise;
        }
      }
    ]
    check.prototype.setSilence = function(length,unit){
      const deferred = $q.defer();
      const c = this;
      c.name = 'foo';
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
    const self = this;
    switch(self.status.state){
      case 'running':
      if(self.status.silence.remaining > 0){
        self.status.silence.diff = moment(self.status.silence.startDate).fromNow();
        self.status.silence.humanDuration = moment.duration(self.status.silence.duration).humanize();
        self.status.silence.user = self.status.silence.user || '[username]';
        return 'Silenced for '+ self.status.silence.humanDuration + ' by '+self.status.silence.user+'.';
      }else{
        return null;
        return 'Running for X minutes';
      }
      break;
      case 'restarting':
      return `This ${self.itemName} is currently restarting.`;
      break;
      case 'unmonitored':
      return `This ${self.itemName} is currently unmonitored.`;
      break;
      case 'stopped':
      return `This ${self.itemName} is  stopped in AWS.`;
      break;
     }
    return self.info;
  }
  check.prototype.menu = function(section){
    this.actions.forEach(a => {
      a.childrenActive = false;
      if(section && a.id != section){
        a.hidden = true;
      }
    });
    Global.contextMenu(this,'/public/js/src/checks/partials/single-context-menu.html');
  }
  check.prototype.getTarget = function(selection){
    if(!selection){return false;}
    let target;
    try{
      //eval here allows us to write simple strings in html
      eval('target=this.'+selection);
    }catch(err){
      console.log(err);
    }
    return target;
  }
  check.prototype.addItem = function(selection){
    let target = this.getTarget(selection);
    if(!target){
      return false;
    }
    const length = target.length;
    let schema;
    try{
      //eval here allows us to write simple strings in html
      eval('schema=CHECK_SCHEMAS.'+selection);
    }catch(err){
      console.log(err);
    }
    const cond1 = length && !angular.equals(target[length-1],schema);
    const cond2 = !length;
    target.push(angular.copy(schema));
  }
  check.prototype.removeItem = function(selection, $index, msg = 'Remove this item?'){
    if(!selection || $index == undefined){return false;}
    const target = this.getTarget(selection);
    if(!target){
      return false;
    }
    const length = target.length;
    $rootScope.global.confirm(msg, true).then(() => {
      target.splice($index,1);
    });
  }
  return check;
}
angular.module('opsee.checks.services').factory('Check', Check);

const checkDefaults = {
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
  assertions:[],
  lastChecked:new Date()
}
angular.module('opsee.checks.services').constant('CHECK_DEFAULTS', checkDefaults);

const checkSchemas = {
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

function Methods(){
  return ['GET','POST','PUT','DELETE','PATCH'].map(name => {return {name:name}});
}
angular.module('opsee.global.services').service('Methods', Methods);

function Protocols(){
  return ['HTTP'].map(name => {return {name:name}});
}
angular.module('opsee.global.services').service('Protocols', Protocols);

function StatusCodes($q, $http, _){
  return () => {
    const deferred = $q.defer();
    $http.get('/public/lib/know-your-http-well/json/status-codes.json').then(res => {
      const array = _.chain(res.data).
        reject(n => n.phrase.match(/\*\*/)).
        sortBy(n => n.code).
        value();
      deferred.resolve(array);
    }, res => {
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
      title:'Exactly equal to.',
      id:'equal'
    },
    {
      name:'Not Equal To',
      title:'Not equal to.',
      id:'notEqual'
    },
    {
      name:'Is Empty',
      title:'Is empty.',
      id:'empty'
    },
    {
      name:'Is Not Empty',
      title:'Is not empty.',
      id:'notEmpty'
    },
    {
      name:'Contains',
      title:'Contains the text.',
      id:'contain'
    },
    {
      name:'Does Not Contain',
      title:'Does not contain the text.',
      id:'notContain'
    },
    {
      name:'RegExp',
      title:'^2 etc.',
      id:'regExp'
    }
  ]
}
angular.module('opsee.global.services').service('Relationships', Relationships);

function AssertionTypes(){
  return[
    {
      name:'Status Code',
      title:'2XX-5XX',
      id:'statusCode'
    },
    {
      name:'Header',
      title:'Response Header, auth, etc.',
      id:'header'
    },
    {
      name:'Response Body',
      title:'Data from the response',
      id:'body'
    },
  ]
}
angular.module('opsee.global.services').service('AssertionTypes', AssertionTypes);

})();//IIFE