$(function(){
	console.log('This is FBDragger!!');

	// Initialize the opened chat room
	FB_ChatRoomDragger.appendBtn();
	FB_ChatRoomDragger.bindDragEvent();

	// Append btn & Bind Event when click side friend
	$('.fbChatSidebarBody').on('click',function(){
		console.log('click side friends for chat room');
		delayInit_Dragger(1500,2000);
	});

	// Append btn & Bind Event when click top friend
	$('.jewelContent').on('click',function(){
		console.log('click top friends for chat room');
		delayInit_Dragger(1500,2000);			
	});

	// Listen the msg from friends
	var unreadMsgCount = parseInt($('#mercurymessagesCountValue').html());
	$('#mercurymessagesCountValue').on('DOMSubtreeModified',function(){
		var now_unreadMsgCount = parseInt($(this).html());
		// Ignore trigger by class change
		if(now_unreadMsgCount >= 0){
			if( now_unreadMsgCount != unreadMsgCount){
				console.log('add btn (trigger by msg from friends)');
				delayInit_Dragger(1500,2000);
			}
			unreadMsgCount = now_unreadMsgCount;			
		}
	});
	// Initialize replay class
	init_Replay();
});

function delayInit_Dragger(append_btn_delay, bind_event_delay){
	var delayAppendBtn = _.bind(FB_ChatRoomDragger.appendBtn, FB_ChatRoomDragger);
    _.delay(delayAppendBtn,append_btn_delay);
	
	var delayDragEvent = _.bind(FB_ChatRoomDragger.bindDragEvent,FB_ChatRoomDragger);
	_.delay(delayDragEvent,bind_event_delay);

}

function init_Replay(){
	// Listen keyboard arrow event
	$('.uiTextareaAutogrow').on('keydown',function(event){
		var $currentChatDOM = $(this);

		FB_ChatRoomReplay.$currentChatDOM = $currentChatDOM;
		if(event.keyCode == 13){
			//FB_ChatRoomReplay.newline();
			FB_ChatRoomReplay.init(true);			
		}
		if(event.keyCode == 38 || event.keyCode == 40){
			FB_ChatRoomReplay.getWords(event.keyCode);
		}
	});
	$('.uiTextareaAutogrow').on('focus',function(){
		var $currentChatDOM = $(this);
		FB_ChatRoomReplay.$currentChatDOM = $currentChatDOM;
		FB_ChatRoomReplay.init(false);
	});
}

var FB_ChatRoomDragger = {
	preX_offset_: 0,
	appendBtn: function(){
		var oFBCRD = this;
		$('.fbNubFlyoutTitlebar').each(function(idx,el){
			var currentChatDOM = this;
			// Prevent duplicated button append
			if(!$(currentChatDOM).prev().prev().hasClass('FB-chat-drag-btn')){
				$(currentChatDOM).before("<span class='FB-chat-drag-btn glyphicon glyphicon-chevron-up btn btn-default btn-xs'></span>");
				
				// Reset the wrapper height to prevent push element down
				var wrapperEl = $(currentChatDOM).parent().parent().parent();
				var currentChatDOM_height = $(wrapperEl).height();
				$(wrapperEl).css({'height': currentChatDOM_height + 16});

				// Add fake border
				var fakeBorder = $('<div/>').addClass('fb-chat-fake-border');
				$(currentChatDOM).before(fakeBorder);
			}

			//Get conversation id & Set previous height
			try{
				var cID = $(currentChatDOM).find('li.uiMenuItem').eq(0).find('a.itemAnchor').attr('href').split('/messages/')[1];
				//console.log(cID);
				chrome.storage.local.get(function(obj){
					var data = obj[cID];

					// Outest wrapper (.fbNubFlyout .fbDockChatTabFlyout)
					var resizeTarget2 = $(currentChatDOM).parent().parent().parent();
					var maxHeight = parseInt($(resizeTarget2).css('max-height').split('px')[0]);
				
					// Conversation div (.fbNubFlyoutBody)
					var resizeTarget = $(currentChatDOM).next().next();

					// Setting initial height
					if(data.newHeight2 > maxHeight){
						$(resizeTarget2).height(maxHeight); // new wrapper height (constrainted)
						var innerHeight = data.newHeight - ( data.newHeight2 - maxHeight); // compute the conversation body height
						$(resizeTarget).height(innerHeight); // new conversation body height (constrainted)
					}
					else{
						$(resizeTarget2).height(data.newHeight2); // new wrapper height
						$(resizeTarget).height(data.newHeight); // new conversation body height
					}
				})			
			}
			catch(err){
				//console.log(err);
			}
		});
	},

	bindDragEvent: function(){
		$('.FB-chat-drag-btn').draggable({
			axis: "y",
			create: function(event, ui ){
				console.log('create event triggered');
			},
			start: function(event, ui ){
				console.log('start dragging the btn!!!!');
				//Get previous x-offset
				preX_offset = ui.offset.top;
				// Show fake border
				$(this).next().css({'display':'block'});
			},
			stop: function(event, ui ){
				console.log('stop dragging the btn!!!!');
				var xDistance = ui.offset.top - preX_offset;
				var newHeight = 0;

				// Outest wrapper (.fbNubFlyout .fbDockChatTabFlyout)
				var resizeTarget2 = $(this).parent().parent().parent();
				var resizeTarget_height2 = $(resizeTarget2).height();
				var newHeight2 = resizeTarget_height2 - xDistance;
				var maxHeight = parseInt($(resizeTarget2).css('max-height').split('px')[0]);

				// Conversation div (.fbNubFlyoutBody)
				var resizeTarget = $(this).next().next().next().next();
				var resizeTarget_height = $(resizeTarget).height();
				var newHeight = resizeTarget_height - xDistance;

				// Setting the new height
				if(newHeight2 > maxHeight){
					$(resizeTarget2).height(maxHeight); // new wrapper height (constrainted)
					var innerHeight = newHeight - ( newHeight2 - maxHeight); // compute the conversation body height
					$(resizeTarget).height(innerHeight); // new conversation body height (constrainted)
				}
				else{
					$(resizeTarget2).height(newHeight2); // new wrapper height
					$(resizeTarget).height(newHeight); // new conversation body height
				}				
 	
				//Store the value to local storage
				var cID = $(this).next().next().find('li.uiMenuItem').eq(0).find('a.itemAnchor').attr('href').split('/messages/')[1]; //Get conversation ID
				var storeObj = {};
				storeObj[cID] = {'newHeight2': newHeight2, 'newHeight': newHeight};
				//console.log(storeObj);				
				chrome.storage.local.set(storeObj, function(){
					console.log('Store the new height: '+ cID);
				});

				//resetting the btn position
				$(this).css({'top': 0});
				//resetting fake border position
				$(this).next().css({'top': 16});
				// Hide fake border
				$(this).next().css({'display':'none'});				
			},
			drag: function(event, ui ){
				console.log('dragging event triggered');
				var fakeBorder = $(this).next();
				$(fakeBorder).css({'top': ui.position.top + 16});
			},
		});
	}
};

