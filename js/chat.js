var base_url = 'http://localhost/kinlu_admin/';
var chat_ids = 1;
		var rep_id = "";


$(function(){
	var socket = io.connect( 'http://'+window.location.hostname+':3000' );

	//var chat_ids = 1;

	socket.on('users', function(data){
		$('.nameslist').text('');

		$.each(data,function(i,v){
			var arr = v.split('-');
			if(arr[1] == 'User') {

				//$('.names-list').append('<a href="http://localhost/chatroom/'+v+'"> <li>'+v+'</li></a>');
				$('.nameslist').append('<tr><td><a href="javascript:void(0)" onclick="let_chat(' + arr[0] + ')"> <i class="fa fa-arrow-circle-o-left fa-2x" style="color: #65af5a" aria-hidden="true"></i></a></td><td><i class="fa fa-user fa-2x"  style="color: #5ab4bc;" aria-hidden="true"></i><small class="label pull-right bg-red" id="unread' + arr[0] + '"></small></td><td>' + v + '</td><td>12KM</td><td>9/10</td></tr>');
			}
		});
	});

	socket.on('push message', function(response){
		//$('.messages').append('<li><div class="msg-lhs"><span class="username">'+response.name+'</span> : <span class="msg">'+response.msg+'</span></div><span data-livestamp="'+moment().unix()+'" class="msg-rhs"></span></li>');

		if(response.sendby == 'representative') {
			
			$('.messages'+response.userid).append('<div class="direct-chat-msg right"><div class="direct-chat-text"><span class="direct-chat-name pull-left" style="color: #5cafbd">' + response.name + '</span><span class="direct-chat-timestamp pull-right"><span data-livestamp="' + moment().unix() + '" class="msg-rhs"></span></span><br>' + response.msg + '</div></div>');
			$('#unread'+response.userid).text('');
		}
		else {
			$('.messages'+response.userid).append('<div class="direct-chat-msg"><div class="direct-chat-text"><span class="direct-chat-name pull-left" style="color: #f39c12">'+response.name+'</span><span class="direct-chat-timestamp pull-right"><span data-livestamp="' + moment().unix() + '" class="msg-rhs"></span></span><br>'+response.msg+'</div></div>');
			var unread = $('#unread'+response.userid).text();
			if(unread == ""){
				var total_unread = 0;
			}
			else{
				var  total_unread = parseInt(unread);
			}



			  total_unread += 1;
			$('#unread'+response.userid).text(total_unread);

		}


		$('.messages'+response.userid).animate({scrollTop: $( '.messages'+response.userid).prop("scrollHeight")}, 500);

		
	});




	$(document).on('keyup','.message-box',function(e){
		var $this = $(this);

		if(e.which === 13){
			var classes = $this.attr('class').split(' ');
			var message = $this.val();
			var representative_id = $('#representative_id').val();
			var username = $('#username').val();
			var user_id = classes[2];
			//chat_id++;
			//alert(chat_id);
			socket.emit('new message', message,'representative',user_id);
			$this.val('');

			updateDB(representative_id+"-Representative",message,representative_id+","+user_id); //Update message in DB
		}
	});

	function updateDB(name,msg,chat){

		$.post(base_url+'assets/chatroom/process.php',{method:'update',name:name,msg:msg,chat:chat},function(response){
			console.log(response);
		});
	}

	$( document ).ready(function() {
		var name = Math.random();
		socket.emit('new user', name, function(response){
			if(response){
				localStorage.setItem('username',name);
				$this.val('');
				$('#userinfo').hide();
				$('#chat-body').fadeIn();
				loadMessages(); //retrieve messages from Database
			} else{
				$('.validation').text('Username taken!').fadeIn();
			}
		});
	});

	$('#username').on('keyup',function(e){
		var $this = $(this);
		if(e.which === 13){
			var name = $this.val();
			socket.emit('new user', name, function(response){
				if(response){
					localStorage.setItem('username',name);
					$this.val('');
					$('#userinfo').hide();
					$('#chat-body').fadeIn();					
					loadMessages(); //retrieve messages from Database
				} else{
					$('.validation').text('Username taken!').fadeIn();
				}
			});
		}
	});


	$( document ).ready(function() {
		var $this = $("#username");
		var name = $this.val();
		var send_by = $("#send_by").val();
		 rep_id =  $("#representative_id").val();
		socket.emit('new user', name,send_by, function(response){
			if(response){
				localStorage.setItem('username',name);
				$this.val('');
				$('#userinfo').hide();
				$('#chat-body').fadeIn();
				loadMessages(); //retrieve messages from Database
			} else{
				$('.validation').text('Username taken!').fadeIn();
			}
		});
	});

	function loadMessages(){

		$.post(base_url+'assets/chatroom/process.php',{method:'retrieve'},function(response){
			$.each(JSON.parse(response),function(i,v){
				if(v.send_by == 'representative'){
					$('.messages').append('<div class="direct-chat-msg right"><div class="direct-chat-text"><span class="direct-chat-name pull-left" style="color: #5cafbd">'+v.name+'</span><span class="direct-chat-timestamp pull-right">'+v.created_dateandtime+'</span><br>'+v.message+'</div></div>');

				}
				else{
					$('.messages').append('<div class="direct-chat-msg"><div class="direct-chat-text"><span class="direct-chat-name pull-left" style="color: #f39c12">'+v.name+'</span><span class="direct-chat-timestamp pull-right">'+v.created_dateandtime+'</span><br>'+v.message+'</div></div>');

				}
				chat_ids = v.chat_id;


			});

			chat_ids++;
			var pre_chat = $('#chat_id').val();

			$('#chat_id').val(pre_chat+","+chat_ids);

			//$('.messages').animate({scrollTop: $('.messages').prop("scrollHeight")}, 500);
		});
	}




	/*** App ***/

	$('.names-list').slimScroll({
	    width: '200px',
    	height: '400px',
    	color: '#ffcc00'
	});

	$('.messages').slimScroll({
	    width: '500px',
    	height: '350px',
    	color: '#3092BF',
    	alwaysVisible: true,
    	start: 'bottom'
	});

	$('.direct-chat-messages').slimScroll({
		width: '500px',
		height: '350px',
		color: '#3092BF',
		alwaysVisible: true,
		start: 'bottom'
	});
});

