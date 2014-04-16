$(function(){
	console.log('This is FBDragger!!');
	init(); // Initialize FB_ChatRoomReplay & FB_ChatRoomDragger class
	//CSCR_Init();
});

function init(){
	// Initialize the opened chat room
	console.log('===init FB dragger===');
	FB_ChatRoomDragger.appendBtn();
	FB_ChatRoomDragger.bindDragEvent();

	console.log('===init FB replay===');
	delay_ReplayComp(); // init FB_ChatRoomReplay when document ready

	console.log('===init FB_CrossSiteChatRoom');
	delay_CSCR_Comp();

	// Append btn & Bind Event when click side friend
	$('.fbChatSidebarBody').on('click',function(){
		console.log('click side friends for chat room');
		delayInit_Dragger(1500,2000);
		var delayBindEvent_Replay = _.bind(delay_ReplayComp);
	    _.delay(delayBindEvent_Replay,1500);		
	});

	// Append btn & Bind Event when click top friend
	$('.jewelContent').on('click',function(){
		console.log('click top friends for chat room');
		delayInit_Dragger(1500,2000);
		var delayBindEvent_Replay = _.bind(delay_ReplayComp);
	    _.delay(delayBindEvent_Replay,1500);			
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
				var delayBindEvent_Replay = _.bind(delay_ReplayComp);
	    		_.delay(delayBindEvent_Replay,1500);
			}
			unreadMsgCount = now_unreadMsgCount;			
		}
		//chrome.runtime.sendMessage("Echo Testing!!!!!!");
		FB_CrossSiteChatRoom.sendTo_bg();
	});	
}

function delayInit_Dragger(append_btn_delay, bind_event_delay){
	var delayAppendBtn = _.bind(FB_ChatRoomDragger.appendBtn, FB_ChatRoomDragger);
    _.delay(delayAppendBtn,append_btn_delay);
	
	var delayDragEvent = _.bind(FB_ChatRoomDragger.bindDragEvent,FB_ChatRoomDragger);
	_.delay(delayDragEvent,bind_event_delay);

}

function delay_ReplayComp(){
	$('.uiTextareaAutogrow').each(function(idx,DOMObj){
		// unbind the existing event
		$(DOMObj).off('keydown.chatRoomReplay');
		$(DOMObj).off('focus.chatRoomReplay');

		// Add event listener for keyboard
		$(DOMObj).on('keydown.chatRoomReplay',function(event){
			var $currentChatDOM = $(this);
			FB_ChatRoomReplay.$currentChatDOM = $currentChatDOM;
			if(event.keyCode == 13){
				FB_ChatRoomReplay.init(true);			
			}
			if(event.keyCode == 38 || event.keyCode == 40){
				FB_ChatRoomReplay.getWords(event.keyCode);
			}
		});
		$(DOMObj).on('focus.chatRoomReplay',function(){
			var $currentChatDOM = $(this);
			FB_ChatRoomReplay.$currentChatDOM = $currentChatDOM;
			FB_ChatRoomReplay.init(false);
		});
	});	
}

function delay_CSCR_Comp(){
	$('.uiTextareaAutogrow').each(function(idx,DOMObj){
		// undbind the existing event
		$(DOMObj).off('keydown.CSCR');
		// Add event listener for keyboard
		$(DOMObj).on('keydown.CSCR',function(event){
			if(event.keyCode == 13){
				console.log('==keydown.CSCR==: event trigger');
				var $currentChatDOM = $(this);			
				FB_CrossSiteChatRoom.sendTo_bg($currentChatDOM);
			}
		})
	});
}

/*
@ Class for draggable chat room
*/
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

