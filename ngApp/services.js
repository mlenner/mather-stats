matherApp.service("Board", function(People, Messages, $q) {
	var board = {
		'mike.lenner@gmail.com' : { email : "mike.lenner@gmail.com", mtd : 0, name: 'Mike', url : [] },
		'jonericschwartz@gmail.com' : { email : "jonericschwartz@gmail.com", mtd : 0, name : 'Jon', url : [] },
		'cretian@aol.com' : { email : "cretian@aol.com", mtd: 0, name : 'Dennis', url : [] },
		'bilello@gmail.com' : { email : "bilello@gmail.com", mtd: 0, name : 'Charlie', url : [] },
		'robjwald@gmail.com' : { email : "robjwald@gmail.com", mtd: 0, name : 'Rob', url : []},
		'citisncain@aol.com' : { email : "citisncain@aol.com", mtd : 0, name : 'Israel', url : [] },
		'jgamils@gmail.com' : { email : "jgamils@gmail.com", mtd : 0, name : 'Jeff', url : [] },
		'mickymcpartland@yahoo.com' : { email : "mickymcpartland@yahoo.com", mtd: 0, name : 'Micky', url : [] },
		'iboschen@gmail.com' : { email : "iboschen@gmail.com", mtd: 0, name : 'Ian', url : [] },
		'rebarber@yahoo.com' : { email : "rebarber@yahoo.com", mtd: 0, name : 'Rich', url : [] },
		'carson_cohen@yahoo.com' : { email : "carson_cohen@yahoo.com", mtd : 0, name : 'Carson', url : [] },
		'joshking@gmail.com' : { email : "joshking@gmail.com", mtd: 0, name : 'Josh', url : [] },
		'josh@warrbo.com' : { email : "josh@warrbo.com", mtd: 0, name : 'Warrbo', url : [] },
		'mph@fanvsfan.com' : { email : "mph@fanvsfan.com", mtd: 0, name : 'Bean', url : [] }		
	}

	// function that can be set to act as callback when a change is detected 
	var listeners = {
		changeListener : undefined,
		reloadListener : undefined
	};

	// retrieve firebase data from other services
	var loadData = function( monthAndDate, promise ) {
		// default to current month and date
		if (!monthAndDate) { monthAndDate = moment().format("YYYY/MM"); }

		// first load people
		People.init()
			.then( function() { People.populateBoard( board )})

			// next load the messages for those people
			.then( Messages.init( monthAndDate )
				.then( function() { Messages.populateBoard( board )})

				// add listener to Messages now that data is loaded
				.then( function() { 
					Messages.listenForChange( function() {
						Messages.populateBoard( board );
						if ( listeners.changeListener ) { listeners.changeListener(); }
					});
				})

				// finally, resolve the promise with the fully built board
				.then( function() { promise.resolve( board )})
			);
	}

	return {
		init : function( monthAndDate ) { 
			var deferred = $q.defer();
			loadData( monthAndDate, deferred );
			return deferred.promise;
		},
		reload : function( monthAndDate ) {
			if ( listeners.reloadListener ) { listeners.reloadListener(); }
			var deferred = $q.defer();
			loadData( monthAndDate, deferred );
			deferred.promise.then( function() {
				if ( listeners.changeListener ) { listeners.changeListener(); }	
			})
			return deferred.promise;
		},
		setChangeListener : function( listener ) {
			listeners.changeListener = listener;
		},
		setReloadListener : function( listener ) {
			listeners.reloadListener = listener;
		}
	}
});


/*
 * People service.  Owns the list of people and communications with Firebase to retrieve images per person.
 */
