console.log('This is CSCR.js');

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){	
	console.log(msg);

	if(msg.HEAD == 'init_from_FB')
		FB_CrossSiteChatRoom_CR.receiveInitFrom_bf(msg.Data);
	if(msg.HEAD == 'new_msg_from_FB')
		FB_CrossSiteChatRoom_CR.receiveFrom_bg(msg.Data);
	if(msg.HEAD == 're_initialize'){
		// Remember to clear container first
		FB_CrossSiteChatRoom_CR.receiveInitFrom_bf(msg.Data);		
	}

	//if(msg.HEAD == 'new_msg_from_CR')
	//	FB_CrossSiteChatRoom_CR.sendTo_bg()
});

/*
@ Class for cross site chat room(CSCR)
*/
var FB_CrossSiteChatRoom_CR = {
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
	@ Send cross site new msg to background
	@ parameter: Data
				  |- {fID: fID, msg: msg}
	*/
	sendTo_bg: function(Data){
		console.log("send new msg");
		chrome.runtime.sendMessage({HEAD:'new_msg_from_CR', Data: Data});
	},
	/*
	@ Receive msg from background
	@ parameter: Data (initData)
				  |- {'fID':{'fName': name,
						'profilePhoto': src,
						'msg': [ {'speaker': [sentences, ...]}, ...] // speaker = me or you
						},		
						...
					}
	*/
	receiveFrom_bg: function(Data){
		console.log("=== Receive new msg ===");
		console.log(Data);
		CSCR_protoType.new_MsgIn(Data);
	},
	receiveInitFrom_bf: function(initData){
		
		CSCR_protoType.init_chatRoom(initData);
		console.log("Receive init data!!");
	}
};


