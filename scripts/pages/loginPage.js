define([
    'modules/backbone-mozu',
    'modules/jquery-mozu',
    'hyprlive'
], function(Backbone, $, Hypr) {
	// $(document).ready(function() {
		var isAuth = require.mozuData('user').isAuthenticated;
		if(isAuth) {
			window.location = "/myaccount";
		}		
	// });
});