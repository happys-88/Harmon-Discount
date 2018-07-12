define([ 
	"modules/jquery-mozu"
], function( $ ) { 
	$(document).ready(function() { 
        $(".search-icon").click(function() {
        	$(".search-icon").toggleClass("search-open");
            $(".mz-search-filed").toggle();
        });
        
		$(".mz-mobile-tabs li").click(function() {
			$(this).toggleClass("open");
			$("ul").not($(this).next()).slideUp('medium');
		});	

  		$(".container-links ul:not(:first)").addClass("list");
	    var allPanels = $('.container-links .list');
	  	$('.container-links h4').click(function() {
	    	allPanels.slideUp();
	    	allPanels.prev().removeClass("open");
	    	$(this).addClass("open").next().slideDown();
	    	return false;
	  	});
	});
}); 