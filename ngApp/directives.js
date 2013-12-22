matherApp.directive('person.tile', function() {
	return {
	    restrict: 'E',
	    replace: true,
	    templateUrl: 'partials/personTile.html'
	};
});

matherApp.directive('loading', function() {
	return {
	    restrict: 'E',
	    replace: true,
	    templateUrl: 'partials/loading.html'
	};
});
