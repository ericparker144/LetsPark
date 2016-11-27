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
            // By changing .hideKeyboardAccessoryBar() method to false, it adds the 'done' button to the keyboard for iOS
            //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.constant('API', 'http://nodecode-letsparkserver.44fs.preview.openshiftapps.com/api')

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

    .state('tab.profile', {
        url: '/profile',
        views: {
            'tab-profile': {
                templateUrl: 'templates/tab-profile.html',
                controller: 'profileController'
            }
        }
    })

    .state('tab.spots', {
        url: '/spots',
        views: {
            'tab-spots': {
                templateUrl: 'templates/tab-spots.html',
                controller: 'spotsController'
            }
        }
    })

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


.factory('GEO', function ($cordovaGeolocation, API, $http, Utility) {

    var obj = {};

    obj.myLocation = {};
    obj.map = {};
    obj.spots = [];

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

              var input = document.getElementById('pac-input');
              var searchBox = new google.maps.places.SearchBox(input);
              obj.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

              // Bias the SearchBox results towards current map's viewport.
              obj.map.addListener('bounds_changed', function () {
                  searchBox.setBounds(obj.map.getBounds());
              });

              var markers = [];
              // Listen for the event fired when the user selects a prediction and retrieve
              // more details for that place.
              searchBox.addListener('places_changed', function () {
                  var places = searchBox.getPlaces();

                  if (places.length == 0) {
                      return;
                  }

                  // Clear out the old markers.
                  markers.forEach(function (marker) {
                      marker.setMap(null);
                  });
                  markers = [];

                  // For each place, get the icon, name and location.
                  var bounds = new google.maps.LatLngBounds();
                  places.forEach(function (place) {
                      if (!place.geometry) {
                          console.log("Returned place contains no geometry");
                          return;
                      }
                      var icon = {
                          url: place.icon,
                          size: new google.maps.Size(71, 71),
                          origin: new google.maps.Point(0, 0),
                          anchor: new google.maps.Point(17, 34),
                          scaledSize: new google.maps.Size(25, 25)
                      };

                      // Create a marker for each place.
                      markers.push(new google.maps.Marker({
                          map: obj.map,
                          icon: icon,
                          title: place.name,
                          position: place.geometry.location
                      }));

                      if (place.geometry.viewport) {
                          // Only geocodes have viewport.
                          bounds.union(place.geometry.viewport);
                      } else {
                          bounds.extend(place.geometry.location);
                      }
                  });
                  obj.map.fitBounds(bounds);
              });

       //       var contentString = '<div id="content">' +
       //  '<b><h5 id="firstHeading" class="firstHeading">Initial Location</h5></b>' + '<div id="bodyContent">' + '<p>This is the initial location found using your phone\'s GPS.</p>'
       //+ '</div>' + '</div>';

       //       var infowindow = new google.maps.InfoWindow({
       //           content: contentString
       //       });

              var pinColor = "387EF5";
              var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
                new google.maps.Size(21, 34),
                new google.maps.Point(0, 0),
                new google.maps.Point(10, 34));

              obj.myLocation = new google.maps.Marker({
                  map: obj.map,
                  position: initialLatLng,
                  title: 'Initial Location',
                  icon: pinImage
              });

              // Show the 'getCurrentLoc' function button only if the user's phone has location enabled
              obj.myLocation.LocationEnabled = true;

              //marker.addListener('click', function () {
              //    infowindow.open(obj.map, marker);
              //});

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

              obj.myLocation = new google.maps.Marker({
                  map: obj.map,
                  position: defaultLatLng,
                  title: 'Initial Location'
              });

              // Show the 'getCurrentLoc' function button only if the user's phone has location enabled
              obj.myLocation.LocationEnabled = false;

              //marker.addListener('click', function () {
              //    infowindow.open(obj.map, marker);
              //});

              google.maps.event.addListenerOnce(obj.map, 'idle', function () {
                  callback();
              });

          });
    };

    obj.addSpotsToMap = function () {

        // Create just one info window which will display information for the marker that is clicked
        var infowindow = new google.maps.InfoWindow(), marker;

        // Set the beginning for the contentString . Later, .concat() method is used to join two or more strings.
        // Concat method does not change the existing strings, but returns a new string containing the text of the joined strings.
        var contentString = '<div id="content">' +
                            '<b><h5 id="firstHeading" class="firstHeading">Available Spot</h5></b>' + '<div id="bodyContent">' + '<p>';

        $http.get(API + '/GetAllSpots').then(
            function (response) {
                obj.spots = response.data;

                for (var i = 0; i < obj.spots.length; i++) {

                    var spotLatLng = new google.maps.LatLng(obj.spots[i].latitude, obj.spots[i].longitude);

                    marker = new google.maps.Marker({
                        map: obj.map,
                        position: spotLatLng,
                        title: 'Available Spot'
                    });

                    // Create a new infoWindow for each marker to display its price
                    var priceInfo = new google.maps.InfoWindow({ disableAutoPan: true });

                    // Add a property to the obj.spots object that holds the marker info
                    obj.spots[i].marker = marker;

                    // Add a property to the obj.spots object that holds this new infoWindow
                    obj.spots[i].priceInfoWindow = priceInfo;

                    priceInfo.setContent('$'.concat(obj.spots[i].price));
                    priceInfo.open(obj.map, marker);

                    google.maps.event.addListener(marker, 'click', (function (marker, i) {
                        return function (evt) {
                            infowindow.setContent(contentString.concat('<b>Price: </b>$', obj.spots[i].price,
                                '<br><b>Availability: </b>', Utility.convertDBTimeTo12HourTime(obj.spots[i].start_time), ', ', obj.spots[i].start_time.substring(0, 10),
                                ' to ', Utility.convertDBTimeTo12HourTime(obj.spots[i].end_time), ', ', obj.spots[i].end_time.substring(0, 10), '<br><b>Description: </b>', obj.spots[i].description, '</p>' + '</div>' + '</div>'));

                            obj.spots[i].priceInfoWindow.close();
                            infowindow.open(obj.map, marker);

                            // Close all priceInfoWindows to ensure none of them overlap current window
                            //for (var j = 0; i < obj.spots.length; j++) {
                            //    obj.spots[j].priceInfoWindow.close();
                            //}
                        }
                    })(marker, i));

                    // Re-display the price info window when 'infoWindow' is closed
                    google.maps.event.addListener(infowindow, 'closeclick', (function (marker, i) {
                        return function (evt) {
                            obj.spots[i].priceInfoWindow.open(obj.map, marker);
                        }
                    })(marker, i));

                }
            },
            function (response) {
                console.log("Server Error")
            });

    };

    obj.refreshSpots = function () {
        for (var i = 0; i < obj.spots.length; i++) {
            obj.spots[i].marker.setMap(null);
        }
        obj.spots = [];
        obj.addSpotsToMap();
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
        },
        showAlertWithCallback: function (title, content, callback) {
        
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: content
            });

            alertPopup.then(function (res) {
                callback();
            });

        },
        convertDBTimeTo12HourTime: function (str) {
            var tod = '';
            var hours = '';

            if (str.substring(11, 13) < 12) {
                tod = ' AM';
                hours = str.substring(11, 13);
            }
            else {
                tod = ' PM';
                hours = str.substring(11, 13) - 12;
            }

            if (hours.toString() === '00' || hours == 0)
                return '12'.concat(str.substring(13, 16), tod);
            if (str.substring(11, 12) === '0')
                return hours.substring(1).concat(str.substring(13, 16), tod);

            return hours.toString().concat(str.substring(13, 16), tod);
        },
        formatHTMLdatetimeForDB: function (time) {
            return time.getFullYear() + '-' + (time.getMonth() < 10 ? '0' : '') + (time.getMonth() + 1) + '-' + (time.getDate() < 10 ? '0' : '') + time.getDate() + ' '
            + (time.getHours() < 10 ? '0' : '') + time.getHours() + ':' + (time.getMinutes() < 10 ? '0' : '') + time.getMinutes() + ':' + (time.getSeconds() < 10 ? '0' : '') + time.getSeconds();
        }
    }
})

    

.factory('UserInfo', function () {

    var userInfo = {};

    var user = {};
    user.user_name = '';
    user.user_ID = '';
    user.first_name = '';
    user.last_name = '';

    userInfo.updateUserInfo = function (userID, userName, firstName, lastName) {
        user.user_ID = userID;
        user.user_name = userName;
        user.first_name = firstName;
        user.last_name = lastName;

    }

    userInfo.getUserInfo = function () {
        return user;
    }

    return userInfo;

})






;
