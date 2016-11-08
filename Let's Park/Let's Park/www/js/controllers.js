angular.module('starter.controllers', [])

.controller('MapCtrl', function ($scope, GEO) {

    angular.element(document).ready(function () {

        GEO.getMap(GEO.addSpotsToMap);

    });
    
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

    $scope.remember = {};

    $scope.remember.me = (window.localStorage.getItem("user_name") == null ? false : true);


    $scope.userInfo = {
        email_address: (window.localStorage.getItem("user_name") == null ? '' : window.localStorage.getItem("user_name")),
        password: (window.localStorage.getItem("password") == null ? '' : window.localStorage.getItem("password"))
    };

    $scope.loginUser = function () {

        var info = $scope.userInfo;

        $http.post(API + '/Login', info).then(
            function (response) {
                if (response.data == 'Success') {
                    if ($scope.remember.me) {
                        window.localStorage.setItem("user_name", $scope.userInfo.email_address);
                        window.localStorage.setItem("password", $scope.userInfo.password);
                    }
                    else {
                        window.localStorage.removeItem("user_name");
                        window.localStorage.removeItem("user_name");
                    }
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



})



    .controller('profileController', function ($scope, $http, API, UserInfo) {

        angular.element(document).ready(function () {

            $scope.mySpots = [];
            $scope.user = {
                noSpots: true,
                caption: ''
            };


            $http.get(API + '/GetMySpots?email_address=' + UserInfo.getUserInfo()).then(
                function (response) {
                    $scope.mySpots = response.data;
                    if (response.data.length < 1) {
                        $scope.user.caption = 'You are not currently selling any parking spots.';
                        $scope.user.noSpots = false;
                    }
                },
                function (response) {
                    return;
                });
        });

    })



    .controller('spotsController', function ($scope, $http, API, UserInfo, GEO) {

        angular.element(document).ready(function () {

            $scope.allSpots = [];
            $scope.spotsInfo = {
                noSpots: true,
                caption: ''
            };

            $scope.allSpots = GEO.spots;

            if ($scope.allSpots < 1) {
                $scope.spotsInfo.caption = 'There are no spots available in your area.';
                $scope.spotsInfo.noSpots = false;
            }
            
        });

    })





;
