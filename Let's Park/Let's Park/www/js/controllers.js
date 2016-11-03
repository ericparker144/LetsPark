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

.controller('AccountCtrl', function ($scope, $http, API) {
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

.controller('loginController', function ($scope, $http, API, $window, Utility, UserInfo) {

    $scope.userInfo = {
        email_address: '',
        password: ''
    };

    $scope.loginUser = function () {

        var info = $scope.userInfo;

        $http.post(API + '/Login', info).then(
            function (response) {
                if (response.data == 'Success') {
                    UserInfo.updateUserInfo(info.email_address);
                    $window.location.href = "#/tab/map";
                }
                else {
                    if (response.data == 'Not a Let\'s Park user') {
                        var title = 'Create an Account';
                        var content = 'You have not yet signed up for Let\'s Park. Please sign up and try logging in after that.';
                        Utility.showAlert(title, content);
                    }
                    else {
                        var title = 'Error';
                        var content = 'Incorrect Password or Username.';
                        Utility.showAlert(title, content);
                    }
                }
            },
            function (response) {
                var title = 'Error';
                var content = 'Server Error. Please try again later.';
                Utility.showAlert(title, content);
            }
            )

    }

});
