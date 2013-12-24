/*
 * People service.  Owns the list of people and communications with Firebase to retrieve images per person.
 */
matherApp.service("People",function($firebase) {
	var board = {
		'mike.lenner@gmail.com' : { mtd : 0, name: 'Mike', url : [] },
		'jonericschwartz@gmail.com' : { mtd : 0, name : 'Jon', url : [] },
		'cretian@aol.com' : { mtd: 0, name : 'Dennis', url : [] },
		'bilello@gmail.com' : { mtd: 0, name : 'Charlie', url : [] },
		'robjwald@gmail.com' : { mtd: 0, name : 'Rob', url : []},
		'citisncain@aol.com' : { mtd : 0, name : 'Israel', url : [] },
		'jgamils@gmail.com' : { mtd : 0, name : 'Jeff', url : [] },
		'mickymcpartland@yahoo.com' : { mtd: 0, name : 'Micky', url : [] },
		'iboschen@gmail.com' : { mtd: 0, name : 'Ian', url : [] },
		'rebarber@yahoo.com' : { mtd: 0, name : 'Rich', url : [] },
		'carson_cohen@yahoo.com' : { mtd : 0, name : 'Carson', url : [] },
		'joshking@gmail.com' : { mtd: 0, name : 'Josh', url : [] }
	}

	var fbRef = new Firebase("https://mather-email.firebaseio.com/people");       
	var loaded = false;	
	var fb = $firebase(fbRef);
	fb.$on("loaded", function(newData) { addImages(newData); });
	fb.$on("loaded", function() { loaded = true; });

	var addImages = function(newData) {
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
	  }
	}
});

/*
 * Messages service - owns the messages, owns the building of the leaderboard, 
 * and the retrieval of the messages from Firebase
 */
matherApp.service('Messages',function($firebase, People) {
	var monthAndDate = moment().format("YYYY/MM")
	var fbRef = new Firebase("https://mather-email.firebaseio.com/msgs/" + monthAndDate);       
	var loaded = false;	
	var fb = $firebase(fbRef);
	fb.$on("loaded", function(newData) { buildLeaderboard(newData); });
	fb.$on("loaded", function() { loaded = true; });
	//fb.$on("change", function() { processChange(); });

	// change - you know what to do
	//var processChange = function() {
	//    loaded = false;
	//    buildLeaderboard(fb);
	//    loaded = true;
	//}

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
			}	  
		}

		// days from 1st of the month
		var dayOfMonth = moment().get('day');

	    // sort to define ranks.  also add each person's email address to their record
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
		get : function() { return fb; },
		isLoaded : function() { return loaded; }
	}
});

