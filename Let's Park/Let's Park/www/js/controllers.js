angular.module('starter.controllers', [])

.controller('MapCtrl', function ($scope, GEO, $cordovaGeolocation, $ionicModal, $http, Utility, UserInfo, API) {

    angular.element(document).ready(function () {

        GEO.getMap(GEO.addSpotsToMap);

        // The url given to the .fromTemplateUrl() method is VERY important. If it is not this URL, the modal will not be created and therefore won't work
        $ionicModal.fromTemplateUrl('templates/create-spot-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });


    });

    $scope.phoneProperties = {
        LocationEnabled: GEO.myLocation.LocationEnabled
    };

    $scope.newSpotInfo = {
        address: '',
        price: '',
        start_time: new Date(),
        end_time: new Date(),
        description: ''
    };

    $scope.getCurrentLoc = function () {

        var posOptions = { timeout: 10000, enableHighAccuracy: false };
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {

            var lat = position.coords.latitude;
            var long = position.coords.longitude;
            var currentLocLatLng = new google.maps.LatLng(lat, long);
            GEO.myLocation.setPosition(currentLocLatLng);
            GEO.map.panTo(currentLocLatLng);

        }, function (err) {

            console.log("Cannot find current location.");
            return;

        });
    };

    var newSpotMarker = null;

    $scope.newSpot = function () {

        if (newSpotMarker == null) {

            var center = GEO.map.getCenter();

            newSpotMarker = new google.maps.Marker({
                map: GEO.map,
                draggable: true,
                animation: google.maps.Animation.DROP,
                position: center
            });
            newSpotMarker.addListener('dblclick', $scope.createSpot);
        }

        GEO.map.panTo(newSpotMarker.getPosition());

    };

    $scope.createSpot = function () {

        $scope.newSpotInfo = {
            address: '',
            price: '',
            start_time: new Date(),
            end_time: new Date(),
            description: ''
        };

        $http.get("http://maps.googleapis.com/maps/api/geocode/json?latlng=" + newSpotMarker.getPosition().lat() + ',' + newSpotMarker.getPosition().lng()).then(
        function (response) {
            $scope.newSpotInfo.address = response.data.results[0].formatted_address;
        }, function (response) {
            $scope.newSpotInfo.address = 'Address not found.';
        })

        $scope.modal.show();

    };

    $scope.closeModal = function () {
        newSpotMarker.setMap(null);
        newSpotMarker = null;
        $scope.modal.hide();
    };

    $scope.submitSpot = function () {

        var nowDate = new Date();

        if (Date.parse($scope.newSpotInfo.start_time) > Date.parse($scope.newSpotInfo.end_time)) {
            var title = "Error";
            var content = "Start Date/Time must be before the End Date/Time."
            Utility.showAlert(title, content);
        }
        else if (Date.parse($scope.newSpotInfo.end_time) < Date.parse(nowDate)) {
            var title = "Error";
            var content = "End Date/Time must be later than right now."
            Utility.showAlert(title, content);
        }
        else {

            var formattedStartTime = Utility.formatHTMLdatetimeForDB($scope.newSpotInfo.start_time);
            var formattedEndTime = Utility.formatHTMLdatetimeForDB($scope.newSpotInfo.end_time);

            // console.log(formattedStartTime);

            var post = {
                user_ID: UserInfo.getUserInfo().user_ID,
                latitude: +(newSpotMarker.getPosition().lat().toFixed(7)),
                longitude: +(newSpotMarker.getPosition().lng().toFixed(7)),
                price: +($scope.newSpotInfo.price.toFixed(2)),
                start_time: formattedStartTime,
                end_time: formattedEndTime,
                description: $scope.newSpotInfo.description
            };            
                        
            // This is a test modal for confirming DateTime on device
            //post.toString = function () {
            //    return 'user_ID: '.concat(this.user_ID, ' start_time: ', this.start_time, ' end_time: ', this.end_time);
            //}
            //console.log(post.toString());
            //var title = "Test";
            //var content = post.toString();
            //Utility.showAlertWithCallback(title, content, $scope.closeModal);

            $http.post(API + '/CreateParkingSpot', post).then(function (response) {
                if (response.data == "Success") {
                    GEO.refreshSpots();
                    var title = "Success";
                    var content = "Your parking spot is now available for purchase."
                    Utility.showAlertWithCallback(title, content, $scope.closeModal);
                }
                else {
                    var title = "Error";
                    var content = "Your parking spot was not added to the map."
                    Utility.showAlertWithCallback(title, content, $scope.closeModal);
                }
            },
            function (response) {
                var title = "Server Error";
                var content = "There was a problem with the server. Please try again later."
                Utility.showAlertWithCallback(title, content, $scope.closeModal);
            });

        }

    };


})

