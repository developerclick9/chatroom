var base_url = 'http://localhost/kinlu_admin/';



$(function(){
    var socket = io.connect( 'http://'+window.location.hostname+':3000' );
    var base_url = 'http://localhost/kinlu_admin/';
    var chat_ids = 1;
    var rep_id = 0;
    var user_id = $('#user_id').val();

    socket.on('users', function(data){
        $('.select-representative').text('');
        $.each(data,function(i,v){
            var arr = v.split('-');
            if(arr[1] == 'Representative'){
                rep_id = arr[0];
                $('.select-representative').append('<div class="wrapper"><div class="img"><a href="supplier_profile.php"><img src="'+base_url+'assets/frontend/images/owl-avatar.png"  class="uk-border-circle" alt=""></a><span class="rating">4 <i class="uk-icon-star"></i></span></div><p class="name" id="representative'+arr[0]+'">'+arr[0]+'</p><p class="location">Austin, TX</p><p class="desc">More info or short description about Kinlus representative ore info or short description about representative</p></div>');
                return true;
            }

        });
    });

    socket.on('push message', function(response){
        //$('.messages').append('<li><div class="msg-lhs"><span class="username">'+response.name+'</span> : <span class="msg">'+response.msg+'</span></div><span data-livestamp="'+moment().unix()+'" class="msg-rhs"></span></li>');
        //$('.messages').append('<div class="direct-chat-msg right"><div class="direct-chat-text"><span class="direct-chat-name pull-left" style="color: #5cafbd">'+response.name+'</span><span class="direct-chat-timestamp pull-right"><span data-livestamp="'+moment().unix()+'" class="msg-rhs"></span></span><br>'+response.msg+'</div></div>');


      
        if(response.sendby == 'user'){


            $('.messages'+response.userid).append('<div class="user"><div class="c-box"><div class="c-header"><span class="c-name">'+response.name+'</span><span class="c-time"><span data-livestamp="'+moment().unix()+'" class="msg-rhs"></span></span></div><div class="c-msg">'+response.msg+'</div></div></div>');

        }
        else{

            $('.messages'+response.userid).append('<div class="representative"><div class="c-box"><div class="c-header"><span class="c-name"><a href="supplier_profile.php">'+response.name+' | Kinlu’s Rep</a></span><span class="c-time"><span data-livestamp="'+moment().unix()+'" class="msg-rhs"></span></span></div><div class="c-msg">'+response.msg+'</div></div></div>');
        }

        $('.messages'+response.userid).animate({scrollTop: $('.messages'+response.userid).prop("scrollHeight")}, 500);
    });




    $(document).on('keyup','.message-box',function(e){
        var $this = $(this);
        if(e.which === 13){
            var message = $this.val();
            var user_id = $('#user_id').val();
            //chat_id++;
            //alert(chat_id);
            socket.emit('new message', message,'user',user_id);
            $this.val('');
            updateDB(user_id+"-User",message,rep_id +','+user_id); //Update message in DB
        }
    });

    function updateDB(name,msg,chat){
        //alert(chat);
        $.post(base_url+'assets/chatroom/process_user.php',{method:'update',name:name,msg:msg,chat:chat},function(response){
            console.log(response);
        });
    }

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
            var id = $this.val();
        var send_by = $("#send_by").val();
            socket.emit('new user', id,send_by, function(response){
                if(response){
                    localStorage.setItem('username',id);
                    $this.val('');
                    $('#userinfo').hide();
                    $('#chat-body').fadeIn();
                    var arr = id.split('-');
                    loadMessages(arr[0]); //retrieve messages from Database
                } else{
                    $('.validation').text('Username taken!').fadeIn();
                }
            });
    });

    function loadMessages(id){

        $.post(base_url+'assets/chatroom/process_user.php',{method:'rretrieve',id:id,rep_id:rep_id},function(response){
            $.each(JSON.parse(response),function(i,v){
                //console.log(v);
                if(v.send_by == 'representative'){
                    $('.messages'+id).append('<div class="representative"><div class="c-box"><div class="c-header"><span class="c-name"><a href="supplier_profile.php">'+v.name+' | Kinlu’s Rep</a></span><span class="c-time">'+v.created_dateandtime+'</span></div><div class="c-msg">'+v.message+'</div></div></div>');

                }
                else{
                    $('.messages'+id).append('<div class="user"><div class="c-box"><div class="c-header"><span class="c-name">'+v.name+'</span><span class="c-time">'+v.created_dateandtime+'</span></div><div class="c-msg">'+v.message+'</div></div></div>');

                }
                chat_ids = v.chat_id;


            });

            chat_ids++;
            var pre_chat = $('#chat_id').val();

            $('#chat_id').val(pre_chat+","+chat_ids);

            $('.messages').animate({scrollTop: $('.messages').prop("scrollHeight")}, 500);
        });
    }

    /*** App ***/

    $('.names-list').slimScroll({
        width: '200px',
        height: '400px',
        color: '#ffcc00'
    });

    $('.messages'+user_id).slimScroll({
        width: '500px',
        height: '350px',
        color: '#3092BF',
        alwaysVisible: true,
        start: 'bottom'
    });
});