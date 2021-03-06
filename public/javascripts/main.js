var clip = new ZeroClipboard( $("#share"), {
	  moviePath: "/assets/javascripts/ZeroClipboard.swf"
	} );

$(document).ready(function(){
	
	$('#share').hide();
	$('.carousel').hide();
	
	document.getElementById("date").value = getDateToday();
	document.getElementById("time").value = getTimeToday();
	
	checkParams();
});

$( "#form" ).submit(function( event ) {
	
	$('#pleaseWaitDialog').modal();
	$('.carousel').hide();
	$('.carousel').carousel('pause')
	$('#share').hide();
	
	var myNode = document.getElementById("indicators");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}
	
	var myNode = document.getElementById("gallery");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}
	
	var myNode = document.getElementById("locations");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}
	
	var location = document.getElementById("location").value;
	getGeoCode(location);
	
	event.preventDefault();
});

clip.on( 'dataRequested', function (client, args) {
	client.setText( getShareUrl() );
	});

clip.on( 'complete', function ( client, args ) {
	$('#notification').modal('show');
	});

function getGeoCode (address) {
	
	var lat = 0;
	var lng = 0;
	
	var geocoderUrl = "https://maps.googleapis.com/maps/api/geocode/json?sensor=false&address=" + encodeURIComponent(address);
    	
    $.getJSON(geocoderUrl, function(data){
    	if (data.results.length == 0) {
    		$('#pleaseWaitDialog').modal('hide');
    		$('#noResults').modal('show');
    	} else if (data.results.length == 1) {
    		lat = data.results[0].geometry.location.lat;
    		lng = data.results[0].geometry.location.lng;
    	   	getPictures (lat, lng);
    	} else if (data.results.length > 0) {
    		$('#pleaseWaitDialog').modal('hide');
    		showModal(data);
    	}
    });
};

function showModal(data) {
	$.each(data.results, function(i,item){
		var selected = '';
		if (i==0) selected = 'selected';
		
		var value = item.geometry.location.lat + "|" + item.geometry.location.lng;
		var text = item.formatted_address;
		
		$("#locations").append('<option value=' + value + ' ' + selected + '>' + text + '</option>');
	});
	
	$('#locationOptions').modal('show');
}

function getPictures (lat, lng) {
	
	var date = document.getElementById("date").value;
	var time = document.getElementById("time").value;

	var offset = parseInt(document.getElementById("offset").value);

	var d = new Date(date.substr(0,4), date.substr(5,2)-1, date.substr(8,2), time.substr(0,2), time.substr(3,2), 0);
	
	var dateFrom = new Date(d);
	dateFrom.setHours(d.getHours()-offset);
	var dateTo = new Date(d);
	dateTo.setHours(d.getHours()+offset);
	
	var from = dateFrom.getTime()/1000;
	var to = dateTo.getTime()/1000;
	
	retrievFromInstagram (lat, lng, from, to);
}
	
function retrievFromInstagram (lat, lng, from, to) {
	
	var instagramUrl = "https://api.instagram.com/v1/media/search?lat=" + lat + 
			"&lng=" + lng + 
			"&access_token=558673112.801eb26.92d30178271a438cb4b647635707af93" + 
			"&min_timestamp=" + from + 
			"&max_timestamp=" + to +
			"&callback=?";
	
	console.log(instagramUrl);
	
    $.getJSON(instagramUrl, function(data){
    	$.each(data.data, function(i,item){

    		var caption = '';
    		try {
    			caption = item.caption.text;
    		} catch (e) {}
    		
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
    	
    	});
    	
    	if (data.data.length > 0) {
    		displayCarousel();
    		displayShareBtn();
    	} else {
    		$('#pleaseWaitDialog').modal('hide');
    		$('#noResults').modal('show');
    	}
    	
    });
};

function displayCarousel () {
	$('.carousel').unbind();
	$('.carousel').show();
	$('.carousel').carousel();
	$('.carousel').carousel('cycle')
	
	$('#pleaseWaitDialog').modal('hide');
}

function displayShareBtn () {
	$('#share').show();
}

function timestamp2date (timestamp) {
	var date = new Date(timestamp*1000);
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	return hours + ':' + minutes + ':' + seconds;
}

$( "#selectLocation" ).click(function() {
	$('#locationOptions').modal('hide');	
	var coord = $("#locations").val().split('|');
	$('#pleaseWaitDialog').modal('show');
	
	getPictures (coord[0], coord[1]);
});

function getShareUrl() {
	var pathname = window.location.host;
	var d = document.getElementById("date").value;
	var t = document.getElementById("time").value;
	var l = document.getElementById("location").value;
	var o = parseInt(document.getElementById("offset").value);
	var shareUrl = "http://" + pathname + "/?l=" + encodeURIComponent(l) + "&d=" + encodeURIComponent(d) + "&t=" + encodeURIComponent(t) + "&o=" + encodeURIComponent(o); 
	console.log(shareUrl);
	return shareUrl;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function checkParams() {
	var l = getParameterByName('l');
	var d = getParameterByName('d');
	var t = getParameterByName('t');
	var o = getParameterByName('o');
	
	if (l != "" && d != "" && t != "" && o != "") {
		document.getElementById("location").value = decodeURIComponent(l);
		document.getElementById("offset").value = decodeURIComponent(o);
		document.getElementById("date").value = decodeURIComponent(d);
		document.getElementById("time").value = decodeURIComponent(t);
		$('#form').submit();
	}
}

function getDateToday() {
	var date = new Date();
	var year = date.getFullYear(), month = (date.getMonth() + 1), day = date.getDate();
	if (month < 10) month = "0" + month;
	if (day < 10) day = "0" + day;

	return "" + year + "-" + month + "-" + day;
}

function getTimeToday() {
	var today = new Date();
    var h = today.getHours();
    if (h < 10) h = "0" + h;
	
	return "" + h + ":00";
}