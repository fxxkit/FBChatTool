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
	    		CSCR_protoType.appendMsg_you(inputSentence,'./img/test.jpg',fID,true);
	    		//Put the scroll bar to buttom
    			CSCR_protoType.put_scrollButtom(fID);
    		}
    	}
    });

	//Testing area
	$('#newCR_testing').on('click',function(event){
		CSCR_protoType.init_chatRoom(testData.Data);
	})

	console.log(testData);

});

var CSCR_protoType = {
	/*
	@ Initialize the CSCR
	@ parameters
		|-msgObj: {'fID':{'fName': name,
						'profilePhoto': src,
						'msg': [ {'speaker': [sentences, ...]}, ...] // speaker = me or you
						},		
					...
				}
	*/
	init_chatRoom: function(Data){
		/*@ Prototype
		<div class="CSCR-outter-wrap" fID="00001">
			<div class="CSCR-title-bar-wrap">
				<div class="CSCR-title-bar-text">Jordan Hsu</div>
				<div class="CSCR-close-btn">X</div>
			</div>
			<div class="CSCR-msg-dialog-wrap">
				<table class="CSCR-msg-dialog-table" >
					
				</table>		
			</div>	
			<div class="CSCR-input-wrap">
				<input class="CSCR-input-bar"></input>
			</div>
		</div>	*/
		// Clear the container
		$('#CSCR-container').remove();
		$('<div/>').attr({id: 'CSCR-container'}).appendTo('body');

		$.each(Data,function(fID,msgObj){
			console.log(fID);
			console.log(msgObj);
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
			// Process msg sentence
			for(i=0 ; i < msgObj.msg.length ; i++){
				var speaker = Object.keys(msgObj.msg[i])[0];
				if(speaker == 'me'){
					for(j=0 ; j < msgObj.msg[i][speaker].length ; j++)
						CSCR_protoType.appendMsg_me(msgObj.msg[i][speaker][j],fID);
				}
				if(speaker == 'you'){
					for(j=0 ; j < msgObj.msg[i][speaker].length ; j++)
						CSCR_protoType.appendMsg_you(msgObj.msg[i][speaker][j],msgObj.profilePhoto,fID,false);
				}
			}
			// Scoll bar init
			$msgDialog.slimscroll({start: 'bottom'});
			// Bind input event
			CSCR_protoType.bind_InputEvent($inputBar.children().eq(0),fID);
			// Bind hightline event when new msg in
			//CSCR_protoType.bind_HightlightEvent($msgDialog,$titleBar,$inputBar.children().eq(0));
			// Bind close btn event
			CSCR_protoType.bind_closeEvent($appendDOM);
		});		
	},
	new_chatRoom: function(msgObj,profilePhoto,fID,fName){

	},
	// msg come from others
	appendMsg_you: function(msg,profilePhoto,fID,heightline){
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
		// Heightline the chat room
		if(heightline == true)
			CSCR_protoType.hightline_CR($currentCR);
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
		var $currentCR;
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
	    			CSCR_protoType.appendMsg_me(inputSentence,fID);
	    			//Clear the input bar
	    			$inputDOM.val('');
	    			//Put the scroll bar to buttom
	    			CSCR_protoType.put_scrollButtom(fID);
	    		}
	    	}
	    });
	},
	hightline_CR: function($currentDOM){
		//var refreshIntervalId;

		var $titleBar = $currentDOM.find('div.CSCR-title-bar-wrap');
		var refreshIntervalId = setInterval(function () {
				$titleBar.addClass('title-bar-hightlight').delay(500).queue(function(){
					$(this).removeClass('title-bar-hightlight').dequeue();
				});       
			}, 1000);

		$currentDOM.off('click.CSCR_removeHightlight');
		$currentDOM.on('click.CSCR_removeHightlight',function(){
			clearInterval(refreshIntervalId);
			//$titleBar.removeClass('title-bar-hightlight');
		})
		/*
		$msgDialog.on('DOMNodeInserted.CSCR_newMsg',function(){
			refreshIntervalId = setInterval(function () {
				$titleBar.addClass('title-bar-hightlight').delay(500).queue(function(){
					$(this).removeClass('title-bar-hightlight').dequeue();
				});       
			}, 1000);			
		});
		$msgDialog.on('click.CSCR_removeHightlight',function(){
			clearInterval(refreshIntervalId);
			//$titleBar.removeClass('title-bar-hightlight');
		});
		$titleBar.on('click.CSCR_removeHightlight',function(){
			clearInterval(refreshIntervalId);
			//$titleBar.removeClass('title-bar-hightlight');
		});
		$inputDOM.on('click.CSCR_removeHightlight',function(){
			clearInterval(refreshIntervalId);
			//$titleBar.removeClass('title-bar-hightlight');
		})*/
	},
	bind_closeEvent: function($CSCR_outter_wrap){
		var $closeBtn = $CSCR_outter_wrap.find('div.CSCR-close-btn');
		$closeBtn.on('click.closeCR',function(){
			$CSCR_outter_wrap.remove();
		});
	}
}

function test(){

}

var testData = {HEAD:"init_from_FB",Data:{100000297530259:{"fName":"Maxis Kao","profilePhoto":"https://fbcdn-profile-a.akamaihd.net/hprofile-ak-prn2/t1.0-1/p32x32/1962751_760397100646867_457262957_t.jpg","msg":[{"me":["ㄏㄏ","try it"]},{"you":["wow"]},{"you":["頗屌"]},{"you":["資工宅最愛"]},{"me":["hey","你的peeptube有自動更新嗎？","現在版本號是1.0.2"]},{"you":["有誒"]},{"you":["Verbal Advantage"]}]},100004561781225:{"fName":"Jorddan Chen","profilePhoto":"https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/t1.0-1/c5.5.65.65/s32x32/560576_104821203013272_957125869_t.jpg","msg":[{"me":["sdf","23"]},{"me":["123","1234","hey you","he"]},{"you":["lkjhlkjh"]},{"me":["adfbadfbadfbadfbadfbadfbadfbadfbadfbadfbadfbadfbadfbadfb"]},{"me":["wbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbw"]},{"you":["wrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrgbwwbwrg"]}]}}} 