/*
@Do not modify this class here => modify in CSCR_prototype.js
*/
var CSCR_protoType = {
	/*
	@ Initialize the CSCR
	@ parameters
		|-Data: {'fID':{'fName': name,
						'profilePhoto': src,
						'msg': [ {'speaker': [sentences, ...]}, ...] // speaker = me or you
						},		
					...
				}
	*/
	init_chatRoom: function(Data){
		// Clear the container
		$('#CSCR-container').remove();
		$('<div/>').attr({id: 'CSCR-container'}).appendTo('body');

		$.each(Data,function(fID,msgObj){
			console.log(fID);
			console.log(msgObj);
			// Create chat room
			CSCR_protoType.new_chatRoom(msgObj,fID);
			// Process msg sentence
			CSCR_protoType.process_msg_sentence(msgObj,fID);
			// Put scrollbar to buttom
			CSCR_protoType.put_scrollButtom(fID);

		});		
	},
	new_MsgIn: function(Data){
		$.each(Data,function(fID,msgObj){
			console.log(fID);
			console.log(msgObj);
			var $currentDOM = CSCR_protoType.find_currentDOM(fID);
			if($currentDOM != null){ // The Chat room has been created => append msg
				// Process msg sentence
				CSCR_protoType.process_msg_sentence(msgObj,fID);
				// Put scrollbar to buttom
				CSCR_protoType.put_scrollButtom(fID);
				// Heightline title bar
				CSCR_protoType.hightline_CR($currentDOM);				
			}
			else{ // Chat room not exist => create it!
				console.log('CR does not exist');
				CSCR_protoType.new_chatRoom(msgObj,fID);
				$currentDOM = CSCR_protoType.find_currentDOM(fID);
				// Process msg sentence
				CSCR_protoType.process_msg_sentence(msgObj,fID);
				// Put scrollbar to buttom
				CSCR_protoType.put_scrollButtom(fID);
				// Heightline title bar
				CSCR_protoType.hightline_CR($currentDOM);
			}
		});
	},
	new_MsgOut: function(){

	},
	/*
	@ Following is private method (do not use them directly!!)
	*/
	new_chatRoom: function(msgObj,fID){
		// Generate Chat Room	
		var $titleBar = $('<div/>').addClass('CSCR-title-bar-wrap').append('<div></div><div></div>');
			$titleBar.children().eq(0).addClass('CSCR-title-bar-text').html(msgObj.fName);
			$titleBar.children().eq(1).addClass('CSCR-close-btn').html('X');
		var $msgDialog = $('<div/>').addClass('CSCR-msg-dialog-wrap').append($('<table/>'));
			$msgDialog.children().eq(0).addClass('CSCR-msg-dialog-table');
		var $inputBar = $('<div/>').addClass('CSCR-input-wrap').append($('<input/>'));
			$inputBar.children().eq(0).addClass('CSCR-input-bar');
		var $appendDOM = $('<div/>').addClass('CSCR-outter-wrap').attr({'fID': fID});
			$appendDOM.append($titleBar).append($msgDialog).append($inputBar);
		// Append to container
		$appendDOM.appendTo('#CSCR-container');
		// Scoll bar init
		$msgDialog.slimscroll({start: 'bottom'});
		// Bind input event
		CSCR_protoType.bind_InputEvent($inputBar.children().eq(0),fID);
		// Bind close btn event
		CSCR_protoType.bind_closeEvent($appendDOM);
	},
	process_msg_sentence: function(msgObj,fID){
		for(i=0 ; i < msgObj.msg.length ; i++){
			var speaker = Object.keys(msgObj.msg[i])[0];
			if(speaker == 'me'){
				for(j=0 ; j < msgObj.msg[i][speaker].length ; j++)
					CSCR_protoType.appendMsg_me(msgObj.msg[i][speaker][j],fID);
			}
			if(speaker == 'you'){
				for(j=0 ; j < msgObj.msg[i][speaker].length ; j++)
					CSCR_protoType.appendMsg_you(msgObj.msg[i][speaker][j],msgObj.profilePhoto,fID);
			}
		}
	},
	// msg come from others
	appendMsg_you: function(msg,profilePhoto,fID){
		//Get reference
		var $currentCR = this.find_currentDOM(fID);
		var $targetTable = $currentCR.find('table.CSCR-msg-dialog-table');
		//Generate the html DOM
		var appendDOM = $('<tr/>').addClass('CSCR-sntce-wrap CSCR-sntce-you').append('<td></td><td></td>');
		var photoDOM = $('<td/>')
						.append('<div></div>').children().eq(0).addClass('CSCR-profile-photo')
						.append('<img></img>').children().eq(0).attr({src: profilePhoto});
		var sentenceDOM = $('<div/>').addClass('CSCR-sntce').html(msg).wrap('<td></td>');
		appendDOM.children('td').eq(0).append(photoDOM);
		appendDOM.children('td').eq(1).append(sentenceDOM);
		//Append the dynamic DOM
		$targetTable.append(appendDOM);
	},
	// msg come from 1.Facebook(or other cross site)  2.self type
	appendMsg_me: function(msg,fID){
		//Get reference
		var $currentCR = this.find_currentDOM(fID);
		var $targetTable = $currentCR.find('table.CSCR-msg-dialog-table');
		//Generate the html DOM
		var appendDOM = $('<tr/>').addClass('CSCR-sntce-wrap CSCR-sntce-me').append('<td></td><td></td>')
		var sentenceDOM = $('<div/>').addClass('CSCR-sntce').html(msg);
		$(appendDOM).children('td').eq(1).append(sentenceDOM);
		//Append the dynamic DOM
		$targetTable.append(appendDOM);				
	},
	put_scrollButtom: function(fID){
		var $currentCR = this.find_currentDOM(fID);
		var msg_dialogHeight = $currentCR.find('table.CSCR-msg-dialog-table').height();
		$currentCR.find('div.CSCR-msg-dialog-wrap').slimscroll({scrollTo: msg_dialogHeight});
	},
	/*
	@ return the current DOM (.CSCR-outter-wrap)
	*/
	find_currentDOM: function(fID){
		var $currentCR = null;
		$('.CSCR-outter-wrap').each(function(idx,el){
			if(fID == $(el).attr('fID')){
				$currentCR = $(el);
				return false;
			}
		});
		//Remember to add catch exception!
		return $currentCR;
	},
	bind_InputEvent: function($inputDOM,fID){
		$inputDOM.on('keydown.CSCR_Input',function(event){
	    	var $inputDOM = $(this);
	    	if(event.keyCode == 13){
	    		var inputSentence = $inputDOM.val();
	    		console.log(inputSentence);
	    		if( inputSentence != ''){
	    			//Append the msg via extract input bar
	    			CSCR_protoType.appendMsg_me(inputSentence,fID,false);
	    			//Clear the input bar
	    			$inputDOM.val('');
	    			//Put the scroll bar to buttom
	    			CSCR_protoType.put_scrollButtom(fID);
	    			//Send new msg to background
	    			var passingData = {'fID': fID, 'msg': inputSentence};
					FB_CrossSiteChatRoom_CR.sendTo_bg(passingData);
	    		}
	    	}
	    });
	},
	hightline_CR: function($currentDOM){
		var $titleBar = $currentDOM.find('div.CSCR-title-bar-wrap');
		// Repeat highlight the chat room
		var refreshIntervalId;
		if (!$titleBar.hasClass('highlight-ing')){// Prevent duplicate 'setInterval'
			refreshIntervalId = setInterval(function () {
				$titleBar.addClass('title-bar-hightlight highlight-ing').delay(500).queue(function(){
					$(this).removeClass('title-bar-hightlight').dequeue();
				});       
			}, 1000);
			$currentDOM.off('click.CSCR_removeHightlight');
			$currentDOM.on('click.CSCR_removeHightlight',function(){
				clearInterval(refreshIntervalId);
				$titleBar.removeClass('highlight-ing');
			})			
		}		
	},
	bind_closeEvent: function($CSCR_outter_wrap){
		var $closeBtn = $CSCR_outter_wrap.find('div.CSCR-close-btn');
		$closeBtn.on('click.closeCR',function(){
			$CSCR_outter_wrap.remove();
		});
	}
};