var FB_ChatRoomReplay = {
	myWords_: {}, // {'fName':[sentence... ],...}
	currentIdx_: {}, // {'fName': currentIdx,...}
	$prevChatDOM_: NaN,
	$currentChatDOM: NaN,
	getWords: function(keyCode){
		var fName = this.get_fName_();  // Get fName		
		// Update sentence index
		if(keyCode == 38){
			//console.log('=== up! ===');
			if(this.currentIdx_[fName]>0)
				this.currentIdx_[fName]--;
		}
		if(keyCode == 40){
			//console.log('=== down! ===');
			if(this.currentIdx_[fName] < this.myWords_[fName].length-1){
				this.currentIdx_[fName]++;
			}
			else if(this.currentIdx_[fName] == this.myWords_[fName].length-1){
				//console.log('End of conv');
				this.currentIdx_[fName]++;
				this.$currentChatDOM.val('');
				return
			}
		}
		var currentIdx = this.currentIdx_[fName]; // Get sentence index
		var appendWords = this.myWords_[fName][currentIdx]; // Get sentence words
		this.$currentChatDOM.val(appendWords); // Append words into conversation dialog		
	},
	init: function(resetIdx){
		console.log('=== init!! ===');
		var fName = this.get_fName_();  // Get fName
		this.myWords_[fName] = [];  // initialize the conversation array
		// get all DOM in ".conversation"
		var $conDOM =  this.$currentChatDOM.parent().parent().prev().find('div.conversation').children();
		// retrive conversation text
		var words = [];
		$conDOM.each(function(idx,el){
			var $curConv = $(el);
			if($curConv.hasClass('fbChatConvItem')){ // is conversation item or not
				// judge self-sentences => '#' is the conversation speak by self
				var whoSpeak = $curConv.find('div._50ke').find('a.profileLink').attr('href');
				if (whoSpeak == '#'){
					//Get conversation words
					$curConv.find('div.messages').children().each(function(idx2,el2){
						var text = $(el2).find('span.null').html();
						text = text.split('</span>')[0].replace('<span class="emoticon_text" aria-hidden="true">','');
						words.push(text);
					});
				}
			}
		});
		this.myWords_[fName] = words;
		// update index only when... 1.never set it yet  2. keyboard insert "Enter"
		if(typeof this.currentIdx_[fName] == 'undefined' || resetIdx == true)
			this.currentIdx_[fName] = words.length;
		
		console.log(this.myWords_[fName]);
	},
	newline: function(){

	},
	get_fName_: function(){
		return this.$currentChatDOM.parent().parent()
					.prev().prev().prev()
					.find('a.titlebarText').attr('href').split('facebook.com/')[1];
	}
};
