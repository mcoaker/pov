$( "#form" ).submit(function( event ) {
	
	console.log(document.getElementById("date").value);
	console.log(document.getElementById("time").value);
	console.log(document.getElementById("location").value);
	
	var date = document.getElementById("date").value;
	var time = document.getElementById("time").value;
	var location = document.getElementById("location").value;
		
	var d = new Date(date.substr(0,4), date.substr(5,2)-1, date.substr(8,2), time.substr(0,2), time.substr(3,2), 0);
	
	var dateFrom = new Date(d);
	dateFrom.setHours(d.getHours()-3);
	var dateTo = new Date(d);
	dateTo.setHours(d.getHours()+3);
	
	console.log(d);
	console.log(dateFrom);
	console.log(dateTo);
	
	var fromTime = dateFrom.getTime()/1000;
	var toTime = dateTo.getTime()/1000;
	
	getGeoCode(location, fromTime, toTime);
	
	event.preventDefault();
});

$(document).ready(function(){
	
	$('.status2').hide();
	$('.status3').hide();
	$('.status4').hide();
	
	$('.carousel').hide();
});

function getGeoCode (address, from, to) {
	
	$('.status1').hide();
	$('.status2').show();	
	
	var lat = 0;
	var lng = 0;
	
	var geocoderUrl = "https://maps.googleapis.com/maps/api/geocode/json?sensor=false&address=" + encodeURIComponent(address);
        
    $.getJSON(geocoderUrl, function(data){
    	console.log(data);
    	lat = data.results[0].geometry.location.lat;
    	lng = data.results[0].geometry.location.lng;
    	
    	getPictures (lat, lng, from, to);
    });
};

function getPictures (lat, lng, from, to) {
	
	$('.status2').hide();
	$('.status3').show();	
	
	var instagramUrl = "https://api.instagram.com/v1/media/search?lat=" + lat + 
			"&lng=" + lng + 
			"&access_token=558673112.801eb26.92d30178271a438cb4b647635707af93" + 
			"&min_timestamp=" + from + 
			"&max_timestamp=" + to +
			"&callback=?";
	    
    $.getJSON(instagramUrl, function(data){
    	console.log(data);
    	$.each(data.data, function(i,item){

    		try {
    			var caption = item.caption.text;
    		} catch (e) {
    			var caption = "Nothing to say...";
    		}
    		
    		//Adds img to carousel
    		var newDiv = document.createElement("DIV");
    		newDiv.className = "item";
    		if (i==0) newDiv.className += " active";

    		var newImg = document.createElement("IMG");
    		newImg.src = item.images.standard_resolution.url;
    		newDiv.appendChild(newImg);

    		var captionDiv = document.createElement("DIV");
    		captionDiv.className = "carousel-caption";
    		captionDiv.appendChild(document.createTextNode(timestamp2date(item.created_time) + " | " + caption));
    		newDiv.appendChild(captionDiv);
    		
    		document.getElementById("gallery").appendChild(newDiv);

    		//Adds li to indicators
    		var newLi = document.createElement("li");
    		newLi.setAttribute("data-target", "#myCarousel");
    		newLi.setAttribute("data-slide-to", i);
    		if (i==0) newLi.className = "active";
    		
    		document.getElementById("indicators").appendChild(newLi);
            
    	});
    	
    	displayCarousel();
    	
    });
};

function displayCarousel () {
	$('.status3').hide();
	$('.status4').show();
	
	$('.carousel').show();
	
	$('.carousel').carousel();
}

function timestamp2date (timestamp) {
	// create a new javascript Date object based on the timestamp
	// multiplied by 1000 so that the argument is in milliseconds, not seconds
	var date = new Date(timestamp*1000);
	// hours part from the timestamp
	var hours = date.getHours();
	// minutes part from the timestamp
	var minutes = date.getMinutes();
	// seconds part from the timestamp
	var seconds = date.getSeconds();

	// will display time in 10:30:23 format
	return hours + ':' + minutes + ':' + seconds;
}