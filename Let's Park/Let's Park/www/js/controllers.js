angular.module('starter.controllers', [])

.controller('MapCtrl', function ($scope, GEO) {
        
    GEO.getMap();
    
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, $http) {
  $scope.settings = {
    enableFriends: true
  };

  $scope.users = [];

  $http.get('http://localhost:8080/api/GetLetsParkUsers')
    .then(function (response) {
        $scope.users = response.data;
    }, function (response) {
        $scope.settings.enableFriends = false;
    });


});
