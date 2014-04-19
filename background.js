chrome.browserAction.onClicked.addListener(function(){
	console.log('XDDD');
	
	//chrome.tabs.executeScript(null, {file: "CSCR.js"});

	/* 
	@ Send msg from bg to FB => Get init messages (opened chat room)
	*/	
	chrome.tabs.getAllInWindow(null, function(tabs) {
		console.log(tabs);
		var hasFBTab = false
		//Broadcast msg => get init
		for(i = 0; i < tabs.length; i++){
			var url = typeof tabs[i].url !== 'undefined' ? tabs[i].url : '';
			console.log(url);
			//if(typeof tabs.url !=)
			if(url.indexOf('www.facebook.com') != -1){
				hasFBTab = true;
				chrome.tabs.sendMessage(tabs[i].id, {HEAD: 'query_init_from_FB'}, function(response) {
					console.log('sending msg to content scripts via chrome.tabs');
				});	
				break;
			}					
		}
		if(hasFBTab == false)
			alert('You have to open the Facebook first!!');			
	});
})

//var initData = null;
chrome.runtime.onMessage.addListener(
  function(msg, sender, sendResponse) {
    console.log('receive from FB content scripts');
    console.log(msg);
    if(msg.HEAD == 'init_from_FB'){
    	//initData = msg.Data;
		//Send the initial chat room to cross site
		FB_CrossSiteChatRoom_BG.initTo_CSCR(msg);    	
    }
    if(msg.HEAD == 'new_msg_from_FB'){
    	//Send new msg to cross site
    	FB_CrossSiteChatRoom_BG.sendTo_CSCR(msg);
    }
    if(msg.HEAD == 'new_msg_from_CR'){
    	FB_CrossSiteChatRoom_BG.sendTo_FB(msg);
    }
});

var FB_CrossSiteChatRoom_BG = {
	initializedTab: [],
	sendTo_FB: function(msg){
		console.log('send new msg to FB (from background & CS)');
		// Find the first FB tab
		chrome.tabs.getAllInWindow(null, function(tabs){
			var hasFBTab = false
			for(i = 0; i < tabs.length; i++){
				if(tabs[i].url.indexOf('www.facebook.com') != -1){
					//send the msg to the FB tab & break the loop					
					chrome.tabs.sendMessage(tabs[i].id,msg);
					hasFBTab = true;
					break
				}
			}
			if(hasFBTab == false)
				alert('You have to open the Facebook first!!');
		});
	},	
	initTo_CSCR: function(msg){
		//console.log(FB_CrossSiteChatRoom_BG.test);
		var thisTabID;
		chrome.tabs.query({active: true, currentWindow: true},function(tabs){
			thisTabID = tabs[0].id;
			console.log(thisTabID);
			//Prevent duplicated injection
			if(FB_CrossSiteChatRoom_BG.initializedTab.indexOf(thisTabID) == -1){
				// Inject jQuery
				chrome.tabs.executeScript(null, {file: "js/jquery-2.1.0.min.js"},function(){
					console.log('Inject jQuery');
					// Inject CSCR.js
					chrome.tabs.executeScript(null, {file: "CSCR.js"},function(){
						console.log('Inject CSCR.js');
						//Update initialized tab array
						FB_CrossSiteChatRoom_BG.initializedTab.push(thisTabID);
						console.log(FB_CrossSiteChatRoom_BG.initializedTab);						
						// Send init chat room msg
						chrome.tabs.sendMessage(thisTabID, msg, function(response) {
							// this callback would "not" execute if no response from cross site
							console.log('===[initTo_CSCR()]: receive response from cross site ===');
						});
					});
				});		
			}
			else{ // send message to re-initialize
				msg.HEAD = 're_initialize';
				chrome.tabs.sendMessage(thisTabID, msg, function(response) {
					// this callback would "not" execute if no response from cross site
					console.log('===[initTo_CSCR()]: receive response from cross site ===');
				});				
			}
		});
	},
	sendTo_CSCR: function(msg){
		// Broadcast new msg to all initialized cross site
		for(i=0;i < FB_CrossSiteChatRoom_BG.initializedTab.length; i++){
			chrome.tabs.sendMessage(FB_CrossSiteChatRoom_BG.initializedTab[i],msg);
		}
	},
	receiveFrom_FB: function(){
		// No use currently!
	},
	receiveFrom_CSCR: function(){
		// No use currently!
	}
}