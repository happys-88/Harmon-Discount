define([ 
	'modules/jquery-mozu',
	"hyprlive",
	'vendor/lozad.min'
], function ($, Hypr, lozad ) { 
	$(document).ready(function() {	
		var observer = lozad('.lozad', {
			rootMargin: '10px 0px',
			 threshold: 0.1
			// load: function (el) {
			// 	//el.src = el.dataset.src;
			// 	el.onload = function () {
			// 		el.classList.add('fade-in')
			// 	}
			// }
		});
		observer.observe();
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
		$('[data-target="#ml-nav"]').on('click', function (event) {
			$(".search-icon").removeClass("search-open");
			$(".mz-search-filed").hide();
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
		    $(".mz-mobile-tabs").find(".active").prev().addClass("active");
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