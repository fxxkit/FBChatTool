$(function(){
	console.log('This is FBDragger!!');

	// Initialize the opened chat room
	FBDragger.appendBtn();
	FBDragger.bindDragEvent();


	// Append btn & Bind Event when click side friend
	$('._42fz').on('click',function(){
		console.log('click side friends for chat room');
		var delayAppendBtn = _.bind(FBDragger.appendBtn, FBDragger);
        _.delay(delayAppendBtn,1500);
		
		var delayDragEvent = _.bind(FBDragger.bindDragEvent,FBDragger);
		_.delay(delayDragEvent,2000);			
	});

	// Append btn & Bind Event when click top friend
	$('.jewelContent').on('click',function(){
		console.log('click top friends for chat room');
		var delayAppendBtn = _.bind(FBDragger.appendBtn, FBDragger);
        _.delay(delayAppendBtn,1500);
		
		var delayDragEvent = _.bind(FBDragger.bindDragEvent,FBDragger);
		_.delay(delayDragEvent,2000);			
	});

});

var FBDragger = {
	preX_offset_: 0,

	appendBtn: function(){
		$('.fbNubFlyoutTitlebar').each(function(idx,el){
			var currentChatDOM = this;
			if(!$(currentChatDOM).prev().hasClass('FB-chat-drag-btn')){
				$(currentChatDOM).before("<span class='FB-chat-drag-btn glyphicon glyphicon-chevron-up btn btn-default btn-xs'></span>");
				
				// Reset the wrapper height to prevent push element
				var wrapperEl = $(currentChatDOM).parent().parent().parent();
				var currentChatDOM_height = $(wrapperEl).height();
				$(wrapperEl).css({'height': currentChatDOM_height + 16});
			}
		});
	},

	bindDragEvent: function(){
		$('.FB-chat-drag-btn').draggable({
			axis: "y",
			create: function(event, ui ){
				console.log('crate event triggered');
			},
			start: function(event, ui ){
				console.log('start dragging the btn!!!!');
				//console.log(ui.offset);
				preX_offset = ui.offset.top;
			},
			stop: function(event, ui ){
				console.log('stop dragging the btn!!!!');
				//console.log(ui.offset);
				var xDistance = ui.offset.top - preX_offset;
				//console.log('xDistince: ' + xDistance);

				var newHeight = 0;

				// Conversation div
				var resizeTarget = $(this).next().next().next();
				var resizeTarget_height = $(resizeTarget).height();
				var newHeight = resizeTarget_height - xDistance;
				$(resizeTarget).height(newHeight);
				
				// Outest wrapper
				var resizeTarget2 = $(this).parent().parent().parent();
				var resizeTarget_height2 = $(resizeTarget2).height();
				var newHeight = resizeTarget_height2 - xDistance;
				$(resizeTarget2).height(newHeight);

				//resetting the btn position
				$(this).css({'top': 0});
			},
			drag: function(event, ui ){
				console.log('dragging event triggered');
			},
		});
	}
}