"use strict";

/*
 * Define the top level module (right now the only module)
 */
var matherApp = angular.module('matherApp', ['firebase', 'ngRoute', 'highcharts-ng']);

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
      }).
      when('/charts', {
        templateUrl: 'charts.html',
        controller: 'ChartsCtrl'
      });
  }
]);

/*
 * Initialize google analytics - send page views on route changes and set the page
 * names to correspond to the just the path
*/
matherApp.run(['$rootScope', '$location', 
  function ($rootScope, $location) {
    $rootScope.$on('$routeChangeSuccess', function() {
      ga('set', 'page', $location.path());
      ga('send', 'pageview', $location.path());
    });
  }
]);

/* 
 * Controller for the leaderboard view.  Shows the ranked leaderboard with everyone's states
 */
matherApp.controller('LeaderboardCtrl', function ($scope, Board) {

  $scope.hideEdit = false;
  $scope.currentMonth = moment().format("MMMM YYYY");
  $scope.buildingGrid = true;

  Board.wait().then( function( board ) {
    $scope.board = board;
    buildGrid();
  });

  // 2D array to create my 3x3 rows
  var buildGrid = function() {
    $scope.buildingGrid = true;

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
      console.log( "in grid: " + sorted[i].name + ", " + sorted[i].rank );
    }

    $scope.buildingGrid = false;
  }
  
});

/* 
 * Controller for the person detail view.  Shows thier messages and allows for adding images
 */
matherApp.controller('PersonCtrl', function ($scope, $routeParams, Board, People, Messages, $anchorScroll) {
	$scope.pId = $routeParams.pId;
  $scope.hideEdit = true;
  $scope.loading = { details : true };
  $scope.msgs = Messages.get(); 

  Board.wait().then( function( board ) {
    $scope.board = board;
    $scope.p = $scope.board[$scope.pId];
    $scope.loading = { details : false };
  });
	
  $anchorScroll();

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
 * Charts Controller
 */
 matherApp.controller('ChartsCtrl', function ($scope, $routeParams, Messages, People) {

  
  // the base config for the messages by person
  $scope.pieConfig = {
        options: {
            chart: {
                type: 'pie'
            }
        },
        series: [{
          type: 'pie'
        }],
        title: {
            text: 'Messages By Person'
        },
        loading: true
    }

    // build the pie chart with data
    var buildPie = function(board) {
      var dataSeries = [];
      for (var p in board) {
        dataSeries.push({name: board[p].name, y: board[p].mtd});
        if (board[p].rank == 1)
          dataSeries[dataSeries.length-1].sliced = true;
      }
      $scope.pieConfig.loading = false;
      $scope.pieConfig.series.push({data: dataSeries});
    }

    // update all charts with data
    var promise = Messages.wait();
    promise.then(function() { buildPie(People.get()); });

 });
 
