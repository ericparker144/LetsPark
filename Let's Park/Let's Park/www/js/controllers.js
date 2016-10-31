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

.controller('AccountCtrl', function($scope, $http, API) {
  $scope.settings = {
    enableFriends: true
  };

  $scope.users = [];

  $http.get(API + '/GetLetsParkUsers')
    .then(function (response) {
        $scope.users = response.data;
    }, function (response) {
        $scope.settings.enableFriends = false;
    });


})

.controller('loginController', function ($scope, $http, API, $window) {

    $scope.userInfo = {
        email_address: '',
        password: ''
    };

    $scope.loginUser = function () {

        console.log($scope.userInfo);

        $http.post(API + '/Login', $scope.userInfo).then(
            function (response) {
                if (response.data == 'Success')
                    $window.location.href = "#/tab/map";
                else
                    alert("nope");
            },
            function (response) {
                alert('Failure')
            }
            )

    }

});
