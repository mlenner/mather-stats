"use strict";

/*
 * Define the top level module (right now the only module)
 */
var matherApp = angular.module('matherApp', ['firebase', 'ngRoute', 'highcharts-ng', 'ui.bootstrap']);

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
      when('/p/:pId/:year/:month/m/:mId', {
        templateUrl: 'person.html',
        controller: 'MessageDetailCtrl'
      }).
      when('/charts', {
        templateUrl: 'charts.html',
        controller: 'ChartsCtrl'
      });
  }
]);

/*
 * Initial application setup
 */
matherApp.run(['$rootScope', '$location', '$templateCache', function ($rootScope, $location, $templateCache) {
    
    // Initialize google analytics - send page views on route changes and set the page
    // names to correspond to the just the path
    $rootScope.$on('$routeChangeSuccess', function() {
      ga('set', 'page', $location.path());
      ga('send', 'pageview', $location.path());
    });

  }
]);

/* 
 * Controller for the leaderboard view.  Shows the ranked leaderboard with everyone's states
 */
matherApp.controller('LeaderboardCtrl', function ($scope, Board, MonthAndYear) {

  $scope.hideEdit = false;
  $scope.monthAndYear = MonthAndYear.get();
  $scope.buildingGrid = true;

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
    }

    $scope.buildingGrid = false;
  }

  Board.init( $scope.monthAndYear.current.format( "YYYY/MM" )).then( function( board ) {
    $scope.board = board;
    buildGrid();
    Board.setChangeListener( buildGrid );
    Board.setReloadListener( function() { $scope.buildingGrid = true; });
  });
  
});

/* 
 * Controller for the person detail view.  Shows thier messages and allows for adding images
 */
matherApp.controller('PersonCtrl', function ($scope, $routeParams, Board, Messages, $anchorScroll, $timeout, MonthAndYear, $modal, $location) {
	$scope.pId = $routeParams.pId;
  $scope.hideEdit = true;
  $scope.loading = { details : true };
  $scope.monthAndYearString = MonthAndYear.get().current.format("YYYY/MM");

  Board.init( MonthAndYear.get().current.format("YYYY/MM") ).then( function( board ) {
    $scope.board = board;
    $scope.p = $scope.board[$scope.pId];
    $scope.msgs = Messages.get(); 
    $scope.loading = { details : false };
  });

  if ( !$routeParams.mId ) { $anchorScroll(); }

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

  $scope.msgDetail = function( mId ) {
    $location.path( "/p/" + $scope.pId + "/" + $scope.monthAndYearString + "/m/" + mId );
  }

});

/*
 * Controller for modal popup which shows the details of a single email message
 */
matherApp.controller('MessageDetailCtrl', function ( $scope, $routeParams, Board, Messages, $anchorScroll, $timeout, MonthAndYear, $modal, $controller, $location ) {
  // in case we're asking for a message on a date that isn't yet loaded
  MonthAndYear.set( $routeParams.year, $routeParams.month );

  // call out to parent controller which renders the page behind the detail modal
  angular.extend( this, $controller( 'PersonCtrl', { $scope : $scope, $routeParams : $routeParams, Board : Board, Messages : Messages, 
    $anchorScroll : $anchorScroll, $timeout : $timeout, MonthAndYear : MonthAndYear, $modal : $modal, $location : $location } ));

  $scope.mId = $routeParams.mId;
  $scope.msg = Messages.get();
  $modal.open({
        templateUrl : "partials/msgDetail.html",
        scope : $scope
  });

});

/*
 * For selecting dates to change the stats / leaderboard
 */
matherApp.controller('DatepickerCtrl', function ($scope, $modal, MonthAndYear) {
  
  $scope.dateChange = {
    year : $scope.monthAndYear.current.format("YYYY"),
    month : $scope.monthAndYear.current.format("MM")
  };

  $scope.showModal = function() {
    var mi = $modal.open({
      template: 
      "    <h3 class=\"popover-title\"><strong>Change Date</strong></h3>\n" +
      "    <div class=\"popover-content\">\n" +
      "      <span>Update to see leaderboard stats for any month and year.</span>\n" +
      "    </div>\n" +
      "    <div class=\"popover-content\">\n" +
      "      <form role=\"form\">\n" + 
      "        <div class=\"form-group\">\n" + 
      "            <select class=\"form-control\" ng-model=\"dateChange.month\">\n" +
      "                <option value=\"01\">Janurary</option>\n" +
      "                <option value=\"02\">February</option>\n" +
      "                <option value=\"03\">March</option>\n" +
      "                <option value=\"04\">April</option>\n" +
      "                <option value=\"05\">May</option>\n" +
      "                <option value=\"06\">June</option>\n" +
      "                <option value=\"07\">July</option>\n" +
      "                <option value=\"08\">August</option>\n" +
      "                <option value=\"09\">September</option>\n" +
      "                <option value=\"10\">October</option>\n" +
      "                <option value=\"11\">November</option>\n" +
      "                <option value=\"12\">December</option>\n" +
      "            </select>\n" + 
      "            <select class=\"form-control\" ng-model=\"dateChange.year\">\n" +
      "                <option value=\"2014\">2014</option>\n" +
      "                <option value=\"2013\">2013</option>\n" +
      "            </select>\n" +
      "        </div>\n" +
      "        <div class=\"form-group\">\n" +  
      "            <button type=\"button\" class=\"btn btn-primary\" ng-click=\"$close(dateChange)\">OK</button>\n" +
      "            <button type=\"button\" class=\"btn btn-default\" ng-click=\"$dismiss()\">Cancel</button>\n" +
      "        </div>\n" +
      "      </form>\n" +
      "    </div>\n", // end of popover-content
      scope: $scope,
    });

    mi.result.then(function(dc) { 
      $scope.dateChange = dc; 
      MonthAndYear.set( $scope.dateChange.year, $scope.dateChange.month );
    });
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
    var promise = Messages.init();
    promise.then(function() { buildPie(People.get()); });

 });
 
