//The code in this document is written in jQuery, a javascript library

//List of global variables that are used for the below functions
var apiKey = "AIzaSyDewJP5LDBqFfsHhOFECYVRIjO6wS8uD9U";
var state = ""			// state var from google for camp
var homeAddress = "";	// home address from user input
var homeLoc = [];		// Lat & Long object for map centering
var homeState = "";		// State from googleAPI
var campSites = [];		// location of site from camping api
var campName = [];		// campsite name from camping api

//when a person types an address in the in the search box form (#addressForm) on the fist page and
//submits it be pressing enter this function recognizes it and grabs the value from the input field (#addressInput)
//the value is then assigned to the address varable and submitted to the google url function
$("#addressForm").submit( function(event) {
    event.preventDefault();							//prevents default action for submit function
    var address = $("#addressInput").val().trim();	// Sets address to user input
    googleUrl(address);								// Passes address to build google api query
    $("form").trigger("reset");						// Reset form
    $("#map").css("display", "block");
});


//This function displays the Meet the Developers page once the user clicks the "Meet the Developers" button
$("#developers").on('click', function(){
    console.log($(".container"));
      $(".container").css("display", "block");

})


//This Function scrolls to the top of the page
$('#logo').on('click', function(){
    $('html, body').animate({ scrollTop: 0 }, 'slow');
})
//this function take in an address in string format and inserts it along with the apiKey variable into a
//predesignated url format designed by google. This url is assigned to a string variable googleURL which
//is submitted to the googleAPI function
function googleUrl(address) {
	var googleURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=" + apiKey;
	googleAPI(googleURL);
};

//This function takes in a predefined URL (URL set up according to google API specification) and returns a json
//object with address information. paste in the below url to your browser for an exmaple of the repsonse json
//https://maps.googleapis.com/maps/api/geocode/json?address=1600+Pennsylvania+Ave+NW,+Washington,+DC+20500&key=AIzaSyDewJP5LDBqFfsHhOFECYVRIjO6wS8uD9U
//A json obeject is simply an object of arrays and other objects so we can
//traverse into this json to pull out information. For this function we need to pull out the latitude and longitude
//information. To get the homeLat we will reach into the response oject and access the result parameter (responce.result)
//it turns out the result parameter houses an array of objects. the first object is important to us so we reach
//into the array using [] (response.result[0]) the next step down is another object so we use the . sytax to
//access it (response.result[0].geometry) the next two levels are also objects so again we use the . syntax
//to access them (response.results[0].geometry.location.lat) we do the same process to get the longitude
function googleAPI(googleURL) {
	$.ajax({					//Ajax is a jQuery function that send a request to the google API
		url: googleURL,			//this is URL expected by the google API
		method: "GET",			//We are choose to a GET request (there are other types of request)
		dataType: "json",		//The data type to be returned
	}).done(function(response){	//once the response from google has arrived call the .done callback function
		if(response.status === "OK"){

			var homeLat = response.results[0].geometry.location.lat; //go into the returned json and fethch the latitude via the given path ans assign it to a varable
			var homeLng = response.results[0].geometry.location.lng; //go into the returned json and fethch the latitude via the given path ans assign it to a varable
			homeLoc = {lat: homeLat, lng: homeLng}; //build an object with the lat and long information and assign it to the homeLoc Varable
		   	stateGiver(response); //send the reponse json to the the stateGiver function
	   	}else{
	   		$("#map").html("<h3>Test</h3>");
	   	}
  });


}

//this function takes in a json object retuned from a GoogleMaps API call and finds the two letter state code
//we have to use a double for loop to search through the json for the state code it searches through each address
//componant (first loop) then searches through each address componant type (second loop) and find the address
//componant type of "administrative_area_level_1" then sets the short name of the corresponding address componant
//the state variable then calls the geolist function
function stateGiver(response) {
	for (j = 0; j < response.results[0].address_components.length; j++) {
	  for (h = 0; h < response.results[0].address_components[j].types.length; h++) {
	    if (response.results[0].address_components[j].types[h] === "administrative_area_level_1") {
	      state = response.results[0].address_components[j].short_name;
	  	};
	  };
	};
	// geoList(state);
	geoJson(state);
	// buildPageTwo();
};

//This function queries the server and askes it to return a json object of all the campground geocoordinates
//It does this in the same way as the googleAPI function by employeeing an ajax call and supplying a URL
//of a specific format. This function takes in a two letter state code and builds this URL then send it to
//the server. The server knows how to handle a specific URL and return the correct information becuase of the
//geocode portion of the URL
function geoList(state) {
	$.ajax( {
        url: "https://campsites123.herokuapp.com/geocode/" + state,
        method: "GET",
        success: function(response){
        // console.log(response) ;
        for (i = 0; i < response.length; i++) {
        var lat = Number(response[i].lat);
        var lng = Number(response[i].long);
        campSites.push({'lat': lat, 'lng': lng});


        }

        initMap();

      }
    })
}

//This function works exactly like the geoList function except this function has a slightly different URL
//specifically geojason vs geocode. There server knows how to hadle this difference
function geoJson(state) {
	$.ajax( {
        url: "https://campsites123.herokuapp.com/geojson/" + state,
        method: "GET",
        success: function(response){
        // console.log(response)
        for (i = 0; i < response.length; i++) {
        	var lat = Number(response[i].lat);
        	var lng = Number(response[i].long);
        	campSites.push({'lat': lat, 'lng': lng});

        	campName.push(response[i].facilityName);
    	}

    	initMap();
      }
    })
}

function plotMap() {

}

// function buildPageTwo() {
// 	$('body').empty();
// 	$('body').html('<div class="container"><div class="header-box"><div class="logo"><center><img src="assets/images/logo.png" style="height:100px; width:100px;"></center></div><center><p>CAMPING HUBS</p></center><div class="box"><div class="container-1"><span class="object"><i class="fa fa-search"></i></span><input type="search" id="search" placeholder="Search..." /></div></div></div><div class="row"><div class="col-md-4 col-md-offset-1"><div id="results"><div class="panel panel-default"><div class="panel-heading"><h3 class="panel-title">Results</h3></div><div class="panel-body"></div></div></div></div><div class="col-md-4 col-md-offset-2"><div id="map"></div></div></div></div><div class="row"><div class="col-md-12"><div id="foot"><footer><a href="https://www.facebook.com/nationalparkservice/" class="icon icon-mono facebook"></a><a href="https://twitter.com/NatlParkService?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor" class="icon icon-mono twitter"></a><a href="https://github.com/lchambers6/FirstGroupProject" class="icon icon-mono github"></a></footer></div></div></div>');
// }

function initMap() {
	// sets zoom location
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 9,
		//center: homeLoc
		center: homeLoc
});
	// Log for testing delete later #########################
	// console.log("campSites initMap");
	console.log(campSites);

	//  campSites[] from campAPI json object
	for(i=0; i < campSites.length; i++){var marker = new google.maps.Marker({
		position: campSites[i],
		// title fix for special characters
		title: he.decode(campName[i]),
		icon: "assets/images/mapmarker.png",
		map: map
		});
	};
}