matherApp.service("People",function($firebase, $q) {
	
	var fbRef = new Firebase("https://mather-email.firebaseio.com/people");
	var loaded = false;	
	
	var deffered = $q.defer();
	var fb = $firebase(fbRef);
	
	fb.$on("loaded", function() { 
		loaded = true; 
		deffered.resolve();
	});

	var populateImages = function(board) {
		var data = fb;
		for (var p in board) {
			var name = board[p].name;
			if (data && data[name]) 
				board[p].url = data[name][0];	 
		}
	}

	return {
		get      : function() { return fb; },
		init 	 : function() { return deffered.promise; },
		isLoaded : function() { return loaded; },
		newImage : function(name, url) {
			var child = fb.$child(name);
		 	child.$set([url]);
	  	},
	  	removeImage : function(index,name) {
	  		var urls = fb[name][0];
    		urls.splice(index,1);
    		fb.$save();
	  	},
	  	populateBoard : function(board) {
	  		// eventually will also drive which people are in the board
	  		//populatePeople( board );
	  		// for now, just images
	  		populateImages( board );
	  	},
	}
});

matherApp.service('MonthAndYear',function( Board, $location ) {
	var state = {
		current : moment()
	}
	return {
		get : function() { return state; },
		set : function( year, month ) {
			var newDate = moment( year + "-" + month, "YYYY-MM" );
			if ( !state.current.isSame( newDate )) {
				state.current = newDate;
				Board.reload( state.current.format("YYYY/MM") );
			}
		}
	}
});

/*
 * Messages service - owns the messages, owns the building of the leaderboard, 
 * and the retrieval of the messages from Firebase
 */
matherApp.service('Messages',function($firebase, $q) {
	var loaded = false;	
	var loadedMonthAndDate;
	var msgs = {};
	
	var loadData = function( monthAndDate, promise ) {
		if ( loaded && ( monthAndDate == loadedMonthAndDate )) {
			promise.resolve();
			return;
		}

		loaded = false;
		var fbRef = new Firebase("https://mather-email.firebaseio.com/msgs/" + monthAndDate);       
		msgs = $firebase(fbRef);
		msgs.$on("loaded", function() { 
			loaded = true; 
			loadedMonthAndDate = monthAndDate;
			promise.resolve();
		});
	}

	// build leaderboard
	var buildLeaderboard = function( board ) {
		
		// clear the board in case this is a rebuild
		for ( var p in board ) {
			board[p].mtd = 0;
			board[p].latestDate = undefined;
			board[p].perDay = undefined;
			board[p].rank = undefined;
		}

		var index = msgs.$getIndex();
		var data = msgs; 
		var sorted = [];
		var loadedMonth = loadedMonthAndDate.substring( 5 );
		var dayOfMonth = loadedMonth === moment().format('MM')
			? moment().format('DD') // today
			: moment().set('month', loadedMonth-1 ).endOf('month').format('DD'); // last day of that month

		for (var i=0; i < index.length; i++) {	  

			// pull out name from message
			var email = data[index[i]].email;

			if (board[email]) { 
			    // increment MTD count
			    board[email].mtd++; 
			    
			    // update msg per day
			    board[email].perDay = (board[email].mtd / dayOfMonth);

			    // save latest email
			    var sent = Date.parse(data[index[i]].date.split(" at")[0]);
			    if (!board[email].latestDate || (sent > board[email].latestDate))
			    	board[email].latestDate = sent;   
			    
			    // save email inside object
			    board[email].email = email;
			} else {
				console.log("unaccounted for: " + email);
			}	  
		}

	    // sort to define ranks.  also add each person's email address to their record.  
	    // also - learn how to do this such that it's not ridiculous
	    for (var p in board) {
	    	board[p].person = p;
	    	sorted.push(board[p]);
	    }
	    var rank = 1;
	    sorted.sort(function(a,b) { 
	    	return b.mtd - a.mtd; 
	    }).forEach(function(p) { 
	    	board[p.person].rank = rank++; 
	    });
	}

	return {
		get : function() { return msgs; },
		isLoaded : function() { return loaded; },
		init : function( monthAndDate ) { 
			var deferred = $q.defer();
			loadData( monthAndDate, deferred );
			return deferred.promise; 
		},
		populateBoard : function( board ) { buildLeaderboard( board ); },
		listenForChange : function( listener ) {
			msgs.$off( "change" ); // this is a hack - means we can only ever have one listener
			msgs.$on("change", listener );
		}
	}
});

