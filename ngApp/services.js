matherApp.service("People",function($firebase) {
  var board = {
      'mike.lenner@gmail.com' : { mtd : 0, name: 'Mike', url : 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/c82.83.515.515/s160x160/382977_10150384252519350_1097991563_n.jpg' },
      'jonericschwartz@gmail.com' : { mtd : 0, name : 'Jon', url : 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/c82.83.515.515/s160x160/382977_10150384252519350_1097991563_n.jpg' },
      'cretian@aol.com' : { mtd: 0, name : 'Dennis', url : 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/c82.83.515.515/s160x160/382977_10150384252519350_1097991563_n.jpg' },
      'bilello@gmail.com' : { mtd: 0, name : 'Charlie', url : 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/c82.83.515.515/s160x160/382977_10150384252519350_1097991563_n.jpg' },
      'robjwald@gmail.com' : { mtd: 0, name : 'Rob', url : 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/c82.83.515.515/s160x160/382977_10150384252519350_1097991563_n.jpg' },
      'citisncain@aol.com' : { mtd : 0, name : 'Israel', url : 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/c82.83.515.515/s160x160/382977_10150384252519350_1097991563_n.jpg' },
      'jgamils@gmail.com' : { mtd : 0, name : 'Jeff', url : 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/c82.83.515.515/s160x160/382977_10150384252519350_1097991563_n.jpg' },
      'mickymcpartland@yahoo.com' : { mtd: 0, name : 'Micky', url : 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/c82.83.515.515/s160x160/382977_10150384252519350_1097991563_n.jpg' },
      'iboschen@gmail.com' : { mtd: 0, name : 'Ian', url : 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/c82.83.515.515/s160x160/382977_10150384252519350_1097991563_n.jpg' },
      'rebarber@yahoo.com' : { mtd: 0, name : 'Rich', url : 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/c82.83.515.515/s160x160/382977_10150384252519350_1097991563_n.jpg' },
      'carson_cohen@yahoo.com' : { mtd : 0, name : 'Carson', url : 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/c82.83.515.515/s160x160/382977_10150384252519350_1097991563_n.jpg' },
      'joshking@gmail.com' : { mtd: 0, name : 'Josh', url : 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/c82.83.515.515/s160x160/382977_10150384252519350_1097991563_n.jpg' }
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
	  if (data[name]) 
	      board[p].url = data[name];	 
      }
      for (var key in data) {
	 console.log(key);
      }
  }
  
  return {
      get : function() { return board; },
      isLoaded : function() { return loaded; },
      setImage : function(email, url) {
	  //board[person].url = url;
	  var key = email;
	  fb[key] = url;
	  fb.$save();
      }
  }
});

matherApp.service('Messages',function($firebase, People) {
	var fbRef = new Firebase("https://mather-email.firebaseio.com/msgs/2013/12");       
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
	    
	    for (var i=0; i < index.length; i++) {	  
		
		// pull out name from message
		var email = data[index[i]].email;
		
		if (board[email]) { 
		    // increment MTD count
		    board[email].mtd++; 
		    
		    // save latest email
		    var sent = Date.parse(data[index[i]].date.split(" at")[0]);
		    if (!board[email].latestDate || (sent > board[email].latestDate))
			board[email].latestDate = sent;   
		    
		    // save email inside object
		    board[email].email = email;
		}	  
	    }
	    
	    // sort to define ranks
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
	    get : function() { 
		return fb;
	    },
	    isLoaded : function() { return loaded; }
	}
});

