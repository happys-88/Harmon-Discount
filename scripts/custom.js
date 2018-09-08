define([ 
	"modules/jquery-mozu",
	"hyprlive"
], function( $, Hypr ) { 
	$(document).ready(function() {
		GetURLParameter();
		
		$(".search-icon").click(function() {
        	$(".search-icon").toggleClass("search-open");
            $(".mz-search-filed").toggle();
        });
        
        $(document).on('click','.mz-mobile-tabs li', function(){
		    $(".mz-mobile-tabs").find(".active").prev().addClass("active");
		});


  		$(".container-links ul:not(:first)").addClass("list");
	   	var allPanels = $('.container-links .list');
		$('.container-links h4').click(function(e) {
			var target = $( e.target );
			if ( target.is( ".open" ) ) {
		    	allPanels.slideUp();
				allPanels.prev().removeClass("open");
		     	return;
		  	}
		  	else {
				allPanels.slideUp();
				allPanels.prev().removeClass("open");
				$(this).addClass("open").next().slideDown();
			}		
		});

	  	// Back To 
	  	function scrollToTop(){
        	$("body, html").animate({ 
	            scrollTop: 0
	        }, 600); 
        }
	  	$(window).scroll(function() {    
		    var scroll = $(window).scrollTop();
		    if (scroll >= 200) {
		    	$("#back-to-top").fadeIn();
		    } else{
		    	$("#back-to-top").fadeOut(); 
		    }
		});
		$("#back-to-top").click(function(){
	        scrollToTop(); 
	    });
	});

	function GetURLParameter()
	{
		var sParam = Hypr.getLabel('cjEventParam');
	    var sPageURL = window.location.search.substring(1);
	    var sURLVariables = sPageURL.split('&');
	    for (var i = 0; i < sURLVariables.length; i++)
	    {
	        var sParameterName = sURLVariables[i].split('=');
	        if (sParameterName[0] == sParam)
	        {
	        	createCookie("popupEnabled",sParameterName[1], 365);
	        	return sParameterName[1];
	        }
	    }
	}

	function createCookie(name,value,days) {
		var expires = "";
	    if (days) {
	        var date = new Date();
	        date.setTime(date.getTime()+(days*24*60*60*1000));
	        expires = "; expires="+date.toGMTString();
	    }
	    else expires = "";
	    document.cookie = name+"="+value+expires+"; path=/";
	}
}); 