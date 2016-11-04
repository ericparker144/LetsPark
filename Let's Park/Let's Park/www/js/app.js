// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova'])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (cordova.platformId === 'ios' && window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.constant('API', 'http://lpserver-letsparkserver.44fs.preview.openshiftapps.com/api')

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {


    $ionicConfigProvider.tabs.position('bottom');

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      .state('login', {
          url: '/login',
          templateUrl: 'templates/login.html',
          controller: 'loginController'
      })

    // setup an abstract state for the tabs directive
      .state('tab', {
          url: '/tab',
          abstract: true,
          templateUrl: 'templates/tabs.html'
      })

    // Each tab has its own nav history stack:

    .state('tab.map', {
        url: '/map',
        views: {
            'tab-map': {
                templateUrl: 'templates/tab-map.html',
                controller: 'MapCtrl'
            }
        }
    })

    .state('tab.chats', {
        url: '/chats',
        views: {
            'tab-chats': {
                templateUrl: 'templates/tab-chats.html',
                controller: 'ChatsCtrl'
            }
        }
    })
      .state('tab.chat-detail', {
          url: '/chats/:chatId',
          views: {
              'tab-chats': {
                  templateUrl: 'templates/chat-detail.html',
                  controller: 'ChatDetailCtrl'
              }
          }
      })

    .state('tab.account', {
        url: '/account',
        views: {
            'tab-account': {
                templateUrl: 'templates/tab-account.html',
                controller: 'AccountCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

})


.factory('GEO', function ($cordovaGeolocation, API, $http) {


    var obj = {};

    obj.map = {};    

    obj.getMap = function (callback) {

        var posOptions = { timeout: 10000, enableHighAccuracy: false };
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
              var lat = position.coords.latitude;
              var long = position.coords.longitude;

              var initialLatLng = new google.maps.LatLng(lat, long);

              var mapOptions = {
                  center: initialLatLng,
                  zoom: 15,
                  mapTypeId: google.maps.MapTypeId.ROADMAP
              };

              obj.map = new google.maps.Map(document.getElementById("map"), mapOptions);

              var contentString = '<div id="content">' +
         '<b><h5 id="firstHeading" class="firstHeading">Initial Location</h5></b>' + '<div id="bodyContent">' + '<p>This is the initial location found using your phone\'s GPS.</p>'
       + '</div>' + '</div>';

              var infowindow = new google.maps.InfoWindow({
                  content: contentString
              });

              var pinColor = "387EF5";
              var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
                new google.maps.Size(21, 34),
                new google.maps.Point(0, 0),
                new google.maps.Point(10, 34));

              var marker = new google.maps.Marker({
                  map: obj.map,
                  position: initialLatLng,
                  title: 'Initial Location',
                  icon: pinImage
              });

              marker.addListener('click', function () {
                  infowindow.open(obj.map, marker);
              });

              google.maps.event.addListenerOnce(obj.map, 'idle', function () {
                  callback();
              });


          }, function (err) {

              var lat = 42.304523;
              var long = -83.062027;

              var defaultLatLng = new google.maps.LatLng(lat, long);


              var mapOptions = {
                  center: defaultLatLng,
                  zoom: 15,
                  mapTypeId: google.maps.MapTypeId.ROADMAP
              };

              obj.map = new google.maps.Map(document.getElementById("map"), mapOptions);

              var contentString = '<div id="content">' +
         '<h6 id="firstHeading" class="firstHeading">Default Location</h6>' + '<div id="bodyContent">' + '<p>Your phone\'s GPS has failed you. This is the default location.</p>'
       + '</div>' + '</div>';

              var infowindow = new google.maps.InfoWindow({
                  content: contentString
              });

              var marker = new google.maps.Marker({
                  map: obj.map,
                  position: initialLatLng,
                  title: 'Initial Location'
              });

              marker.addListener('click', function () {
                  infowindow.open(obj.map, marker);
              });

              oogle.maps.event.addListenerOnce(obj.map, 'idle', function () {
                  callback();
              });

          });


        
        // Call a function at the end of this function call [pass the function you wish to callback as a parameter to this function]
        // callback();
    };

    obj.addSpotsToMap = function () {

        console.log("test");
        var results = [];
        var infowindow = new google.maps.InfoWindow(), marker;

        // Set the beginning for the contentString . Later, .concat() method is used to join two or more strings.
        // Concat method does not change the existing strings, but returns a new string containing the text of the joined strings.
        var contentString = '<div id="content">' +
                            '<b><h5 id="firstHeading" class="firstHeading">Available Spot</h5></b>' + '<div id="bodyContent">' + '<p>';

        $http.get(API + '/GetAllSpots').then(
            function (response) {
                results = response.data;

                for (var i = 0; i < results.length; i++) {

                    var spotLatLng = new google.maps.LatLng(results[i].latitude, results[i].longitude);

                    marker = new google.maps.Marker({
                        map: obj.map,
                        position: spotLatLng,
                        title: 'Available Spot'
                    });

                    google.maps.event.addListener(marker, 'click', (function (marker, i) {
                        return function (evt) {
                            infowindow.setContent(contentString.concat('<b>Price: </b>$', results[i].price, '<br><b>Spotter: </b>', results[i].email_address, '<br><b>Description: </b>', results[i].description, '</p>' + '</div>' + '</div>'));
                            infowindow.open(obj.map, marker);
                        }
                    })(marker, i));
                }
            },
            function (response) {
                console.log("Server Error")
            });
    };

    return obj;
})



.factory("Utility", function ($ionicPopup) {
    return {
        showAlert: function (title, content) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: content
            });

            //alertPopup.then(function (res) {
            //    console.log('Pop up closed.');
            //});
        }
    }
})




.factory('UserInfo', function () {

    var userInfo = {};
    var email_address = '';

    userInfo.updateUserInfo = function (emailAddress) {
        email_address = emailAddress;
    }

    userInfo.getUserInfo = function () {
        return email_address;
    }

    return userInfo;

})







;
