// This file was added to manually Bootstrap AngularJS after the device is ready

// This is done for a number of reasons: you could have AngularJS code that relies on Cordova/PhoneGap/Ionic plugins,
// and those plugins won't be ready until after AngularJS has started because Cordova takes longer to get up and running on a device than the plain old Javascript code for AngularJS does.
// So in those cases we have to wait until Cordova/PhoneGap/Ionic is ready before starting up (bootstrapping) AngularJS so that Angular will have everything it needs to run.

// This change was initially added to remove the pop-up that appeared asking to use your location (You need to do the geolocation after the device is ready)

// ng-app was removed from the index.html file once this code was added (that's normally how angular starts itself)
angular.element(document).ready(function () {
    if (window.cordova) {

        // Bootstraps the app when the mobile device is ready

        console.log("Running in Cordova, will bootstrap AngularJS once 'deviceready' event fires.");
        document.addEventListener("deviceready", function () {
            // retrieve the DOM element that had the ng-app attribute
            var domElement = document.getElementById("ngAppElement");
            angular.bootstrap(domElement, ["starter"]);
        }, false);
    } else {

        // Bootstraps the application when running directly in the browser (i.e. not on a device --> during development)

        console.log("Running in browser, bootstrapping AngularJS now.");
        var domElement = document.getElementById("ngAppElement");
        angular.bootstrap(domElement, ["starter"]);

    }
});