.controller('ChatsCtrl', function ($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
        Chats.remove(chat);
    };
})

.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
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
        user_name: (window.localStorage.getItem("user_name") == null ? '' : window.localStorage.getItem("user_name")),
        password: (window.localStorage.getItem("password") == null ? '' : window.localStorage.getItem("password"))
    };

    $scope.loginUser = function () {

        var info = $scope.userInfo;

        $http.post(API + '/Login', info).then(
            function (response) {

                if (response.status == 404) {
                    var title = '404 Error';
                    var content = 'Server Error. Please try again later.';
                    Utility.showAlert(title, content);
                }

                else {

                    if (response.data.login == 'Success') {
                        if ($scope.remember.me) {
                            window.localStorage.setItem("user_name", $scope.userInfo.user_name);
                            window.localStorage.setItem("password", $scope.userInfo.password);
                        }
                        else {
                            window.localStorage.removeItem("user_name");
                            window.localStorage.removeItem("password");
                        }
                        UserInfo.updateUserInfo(response.data.user_ID, $scope.userInfo.user_name, response.data.first_name, response.data.last_name);
                        $window.location.href = "#/tab/map";
                    }
                    else {
                        if (response.data.login == 'Not a Let\'s Park user') {
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


    .controller('profileController', function ($scope, $http, API, UserInfo, GEO, $window) {

        $scope.mySpots = [];

        // initialize to -1 so $scope.$on always gets called initially
        $scope.initialGEOspotsLength = -1;

        // This function gets called every time the "Profile" tab is visited to make sure that $scope.mySpots gets updates when new spots are added
        $scope.$on("$ionicView.beforeEnter", function () {

            // If the length of GEO.spots is changed (i.e. a new spot is added), update the spots list
            // This is done to avoid doing O(n) work every time the tab is loaded; it is only being done when necessary
            if ($scope.initialGEOspotsLength != GEO.spots.length) {

                // Update value of initialGEOspotsLength to match new length of GEO.spots
                $scope.initialGEOspotsLength = GEO.spots.length;

                // Update spots list
                $scope.mySpots = [];
                $scope.user = {
                    noSpots: true,
                    caption: ''
                };

                for (var i = 0; i < GEO.spots.length; i++) {
                    if (UserInfo.getUserInfo().user_ID == GEO.spots[i].user_ID)
                        $scope.mySpots.push(GEO.spots[i]);
                }

                if ($scope.mySpots.length < 1) {
                    $scope.user.caption = 'You are not currently selling any parking spots.';
                    $scope.user.noSpots = false;
                }
            }

            // No need for HTTP request
            //$http.get(API + '/GetMySpots/' + UserInfo.getUserInfo().user_ID).then(
            //    function (response) {
            //        $scope.mySpots = response.data;
            //        if (response.data.length < 1) {
            //            $scope.user.caption = 'You are not currently selling any parking spots.';
            //            $scope.user.noSpots = false;
            //        }
            //    },
            //    function (response) {
            //        return;
            //    });

        });

        $scope.viewMySpotOnMap = function (index) {

            GEO.map.panTo($scope.mySpots[index].marker.getPosition());
            GEO.map.setZoom(18);
            $window.location.href = "#/tab/map";

        };

    })



    .controller('spotsController', function ($scope, $http, API, UserInfo, GEO, $window) {


        $scope.allSpots = [];
        $scope.spotsInfo = {
            noSpots: true,
            caption: ''
        };

        // initialize to -1 so $scope.$on always gets called initially
        $scope.initialGEOspotsArrayLength = -1;

        // This function gets called every time the "Spots" tab is visited to make sure that $scope.mySpots gets updated when new spots are added
        $scope.$on("$ionicView.beforeEnter", function () {

            // If the length of GEO.spots is changed (i.e. a new spot is added), update the spots list
            // This is done to avoid doing O(n) work every time the tab is loaded; it is only being done when necessary
            if ($scope.initialGEOspotsArrayLength != GEO.spots.length) {

                // Update value of initialGEOspotsArrayLength to match new length of GEO.spots
                $scope.initialGEOspotsArrayLength = GEO.spots.length;

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
            }
        });

        $scope.viewSpotOnMap = function (index) {
            GEO.map.panTo($scope.allSpots[index].marker.getPosition());
            GEO.map.setZoom(18);
            $window.location.href = "#/tab/map";

        };

    })





;
