angular.module('starter.controllers', [])

.controller('MapCtrl', function ($scope, $state, $cordovaGeolocation) {

    //var latLng = new google.maps.LatLng(42.1374735, -83.11383710000001);

    //var mapOptions = {
    //    center: latLng,
    //    zoom: 15,
    //    mapTypeId: google.maps.MapTypeId.ROADMAP
    //};

    //$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

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

          $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

          var contentString = '<div id="content">' +
            '<h6 id="firstHeading" class="firstHeading">Initial Location</h6>' + '<div id="bodyContent">' + '<p>This is the initial location found using your phone\'s GPS.</p>'
          + '</div>' + '</div>';

          var infowindow = new google.maps.InfoWindow({
              content: contentString
          });

          var marker = new google.maps.Marker({
              map: $scope.map,
              position: initialLatLng,
              title: 'Initial Location'
          });

          marker.addListener('click', function () {
              infowindow.open(map, marker);
          });

      }, function (err) {
          console.log("Geolocation Error");
      });

    //var watchOptions = {
    //    timeout: 3000,
    //    enableHighAccuracy: false // may cause errors if true
    //};

    //var watch = $cordovaGeolocation.watchPosition(watchOptions);
    //watch.then(
    //  function (position) {
    //      var lat = position.coords.latitude
    //      var long = position.coords.longitude



    //  },
    //  function (err) {
    //      // error
    //  });


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

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
