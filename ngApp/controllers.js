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
  
  // create arrays of 3
  //$scope.board = [];
  //var idx = 0;
  //for (var p in People.get()) {
  //	if (idx++ % 3 == 0)
  //		$scope.board.push([]);
 //	$scope.board[$scope.board.length-1].push(People.get()[p]);
  //}
  
  $scope.board = People.get();

});

/* 
 * Controller for the person detail view.  Shows thier messages and allows for adding images
 */
matherApp.controller('PersonCtrl', function ($scope, $routeParams, Messages, People, $timeout) {

	$scope.pId = $routeParams.pId;
	$scope.loading = { details : !Messages.isLoaded() };
	$scope.$watch(Messages.isLoaded, function(newVal, oldVal) { $scope.loading.details = !newVal; });
	$scope.msgs = Messages.get();
	$scope.board = People.get();
	$scope.p = $scope.board[$scope.pId];
	$scope.hideEdit = true;

	$scope.newImage = function() {

		// kill the carousel if it exists
		var carousel = $('#img-carousel-'+$scope.p.name);
		if (carousel && carousel.data('owl-carousel')) 
			carousel.data('owl-carousel').destroy();

	    $scope.p.url.unshift($scope.newUrl);
	    
	    // re-init
	    $timeout(function() { 
	    	carousel.owlCarousel({
	    		singleItem: true,
	    		autoPlay: true,
	    		navigation: true
	    	});
	    });

	    // reset input
	    $scope.newUrl = "";

	    // save in firebase
	    People.newImage($scope.p.name, $scope.p.url);

	}

});

/*
 * Is this a hack?
 */
 
