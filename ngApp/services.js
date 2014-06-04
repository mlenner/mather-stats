/*
 * People service.  Owns the list of people and communications with Firebase to retrieve images per person.
 */
matherApp.service("People",function($firebase) {
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

	var fbRef = new Firebase("https://xxxxxxxxxxxxxxxxxxxxxxxxx");       
	var loaded = false;	
	var fb = $firebase(fbRef);
	fb.$on("loaded", function(newData) { populateImages(newData); });
	fb.$on("loaded", function() { loaded = true; });

	var populateImages = function(newData) {
		var index = fb.$getIndex();
		var data = newData;

		for (var p in board) {
			var name = board[p].name;
			if (data && data[name]) 
				board[p].url = data[name][0];	 
		}
	}

	return {
		get      : function() { return board; },
		isLoaded : function() { return loaded; },
		newImage : function(name, url) {
			var child = fb.$child(name);
		 	child.$set([url]);
	  	},
	  	removeImage : function(index,name) {
	  		var urls = fb[name][0];
    		urls.splice(index,1);
    		fb.$save();
	  	}
	}
});

/*
 * Messages service - owns the messages, owns the building of the leaderboard, 
 * and the retrieval of the messages from Firebase
 */
matherApp.service('Messages',function($firebase, People, $q) {
	var monthAndDate = moment().format("YYYY/MM")
	var fbRef = new Firebase("https://mather-email.firebaseio.com/msgs/" + monthAndDate);       
	var loaded = false;	
	var fb = $firebase(fbRef);
	fb.$on("loaded", function(newData) { buildLeaderboard(newData); });
	fb.$on("loaded", function() { loaded = true; });

	// see if this works
	var deferred = $q.defer();

	// build leaderboard
	var buildLeaderboard = function(newData) {
		var index = fb.$getIndex();
		var data = newData;
		var sorted = [];
		var board = People.get();
		var dayOfMonth = moment().format('DD');

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

		// days from 1st of the month
		var dayOfMonth = moment().get('day');

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

	    // in case anyone is waiting on this completing
	    deferred.resolve();
	}

	return {
		get : function() { return fb; },
		isLoaded : function() { return loaded; },
		wait : function() { return deferred.promise; }
	}
});

