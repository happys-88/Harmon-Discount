define([ 
	"modules/jquery-mozu"
], function( $ ) { 
	$(document).ready(function() { 
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
}); 