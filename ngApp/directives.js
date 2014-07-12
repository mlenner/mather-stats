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

matherApp.directive('choosedate', function($compile) {
	
	var html = '<div><input type="text" ng-model="testing"></input></div>';

	return {
		restrict: 'A',
		transclude: true,
    	template: "<span ng-transclude></span>",
		scope : {
			testing : "="
		},
		link: function( scope, elem, attrs ) {
			var content = $compile(html)(scope);		
				
			$(elem).popover({
				content: content,
				html: true
			});

			$(elem).on('show.bs.popover', function() {
				var newc = $compile(html)(scope);	
				$(elem).popover({ content: newc });	
				console.log("hello");
			});
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