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
 * GA
*/
matherApp.run(["$rootScope", "$location", 
  function ($rootScope, $location) {
    $rootScope.$on("$routeChangeSuccess", function() {
      ga('set', 'page', $location.path());
      ga('send', 'pageview', $location.path());
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
 matherApp.controller('ChartsCtrl', function ($scope, $routeParams, Messages) {

  var populateChartConfig = function(msgRef) {

    // create a hash map where the keys are emails and values are arrays of msg count
    // { mike: [4,0,0,1], jon: [1,2], etc... }

    // for each message, ID the email

    // do we have an email in the hash?  if not, create it

    // pull the date of the message

    // is there an element at that day of month-1 index?  if so, increment it

    // if not, extend the array to this element, adding zero's if necessary, setting this value to 1

    // return an array of objects of that map, where the key is "name:" and the values are "data:"

    var days = [];
    var index = msgRef.$getIndex();
    for (var i=0; i < index.length; i++) {    
      var msg = msgRef[index[i]];
      var date = Date.parse(msg.date.split(" at")[0]);
      var email = msg.email;



    }

  };
  
  $scope.chartConfig = {
        options: {
            chart: {
                type: 'column'
            }
        },
        xAxis: {
          categories: ['Apples', 'Bananas', 'Oranges']
        },
        series: [
          {name: 'Mike', data: [0,1,0]}, 
          {name: 'Micky', data: [3,2,4]}
        ],
        title: {
            text: 'Messages By Day'
        },
        yAxis: {
            title: {
                text: 'Messages'
            }
        },
        loading: false
    }

 });
 
