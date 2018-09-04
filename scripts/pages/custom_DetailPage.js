define(['modules/jquery-mozu'], function($) {
    $(document).ready(function() {
		if($(window).width() <= 767){
			$("#product-details").removeClass("tab-pane fade").addClass("collapse");
			$("#ingredients").removeClass("tab-pane fade").addClass("collapse");
			$("#warnings").removeClass("tab-pane fade").addClass("collapse");
			$(".mz-prop-tab a").attr("data-toggle", "collapse");
		}
		else{
			$("#product-details").addClass("active in");
		}
    });

});