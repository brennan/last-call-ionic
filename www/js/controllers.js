angular.module('starter.controllers', ['ngMap', 'ionic', 'ngCordova', 'ngTouch', 'ngRoute', 'ui.router']);

app.controller("ExampleController", function($scope) {

    $scope.savePerson = function(firstname, lastname) {
        var PeopleObject = Parse.Object.extend("PeopleObject");
        var person = new PeopleObject();
        person.set("firstname", firstname);
        person.set("lastname", lastname);
        person.save(null, {});
    };

    $scope.getPeople = function(params) {
    var PeopleObject = Parse.Object.extend("PeopleObject");
    var query = new Parse.Query(PeopleObject);
    if(params !== undefined) {
        if(params.lastname !== undefined) {
            query.equalTo("lastname", params.lastname);
        }
        if(params.firstname !== undefined) {
            query.equalTo("firstname", params.lastname);
        }
    }
    query.find({
        success: function(results) {
            alert("Successfully retrieved " + results.length + " people!");
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                console.log(object.id + ' - ' + object.get("firstname") + " " + object.get("lastname"));
            }
        },
        error: function(error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
};

});

app.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
});

app.controller('MapCtrl', ['$scope', '$rootScope', '$stateParams', '$http', '$timeout', '$cordovaGeolocation', '$ionicPlatform', '$routeParams', 'bars', function($scope, $rootScope, $stateParams, $http, $timeout, $cordovaGeolocation, $ionicPlatform, $routeParams, bars) {

  $http.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.7577,-122.4376&radius=30000&types=bar&keyword=gay&opennow&key=AIzaSyATy7HmpP5HnTkO6mGUuiAJFswORqSgk9w')
    .then(function(response) {
      // return an array of bars
      $rootScope.bars = response.data.results;
    });

  // use seed data as a service for testing purposes

  // bars.then(function (data) {
  //   $scope.bars = data.data;
  //   console.log(bars);
  // });

  $scope.$on('mapInitialized', function (event, map) {
    $scope.objMapa = map;
  });

  $scope.show = function (event, bar) {

      var infowindow = new google.maps.InfoWindow();
      var center = new google.maps.LatLng(bar.geometry.location.lat, bar.geometry.location.lng);

      console.log(bar.id);

      // this doesn't seem to be working, and I have no idea why; it's exactly the same as the code on the browse page
      infowindow.setContent(
          "<p><a href='#/app/bars/" + bar.id + "'>" + bar.name + "</a></p>"
      );

      infowindow.setPosition(center);
      infowindow.open($scope.objMapa);
      $scope.objMapa.setZoom(16);
      $scope.objMapa.setCenter(center);
   };

   // button to zoom to Castro
   var castro = new google.maps.LatLng(37.765909, -122.430985);
   $scope.castro = function() {
     console.log(castro);
     $scope.objMapa.setCenter(castro);
     $scope.objMapa.setZoom(16);
   };

   // button to zoom to SoMa
   $scope.soma = function() {
     var soma = new google.maps.LatLng(37.773625, -122.411774);
     $scope.objMapa.setCenter(soma);
     $scope.objMapa.setZoom(16);
   };

   $scope.me = function() {
     var posOptions = {timeout: 10000, enableHighAccuracy: false};
     $cordovaGeolocation
       .getCurrentPosition(posOptions)
       .then(function (position) {
         var lat  = position.coords.latitude;
         var lng = position.coords.longitude;

         var infowindow = new google.maps.InfoWindow();
         var me = new google.maps.LatLng(lat, lng);
         $scope.objMapa.setCenter(me);
         $scope.objMapa.setZoom(16);

         infowindow.setContent(
             '<p>' + " Bitch, we found you (again) " + '</p>'
         );

         infowindow.setPosition(me);
         infowindow.open($scope.objMapa);
         $scope.objMapa.setZoom(16);
         $scope.objMapa.setCenter(me);

       }, function(err) {
         alert("We can't find your current location!");
     });

   };

   $rootScope.saveBar = function (bar) {
      // check if localStorage.photos doesn't exist yet
      if (!localStorage.bars) {
        localStorage.bars = JSON.stringify([]);
      }
      console.log(bar);

      // if a bar is already present in local storage, don't save it; if you do save it, an error will be thrown

      // get existing favorites from localStorage.photos
      var allBars = JSON.parse(localStorage.bars);

      // allBars.push(bar);

      if (!(_.findWhere(allBars, {id: bar.id}))) {
        allBars.push(bar);
        console.log(bar);
        alert(bar.name + " has been added to favorites!");
      } else {
        alert("That bar is already in your favorites!");
      }

      // reset localStorage.photos to updated array of all photos
      localStorage.bars = JSON.stringify(allBars);
      console.log(localStorage.bars);

      // workaround - on click of once forever, disable the button? can jquery be added into the controller?

      };

   }]);

   //favorites only appear on reload of page; this isn't possible on an iphone app, so we never see the favorites, which is strange

app.controller('FavoritesCtrl', ['$scope', '$state', function ($scope, $state) {

  // $state.go($state.current, {}, { reload: true });
  // $state.reload();
  console.log($state);

  // try scope apply to update the state - read about digest cycle
  // window.refresh
  // window.location.reload

  if (!localStorage.bars) {
   $scope.favorites = [];
  } else {
    $scope.favorites = JSON.parse(localStorage.bars);
    console.log($scope.favorites);
  }
}]);

app.controller('BarCtrl', ['$scope', '$rootScope', '$stateParams', '$routeParams', 'bars', '$timeout', '$cordovaGeolocation', '$ionicPlatform', '$http', function($scope, $rootScope, $stateParams, $routeParams, bars, $timeout, $cordovaGeolocation, $ionicPlatform, $http){

  $scope.whichBar = $stateParams.barId;

  $scope.thisBar = _.findWhere($rootScope.bars, {id: $scope.whichBar});

  console.log("place_id for thebar is " + $scope.thisBar.place_id);

  $http.get('https://maps.googleapis.com/maps/api/place/details/json?placeid=' + $scope.thisBar.place_id + '&key=AIzaSyATy7HmpP5HnTkO6mGUuiAJFswORqSgk9w')
    .then(function(response) {
      // return an array of bars
      $scope.specificBar = response.data.result;
      console.log(response.data.result);
    });

  //$scope.thisBar.place_id


}]);
