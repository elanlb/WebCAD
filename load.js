$("#navbar").load("navbar.html");
$(document).ready(function() {
	// get current URL path and assign 'active' class
	var pathname = window.location.pathname;
	$('#navbar a[href="'+pathname+'"]').addClass('active');
});