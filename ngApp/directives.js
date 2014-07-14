matherApp.directive('person.tile', function($timeout) {
	return {
	    restrict: 'E',
	    replace: true,
	    templateUrl: 'partials/personTile.html',
	    link: function(scope, element, attrs) {
	    	if (scope.$last === true) {
                $timeout(function () {
	    			$(element).find('.owl-carousel').owlCarousel({
	    				singleItem: true,
	    				autoPlay: true,
	    				navigation: true
	    			});
	    		});
            }
	    }
	};
});


matherApp.directive('loading', function() {
	return {
	    restrict: 'E',
	    replace: true,
	    templateUrl: 'partials/loading.html'
	};
});

matherApp.directive('owlInit', function($timeout) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			if (scope.$last === true) {
                $timeout(function () {
	    			$(element).closest('.owl-carousel').owlCarousel({
	    				singleItem: true,
	    				autoPlay: true,
	    				navigation: true
	    			});
	    		});
            }	
		}
	};
});

matherApp.directive('rowsOfThree', function($timeout) {
	var insertRows = function() {
		var tileCount = $('.board-tile').size();
		for (var i=0; i<=tileCount; i+=3) {
			var slice = $('.board-tile').slice(i,i+3);
			if (slice)
				slice.wrapAll('<div class="row"></div>');
		}
	}

	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			if (scope.$last === true) {
				//$timeout(insertRows);
			}
		}
	};
});