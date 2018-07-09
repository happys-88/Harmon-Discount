define([ 
	"modules/jquery-mozu"
], function( $ ) { 
	$(document).ready(function() { 
        $(".search-icon").click(function() {
        	$(".search-icon").toggleClass("search-open");
            $(".mz-search-filed").toggle();
        });
		$(".container-links h4").click(function() {
			$(this).toggleClass("open");
			$(this).next('ul').slideToggle();
		});
	});
}); 