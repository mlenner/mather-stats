"use strict";

/*
 * Define the top level module (right now the only module)
 */
var matherApp = angular.module('matherApp', ['ui.bootstrap', 'ui.bootstrap.modal', 'firebase', 'ngRoute']);

/*
 * Route config
 */
matherApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'board.html',
	      controller: 'LeaderboardCtrl'
      }).
      when('/p/:pId', {
        templateUrl: 'person.html',
	     controller: 'PersonCtrl'
      });
  }
]);

/* 
 * Controller for the leaderboard view.  Shows the ranked leaderboard with everyone's states
 */
matherApp.controller('LeaderboardCtrl', function ($scope, Messages, People) {

  $scope.loadingMsgs = !Messages.isLoaded();
  $scope.$watch(Messages.isLoaded, function(newVal, oldVal) { $scope.loadingMsgs = !newVal; });
  $scope.hideEdit = false;
  $scope.board = People.get();
  $scope.currentMonth = moment().format("MMMM YYYY");

  var buildGrid = function() {
    if ($scope.grid)
      return;

    $scope.grid = [];
    var sorted = [];
    for (var p in $scope.board) {
      sorted.push($scope.board[p]);
    }
    sorted.sort(function(a,b) { 
      return a.rank - b.rank; 
    });

    for (var i=0; i<sorted.length; i++) {
      if (i % 3 == 0)
        $scope.grid.push([]);
      $scope.grid[parseInt(i / 3)].push(sorted[i]);
    }
  }

  // let's try turning this into an array of arrays, sorted by rank
  var promise = Messages.wait();
  promise.then(function() { buildGrid(); });

});

/* 
 * Controller for the person detail view.  Shows thier messages and allows for adding images
 */
matherApp.controller('PersonCtrl', function ($scope, $routeParams, Messages, People, $timeout, $anchorScroll) {

	$scope.pId = $routeParams.pId;
	$scope.loading = { details : !Messages.isLoaded() };
	$scope.$watch(Messages.isLoaded, function(newVal, oldVal) { $scope.loading.details = !newVal; });
	$scope.msgs = Messages.get();
	$scope.board = People.get();
	$scope.p = $scope.board[$scope.pId];
	$scope.hideEdit = true;

  // kill the carousel if it exists
  var carouselKill = function() {
    var carousel = $('#img-carousel-'+$scope.p.name);
    if (carousel && carousel.data('owl-carousel')) 
      carousel.data('owl-carousel').destroy();
  }

  // carousel init
  var carouselInit = function() {
    var carousel = $('#img-carousel-'+$scope.p.name);
    $timeout(function() { 
      carousel.owlCarousel({
        singleItem: true,
        autoPlay: true,
        navigation: true
      });
    });
  }

  $scope.removeImg = function(index) {
    
    carouselKill();
    $scope.p.url.splice(index,1);
    carouselInit();

    // save in firebase
    People.removeImage(index,$scope.p.name);
  }

	$scope.newImage = function() {

		carouselKill();
    $scope.p.url.unshift($scope.newUrl);
    carouselInit();

    // reset input
    $scope.newUrl = "";

    // save in firebase
    People.newImage($scope.p.name, $scope.p.url);

	}

});

/*
 * Is this a hack?
 */
 
