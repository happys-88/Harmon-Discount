define([ 
	'modules/jquery-mozu',
	"hyprlive"
], function ($, Hypr) { 
	$(document).ready(function() {	
		//dropzone empty
		$('.col-xs-4 .mz-sitenav-dropzone .mz-drop-zone').each(function (index) {
			if ($(this).is(':empty')) {
				$(this).parent().parent().prev().removeClass("col-xs-8").addClass("col-xs-12");
				$(this).parent().parent().remove();
			}
		});
		//site-nav close
		$(document).on('click', function (event) { 
			if ($('nav[id="ml-nav"]').hasClass("in")) {
				if ($(event.target).parents("div").hasClass("panel-group")) {
				} else {
					$('nav[id="ml-nav"]').removeClass("in");
					$('button[data-target="#ml-nav"]').addClass("collapsed").attr("aria-expanded", false);
				}
			}
		
		});
		$('#mz-logged-in-notice').on('click', function () {
			$('nav[id="ml-nav"]').removeClass("in");
			$('button[data-target="#ml-nav"]').addClass("collapsed").attr("aria-expanded", false);
			if ($(".mz-hamburger-icon.mz-search-icon .search-icon").hasClass("search-open")){
				$(".mz-search-filed").hide();
				$(".mz-hamburger-icon.mz-search-icon .search-icon").removeClass("search-open");

			}
		});
		$('[data-target="#ml-nav"]').on('click', function (event) {
			if ($(".mz-hamburger-icon.mz-search-icon .search-icon").hasClass("search-open")) {
				$(".mz-search-filed").hide();
				$(".mz-hamburger-icon.mz-search-icon .search-icon").removeClass("search-open");
			}
		});
		//brand
		$(document).on('click', '.brand-letter a', function () { 
			var id = $(this).attr("name");
			var position = $(id + " .brand-letter").offset().top;
			$('body,html').animate({
				scrollTop: position
			}, 500);
		}); 
		$(" .mz-productimages .mz-productimages-thumbs #productpager-Carousel li img").on( "error",function() {
             $( this ).parentsUntil( "li" ).parent().remove();
          });
		GetURLParameter();
		
		showPopUp();
		selectUrl();
        function showPopUp() {
            var cookieName = Hypr.getLabel('signUpCookie');
            if(!readCookie(cookieName)) {
               // createCookie(cookieName, '1', 365);                
                $('#newsletterPopup').modal('show');
            }
        }

        function readCookie(name) {
              var nameEQ = name + "=";
              var ca = document.cookie.split(';');
              for(var i=0;i < ca.length;i++) {
                  var c = ca[i];
                  while (c.charAt(0)==' ') c = c.substring(1,c.length);
                  if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
              }
              return null;
        }
		
		$(".search-icon").click(function() {
        	$(".search-icon").toggleClass("search-open");
            $(".mz-search-filed").toggle();
        });
        
        $(document).on('click','.mz-mobile-tabs li', function(){
			$(this).addClass("active");
		    $(this).find(".active").prev().addClass("active");
		});


  		$(".container-links ul:not(:first)").addClass("list");
		   var allPanels = $('.container-links .list');
		 var windowWidth = $(window).width();
		 if(windowWidth <= 767){ 
				$(".container-links").addClass("mobile");
			}
		$(window).scroll(function() {
		   windowWidth = $(window).width();
			if(windowWidth <= 767){ 
				if(!$(".container-links").hasClass("mobile")){
				 $(".container-links").addClass("mobile");
				}
			  }else{
				  if($(".container-links").hasClass("mobile")){
				 $(".container-links").removeClass("mobile");
				}
			  }
			});
		$(document).on('click','.mobile h4', function(e){ 
			var target = $(e.target);
			if (target.is(".open")) {
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
	function selectUrl() {
		var hash = window.location.pathname;
		var href = "a[name~=" + "'" + hash + "'" + "]";
		$(href).parent(".mz-scrollnav-item").addClass("active");
	}

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