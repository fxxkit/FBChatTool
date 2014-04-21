$(function() {
    // init scroll bar
	$('.CSCR-msg-dialog-wrap').slimscroll({start: 'bottom'});
 	

    // Add sentence (me)
    $('.CSCR-input-bar').on('keydown.CSCR_Input',function(event){
    	var $inputDOM = $(this);
    	if(event.keyCode == 13){
    		var inputSentence = $inputDOM.val();
    		console.log(inputSentence);
    		if( inputSentence != ''){
    			var fID = $inputDOM.parent().parent().attr('fID');
    			//Append the msg via extract input bar
    			CSCR_protoType.appendMsg_me(inputSentence,fID);
    			//Clear the input bar
    			$inputDOM.val('');
    			//Put the scroll bar to buttom
    			CSCR_protoType.put_scrollButtom(fID);

    		}
    	}
    });
    // Add sentence (you) == Testing msg from FB
    $('.CSCR-testing-input-you').on('keydown.CSCR_Input',function(event){
    	// Get sentence from testing input bar
    	var inputSentence = $(this).val();
    	if(event.keyCode == 13){
    		if(inputSentence != ''){
    			var fID = $('#CSCR-testing-fID').val(); 
	    		CSCR_protoType.appendMsg_you(inputSentence,'./img/test.jpg',fID);
	    		//Put the scroll bar to buttom
    			CSCR_protoType.put_scrollButtom(fID);
    		}
    	}
    });

	//Testing area
	$('#newCR_testing').on('click',function(event){
		CSCR_protoType.init_chatRoom(testData.Data);
	});

	console.log(testData);
	$('#newMsg_testing').on('click',function(event){
		CSCR_protoType.new_MsgIn(singleMsg_test);
	});

	$('body').on('click',function(){
		var enterEvent = $.Event("keydown");
		enterEvent.which = 13;
		enterEvent.keyCode = 13;
		$('.CSCR-input-bar').trigger(enterEvent);
	})	

});

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
				var speaker = CSCR_protoType.process_msg_sentence(msgObj,fID);
				// Put scrollbar to buttom
				CSCR_protoType.put_scrollButtom(fID);
				// Heightline title bar
				console.log(speaker);
				if (speaker == 'you'){
					CSCR_protoType.hightline_CR($currentDOM);				
				}
			}
			else{ // Chat room not exist => create it!
				console.log('CR does not exist');
				CSCR_protoType.new_chatRoom(msgObj,fID);
				$currentDOM = CSCR_protoType.find_currentDOM(fID);
				// Process msg sentence
				var speaker = CSCR_protoType.process_msg_sentence(msgObj,fID);
				// Put scrollbar to buttom
				CSCR_protoType.put_scrollButtom(fID);
				// Heightline title bar
				if (speaker == 'you'){
					CSCR_protoType.hightline_CR($currentDOM);
				}
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
		// Bind shrink event
		CSCR_protoType.bind_shrinkEvent($titleBar);
	},
	process_msg_sentence: function(msgObj,fID){
		for(i=0 ; i < msgObj.msg.length ; i++){
			var speaker = Object.keys(msgObj.msg[i])[0];
			if(speaker == 'me'){
				for(j=0 ; j < msgObj.msg[i][speaker].length ; j++)
					CSCR_protoType.appendMsg_me(msgObj.msg[i][speaker][j],fID);
				return 'me';
			}
			if(speaker == 'you'){
				for(j=0 ; j < msgObj.msg[i][speaker].length ; j++)
					CSCR_protoType.appendMsg_you(msgObj.msg[i][speaker][j],msgObj.profilePhoto,fID);
				return 'you';
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
	},
	bind_shrinkEvent: function($titleBar){
		$titleBar.on('click.shrinkCR',function(){
			console.log('shrink this CR');
			var $CR_wrap = $(this).parent();
			if ($CR_wrap.hasClass('CR-shrinked')){
				$CR_wrap.removeClass('CR-shrinked');
				$CR_wrap.addClass('CSCR-outter-wrap');
			}
			else{
				$CR_wrap.addClass('CR-shrinked');
				$CR_wrap.removeClass('CSCR-outter-wrap');
			}
		});
	}
};


// Only for testing !!
var testData = {HEAD:"init_from_FB",Data:{100000297530259:{"fName":"Maxis Kao","profilePhoto":"https://fbcdn-profile-a.akamaihd.net/hprofile-ak-prn2/t1.0-1/p32x32/1962751_760397100646867_457262957_t.jpg","msg":[{"me":["ㄏㄏ","try it"]},{"you":["wow"]},{"you":["頗屌"]},{"you":["資工宅最愛"]},{"me":["hey","你的peeptube有自動更新嗎？","現在版本號是1.0.2"]},{"you":["有誒"]},{"you":["Verbal Advantage"]}]},100004561781225:{"fName":"Jorddan Chen","profilePhoto":"https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/t1.0-1/c5.5.65.65/s32x32/560576_104821203013272_957125869_t.jpg","msg":[{"me":["sdf","23"]},{"me":["123","1234","hey you","he"]},{"you":["lkjhlkjh"]},{"me":["adfbadfbadfbadfbadfbadfbadfbadfbadfbadfbadfbadfbadfbadfb"]},{"me":["wbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbw"]},{"you":["wrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrg"]}]}}} 
var singleMsg_test = {100000297530259:{"fName":"Maxis Kao","profilePhoto":"https://fbcdn-profile-a.akamaihd.net/hprofile-ak-prn2/t1.0-1/p32x32/1962751_760397100646867_457262957_t.jpg","msg":[{"you":["ㄏㄏ","try it"]}]}};

