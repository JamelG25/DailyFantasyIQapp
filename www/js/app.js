// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova', 'ngTwitter', 'firebase'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})



.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
      .state('tabs', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })
      .state('tabs.home', {
        url: '/home',
        views: {
          'home-tab':{
            templateUrl: 'templates/home.html'
          }
        }
      })

      .state('tabs.list', {
        url: '/list',
        views: {
          'list-tab':{
            templateUrl: 'templates/list.html',
            controller: 'ListController'
          }
        }
      })

      .state('tabs.detail', {
        url: '/list/:aId',
        views: {
          'list-tab': {
            templateUrl: 'templates/detail.html',
            controller: 'ListController'
          }
        }
      })

      .state('tabs.tweet', {
        url: '/tweet',
        views: {
          'tweet-tab':{
            templateUrl: 'templates/tweet.html',
            controller: 'tweetAuthCtrl'
          }
        }
      })

      .state('tabs.chats', {
        url: '/chats',
        views: {
          'chats-tab': {
            templateUrl: 'templates/chats.html',
            controller: 'ChatsCtrl'
          }
        }
      });

  $urlRouterProvider.otherwise('/tab/home');
})


    .controller('tweetAuthCtrl', function($scope, $ionicPlatform, $twitterApi, $cordovaOauth) {
      console.log('hi');
      var twitterKey = 'STORAGE.TWITTER.KEY';
      var clientId = 'ZzSBvmudGvSFo1iPnpbzg6ufM';
      var clientSecret = 'gjtKufSrjVZP3b5D6AWWufQJERqhba2faR87XvszDzuWw0pgGe';
      var myToken = '';

      $scope.tweet = {};

      $ionicPlatform.ready(function() {
        myToken = JSON.parse(window.localStorage.getItem(twitterKey));
        if (myToken === '' || myToken === null) {
          $cordovaOauth.twitter(clientId, clientSecret).then(function (succ) {
            myToken = succ;
            window.localStorage.setItem(twitterKey, JSON.stringify(succ));
            $twitterApi.configure(clientId, clientSecret, succ);
            $scope.showHomeTimeline();
          }, function(error) {
            console.log(error);
          });
        } else {
          $twitterApi.configure(clientId, clientSecret, myToken);
          $scope.showHomeTimeline();
        }
      });

      $scope.showHomeTimeline = function() {
        $twitterApi.getHomeTimeline().then(function(data) {
          $scope.home_timeline = data;
        });
      };

      $scope.submitTweet = function() {
        $twitterApi.postStatusUpdate($scope.tweet.message).then(function(result) {
          $scope.showHomeTimeline();

        });
      }

      $scope.doRefresh = function() {
        $scope.showHomeTimeline();
        $scope.$broadcast('scroll.refreshComplete');
      };

      $scope.correctTimestring = function(string) {
        return new Date(Date.parse(string));
      };
    })




.controller('ListController', ['$scope', '$http', '$state', function($scope, $http, $state) {
  $http.get('js/data.json').success(function(data){
    $scope.artists = data.artists;
    $scope.whichartist = $state.params.aId;

    $scope.onItemDelete = function(item){
      $scope.artists.splice($scope.artists.indexOf
      (item), 1);
    }

    $scope.doRefresh = function(){
      $http.get('js/data.json').success(function(data){
        $scope.artists = data;
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    $scope.toggleStar = function(item){
      item.star = !item.star;
    }

    $scope.moveItem = function(item, fromIndex, toIindex){
      $scope.artists.splice(fromIndex,1);
      $scope.artists.splice(toIindex, 0, item );
    };
  });
}])

.controller('ChatsCtrl', ['$scope', '$firebaseArray', '$rootScope',
  function($scope, $firebaseArray, $rootScope) {
    //grabbing firebase
    var ref = new Firebase('https://dfs-chat.firebaseio.com/');
    //grab firebase in a variable
    //turn the object into a Array of items
    $scope.chats = $firebaseArray(ref.child('chats'));

    $scope.sendChat = function(chat){
      //if($rootScope.authData) {
        $scope.chats.$add({
          //assigns users as guess
          user: 'Guest',
          //$rootScope.authData.twitter.username,

          //gets all the things from the chat
          message: chat.message,
          //imgURL: $rootScope.authData.twitter.cachedUserProfile.profile_image_url
        });
        chat.message = "";
      //}
     }
  }]);