/*
@ Class for replay sentence
*/
var FB_ChatRoomReplay = {
	myWords_: {}, // {'fID':[sentence... ],...}
	currentIdx_: {}, // {'fID': currentIdx,...}
	$prevChatDOM_: NaN,
	$currentChatDOM: NaN,
	getWords: function(keyCode){
		var fID = this.get_fID_();  // Get fID		
		// Update sentence index
		if(keyCode == 38){
			//console.log('=== up! ===');
			if(this.currentIdx_[fID]>0)
				this.currentIdx_[fID]--;
		}
		if(keyCode == 40){
			//console.log('=== down! ===');
			if(this.currentIdx_[fID] < this.myWords_[fID].length-1){
				this.currentIdx_[fID]++;
			}
			else if(this.currentIdx_[fID] == this.myWords_[fID].length-1){
				//console.log('End of conv');
				this.currentIdx_[fID]++;
				this.$currentChatDOM.val('');
				return
			}
		}
		var currentIdx = this.currentIdx_[fID]; // Get sentence index
		var appendWords = this.myWords_[fID][currentIdx]; // Get sentence words
		this.$currentChatDOM.val(appendWords); // Append words into conversation dialog		
	},
	init: function(resetIdx){
		console.log('=== init!! ===');
		var fID = this.get_fID_();  // Get fID
		this.myWords_[fID] = [];  // initialize the conversation array
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
						var text = $(el2).find('span.null').html(); //Extract sentence			
						text = text.split('</span>')[0]
								.replace('<span class="emoticon_text" aria-hidden="true">',''); // Extract emotion character
						words.push(text);
						if(words.length > 50) // keep the array length as 50
							words.shift();
					});
				}
			}
		});
		this.myWords_[fID] = words;
		// update index only when... 1.never set it yet  2. keyboard insert "Enter"
		if(typeof this.currentIdx_[fID] == 'undefined' || resetIdx == true)
			this.currentIdx_[fID] = words.length;
		
		//console.log(this.myWords_[fID]);
	},
	get_fID_: function(){
		// .fbNubFlyoutTitlebar -> li.uiMenuItem -> a.itemAnchor
		return this.$currentChatDOM.parent().parent()
					.prev().prev().prev()
					.find('li.uiMenuItem').eq(0).find('a.itemAnchor').attr('href').split('/messages/')[1];
	}
};

/*
@ Event listner from chrome (for cross site chat room)
*/
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
	console.log(msg);
	if(msg.HEAD == 'query_init_from_FB')
		FB_CrossSiteChatRoom.initTo_bg();
	if(msg.HEAD == 'new_msg_from_CR')
		FB_CrossSiteChatRoom.receiveFrom_bg(msg);
});