function loadMessages(v){



	$.post(base_url+'assets/chatroom/process.php',{method:'rretrieve',id:v,rep_id:$("#representative_id").val()},function(response){

		$.each(JSON.parse(response),function(i,v){

			if(v.send_by == 'representative'){

				$('.messages'+v.user_id).append('<div class="direct-chat-msg right"><div class="direct-chat-text"><span class="direct-chat-name pull-left" style="color: #5cafbd">'+v.name+'</span><span class="direct-chat-timestamp pull-right">'+v.created_dateandtime+'</span><br>'+v.message+'</div></div>');

			}
			else{
				//alert(v.send_by);
				$('.messages'+v.user_id).append('<div class="direct-chat-msg"><div class="direct-chat-text"><span class="direct-chat-name pull-left" style="color: #f39c12">'+v.name+'</span><span class="direct-chat-timestamp pull-right">'+v.created_dateandtime+'</span><br>'+v.message+'</div></div>');

			}
			chat_ids = v.chat_id;

			$('.messages'+v.user_id).animate({scrollTop: $('.messages'+v.user_id).prop("scrollHeight")}, 500);
		});

		chat_ids++;
		var pre_chat = $('#chat_id').val();

		$('#chat_id').val(pre_chat+","+chat_ids);


	});
}

function let_chat(v){
	//alert(v);
	
	$.ajax({
		type: "POST",
		url: base_url+"representatives/view_user",
		data: {uid:v},
		success: function(data) {
			//myData.push(data);
			var result = JSON.parse(data);

			//console.log(result);

			$( "#brown_chat" ).append('<div  class="col-md-12"><div class="row"><div class="col-sm-4 hidden-xs" style="padding-right: 0px; "><div class="box" ><div class="box-header bg-teal-light" ><i class="fa fa-circle fa-2x" aria-hidden="true" style="color: gainsboro"></i> '+result.u_username+'</div><div class="box-body table-responsive bg-white" style="height: 400px;"><center class="mt-35"><img src="'+base_url+'/assets/user_profile/owl-avatar.png"><h4 style="font-weight: 800">'+result.u_fullname+'</h4><h6>AUSTIN,TX</h6><br><br><p style="font-size: 10px">Search that was typed...Lorem ipsum lorem ipsum</p></center></div><div class="box-footer bg-white" style="height: 55px;"></div></div></div><div class="col-sm-8 col-xs-12 chat-area" style="    padding-left: 0px;"><div class="box box-warning direct-chat direct-chat-warning" style="border-color: #d2d6de"><div class="box-header bg-teal-light" ><h3 class="box-title">Subject/search</h3><div class="box-tools pull-right"></div></div><div class="box-body" ><div id="chat-body"><div id="userinfo"><input type="hidden" id="username" autocomplete="off" value="'+rep_id+'"><input type="hidden" id="rep_id" autocomplete="off" value="'+rep_id+'"></div><div class="chat-holder"><div class="message-holder"><div class="direct-chat-messages" style="height: 400px;"><div  class="messages'+v+'"></div></div></div></div></div></div><div class="box-footer"><div class="input-group"><input type="hidden" name="chat_id" id="chat_id" value="'+rep_id+'"><input type="text" name="message" placeholder="Type Message ..." class="form-control message-box '+v+'"><span class="input-group-btn"><button type="button" class="btn btn-warning btn-flat send-btn" onclick="submit_msg()"><i class="fa fa-send"></i></button></span></div></div></div></div></div></div>');
			loadMessages(v);
		}

	})



}
