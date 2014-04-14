console.log('This is CSCR.js');

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){	
	console.log(msg);
	if(msg.HEAD == 'init_from_FB')
		FB_CrossSiteChatRoom_CR.receiveInitFrom_bf(msg.Data);
	if(msg.HEAD == 'new_msg_from_FB')
		FB_CrossSiteChatRoom_CR.receiveFrom_bg(msg.Data);
	//if(msg.HEAD == 'new_msg_from_CR')
	//	FB_CrossSiteChatRoom_CR.sendTo_bg()
});

$('body').on('click',function(){
	console.log('body clicked');
	FB_CrossSiteChatRoom_CR.sendTo_bg();
})

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
	sendTo_bg: function(){
		console.log("send new msg");
		chrome.runtime.sendMessage({HEAD:'new_msg_from_CR', Data:'==new_msg_from_CR==: Testing'});
	},
	receiveFrom_bg: function(Data){
		console.log("=== Receive new msg ===");
		console.log(Data);
	},
	receiveInitFrom_bf: function(initData){
		console.log("Receive init data!!");
	}
};