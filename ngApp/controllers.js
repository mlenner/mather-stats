"use strict";

var matherApp = angular.module('matherApp', ['ui.bootstrap', 'ui.bootstrap.modal', 'firebase', 'ngRoute']);

/*
 * route config
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

matherApp.controller('LeaderboardCtrl', function ($scope, Messages, People) {

  $scope.loadingMsgs = !Messages.isLoaded();
  $scope.$watch(Messages.isLoaded, function(newVal, oldVal) { $scope.loadingMsgs = !newVal; });
  $scope.board = People.get();


});


matherApp.controller('PersonCtrl', function ($scope, $routeParams, Messages, People) {

	$scope.pId = $routeParams.pId;
	$scope.loading = { details : !Messages.isLoaded() };
	$scope.$watch(Messages.isLoaded, function(newVal, oldVal) { $scope.loading.details = !newVal; });
	$scope.msgs = Messages.get();
	$scope.board = People.get();
	$scope.p = $scope.board[$scope.pId];

	$scope.newImage = function() {
	    var url = $scope.newUrl;
	    $scope.p.url = url;
	    People.setImage($scope.p.name, url);
	    $scope.newUrl = "";
	}

});