/*
@ Class for cross site chat room(CSCR)
*/
var FB_CrossSiteChatRoom = {
	/*
	Send msg
		- bind event on message change (new msg)
	Receive msg
		- bind event on 
	Append CSCR (via click btn)
		- remember to clear the old chat room first
		- pass the css to the CSCR
	*/
	/*
	@ initData & newMsgData : 
				{'fID':{'fName': name,
						'profilePhoto': src,
						'msg': [ {'speaker': [sentences, ...]}, ...] // speaker = me or you
						},		
					...
				}
	*/
	initData: {},
	newMsgData: {},	
	/*
	@ Initialize => send all the opened chat room msg to background
	*/
	initTo_bg: function(){
		this.init_msg_parser_();
		chrome.runtime.sendMessage({HEAD:'init_from_FB', Data:this.initData});
	},
	/*
	@ Send new message to background
	@ newMsgData : {'fID':[...]}
	*/
	sendTo_bg: function($currentChatDOM){
		this.new_msg_parser_($currentChatDOM);
		console.log(this.newMsgData);
		chrome.runtime.sendMessage({HEAD:'new_msg_from_FB',Data: this.newMsgData},function(response){
			//
			console.log('send new msg to background success!');
			// Initialize the variable after sending success!
			FB_CrossSiteChatRoom.newMsgData = {};
		});

	},
	receiveFrom_bg: function(msg){
		console.log('receive new messge from background(CR)');
		console.log(msg);
	},
	/*
	@ Retrive all opened chat room msg & update the initData
	@ Remember to do
		- Photo msg
		- Emotion (character) msg
		- profile photo picture
	*/
	init_msg_parser_: function(){
		var initDataTmp = {};
		$('.fbDockChatTabFlyout').each(function(idx,eachChatRoom){
			
			//@ Get fID
			var fID = FB_CrossSiteChatRoom.get_fID_($(eachChatRoom));
			initDataTmp[fID] = {};
			//console.log(fID);

			//@ Get fName
			var fName = FB_CrossSiteChatRoom.get_fName_($(eachChatRoom));
			initDataTmp[fID]['fName'] = fName;
			//console.log(fName);

			//@ Get profilePhoto
			var profilePhoto = FB_CrossSiteChatRoom.get_profilePhoto_($(eachChatRoom));
			initDataTmp[fID]['profilePhoto'] = profilePhoto;	
			//console.log(profilePhoto);

			/*
			@ Get conversation message
			@ div.fbChatConvItem(n)
				|- div._50ke(1)
				|	|- a.profileLink => $.attr('href') --> who speak
				|- div.messages(1)
					|- div.direction_ltr(n)
						|- span.null => $.html() -->  message	
			*/
			initDataTmp[fID]['msg'] = [];
			$(eachChatRoom).find('div.fbChatConvItem').each(function(i,o){
				

				var whoSpeak = $(o).find('div._50ke').find('a.profileLink').attr('href');
				if(whoSpeak == '#')
					whoSpeak = 'me';
				else
					whoSpeak = 'you';
				//console.log('whoSpeak: ' + whoSpeak);
				var sentenceArry = [];
				$(o).find('div.messages').find('div.direction_ltr').each(function(i2,o2){
					// Mark the sentence as sended => for easy to extract new msg
					if(!$(this).hasClass('CSCR_sended'))
						$(this).addClass('CSCR_sended');

					// Extract sentence
					var sentence = $(o2).find('span.null').html();
					sentenceArry.push(sentence);
					//console.log(sentence);
				})
				var msgEl = {};
				msgEl[whoSpeak] = sentenceArry;
				initDataTmp[fID]['msg'].push(msgEl);
			});
		});
		// Update the initData
		this.initData = initDataTmp;
		console.log(this.initData);
	},
	new_msg_parser_: function($currentChatDOM){
		var $fbDockChatTabFlyout_cur = $currentChatDOM.parent().parent().parent().parent().parent();
		
		//@ Get fID
		var fID = this.get_fID_($fbDockChatTabFlyout_cur);
		console.log(fID);
		this.newMsgData[fID] = {};

		var fName = this.get_fName_($fbDockChatTabFlyout_cur);
		console.log(fName);
		this.newMsgData[fID]['fName'] = fName;

		var profilePhoto = this.get_profilePhoto_($fbDockChatTabFlyout_cur);
		console.log(profilePhoto);
		this.newMsgData[fID]['profilePhoto'] = profilePhoto;

		//@ Get new msg
		this.newMsgData[fID]['msg'] = []; // Initialize
		this.delay_extractNewMsg_($fbDockChatTabFlyout_cur,fID);
		//var delayExtractMsg = _.bind(FB_CrossSiteChatRoom.delay_extractNewMsg_, FB_CrossSiteChatRoom);
    	//_.delay(delayExtractMsg,1500,$fbDockChatTabFlyout_cur,fID);
			
	},
	/*
	@ Get fID (.fbNubFlyoutTitlebar -> li.uiMenuItem -> a.itemAnchor)
	@ .fbNubFlyoutTitlebar(1)
		|- li.uiMenuItem (n) => $.eq(0)
			|- a.itemAnchor(1) => $.('href') --> The FB ID
	*/	
	get_fID_: function($fbDockChatTabFlyout){
		return $fbDockChatTabFlyout.find('.fbNubFlyoutTitlebar').find('li.uiMenuItem').eq(0).find('a.itemAnchor').attr('href').split('/messages/')[1];
	},
	//@ Get fName
	get_fName_: function($fbDockChatTabFlyout){
		return $fbDockChatTabFlyout.find('.titlebarText').html(); 
	},
	//@ Get profile photo (continue get until the url is not '/images/spacer.gif')
	get_profilePhoto_: function($fbDockChatTabFlyout){
		var profilePhoto = '/images/spacer.gif'; // default hidden profile img on FB
		var breakFlag = false;
		var searchIdx = 0;
		$fbDockChatTabFlyout.find('.profilePhoto').each(function(i,o){
			if($(o).attr('src') != '/images/spacer.gif'){
				profilePhoto = $(o).attr('src')
				return false; // break the each
			}
		});
		return profilePhoto;
	},
	delay_extractNewMsg_: function($fbDockChatTabFlyout,fID){
		$fbDockChatTabFlyout.find('div.fbChatConvItem').each(function(i,o){
				var whoSpeak = $(o).find('div._50ke').find('a.profileLink').attr('href');
				if(whoSpeak == '#')
					whoSpeak = 'me';
				else
					whoSpeak = 'you';
				//console.log('whoSpeak: ' + whoSpeak);
				var sentenceArry = [];
				$(o).find('div.messages').find('div.direction_ltr').each(function(i2,o2){
					// Mark the sentence as sended => for easy to extract new msg
					if(!$(this).hasClass('CSCR_sended')){						
						var sentence = $(o2).find('span.null').html();
						sentenceArry.push(sentence);
						//console.log(sentence);
						$(this).addClass('CSCR_sended');
					}
				});
				if(sentenceArry.length != 0){
					var msgEl = {};
					msgEl[whoSpeak] = sentenceArry;
					FB_CrossSiteChatRoom.newMsgData[fID]['msg'].push(msgEl);
				}								
				//$(this).addClass('CSCR_sended');					
					
		});
	}

};