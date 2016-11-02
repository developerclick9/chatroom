<?php
try{
	$db = new PDO("mysql:host=localhost;dbname=kinlu","root","");
} catch(PDOException $e){
	echo $e->getMessage();
}

$db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	if(isset($_POST['method'])){
		$method = $_POST['method'];
		switch($method){
			case 'update':

				update($_POST['name'],$_POST['msg'],$_POST['chat'],$db);

				break;
			case 'retrieve':
				retrieve($db);
				break;
			case 'rretrieve':
				rretrieve($_POST['id'],$_POST['rep_id'],$db);
				break;
			default:
				echo json_encode(['status'=>'error','text'=>'Invalid request!']);
		}
	}


}

function update($name,$msg,$chat,$db){

	$time = time();
	$date = date('d/m/Y');
	$dateandtime = date('jS F h:i A');

	$arr_chat =  (explode(",",$chat));

//	$insert = $db->prepare("INSERT INTO messages(name, chat_id, user_id, message, representative_id, send_by, created_date, created_time)
//	    VALUES(:name,1,1, :message,1,'representative', :create_date, :created_time)");
	$insert = $db->prepare("INSERT INTO messages(name,chat_id,user_id, message,representative_id,send_by, created_date,created_time,created_dateandtime)
	    VALUES(:name,:chat_id,:user_id, :message,:representative_id, 'representative',:created_date,:created_time,:created_dateandtime)");
	$insert->execute(array(
		"name" => $name,
		"chat_id" => $arr_chat[0]."".$arr_chat[1],
		"user_id" => $arr_chat[1],
		"message" => $msg,
		"representative_id" => $arr_chat[0],
		"created_date" => $date,
		"created_time" => $time,
		"created_dateandtime" => $dateandtime
	));
	if($insert){
		echo json_encode(['status'=>'success']);
	} else{
		echo json_encode(['status'=>'error']);
	}
}


function retrieve($db){

	$sql = $db->query('SELECT * FROM messages')->fetchAll();
	echo json_encode($sql, JSON_PRETTY_PRINT);

}



function rretrieve($id,$rep_id,$db){


	$sql = $db->query("SELECT * FROM messages where user_id = '".$id."' and representative_id ='".$rep_id."'")->fetchAll();
	echo json_encode($sql, JSON_PRETTY_PRINT);

}

?>