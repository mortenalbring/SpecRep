<?php
	$dbhost = 'localhost';
	$dbname = 'test';

	//connect to test db
	$m = new MongoClient("mongodb://$dbhost");
	$db = $m ->$dbname;

	//select the collection
	$grid = $db->getGridFS();

	//get uploaded file name
	$name = $_FILES['file']['name'];

	//get HTTP header
	//$fn = (isset($_SERVER['HTTP_X_FILENAME']) ? $_SERVER['HTTP_X_FILENAME'] : false);


	//get temporary location of file for further processing
	$file = $_FILES['file']['tmp_name'];
	$check = $grid->findOne(array('filename' => $name));
	//check if file is already in the db
	if(!$check){
	//add file to db
	$id = $grid->storeUpload('file',$name);

	//get file extension: parameter file or spectra
	$ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);

	//add additional metadata
	$files = $db->fs->files;
	$files->update(array("filename"=>$name),array('$set' => array("contentType"=>$ext)));
	$param = "param";
	//if a .param file parse and put into parameters collection
	if($ext == $param){
		//init array for parameters
		$params = array();
		//open file
		$fp = file($file);
		//store each of the parameters into array with appropriate key
		foreach($fp as $line_num => $line){
			$line = trim($line);
			$i=$line_num;
			switch ($i) {
				case 0:
					$params["same"]=$line;
					break;
				case 1:
					$params["color"]=$line;
					break;
				case 2:
					$params["j"]=$line;
					break;
				case 3:
					$params["type"]=$line;
					break;
				case 4:
					$params["gx1"]=$line;
					break;
				case 5:
					$params["gy1"]=$line;
					break;
				case 6:
					$params["gz1"]=$line;
					break;
				case 7:
					$params["gx2"]=$line;
					break;
				case 8:
					$params["gy2"]=$line;
					break;
				case 9:
					$params["gz2"]=$line;
					break;
				case 10:
					$params["theta_step"]=$line;
					break;
				case 11:
					$params["phi_step"]=$line;
					break;
				case 12:
					$params["min_field"]=$line;
					break;
				case 13:
					$params["max_field"]=$line;
					break;
				case 14:
					$params["field_step"]=$line;
					break;
				case 15:
					$params["freq"]=$line;
					break;
				case 16:
					$params["temp"]=$line;
					break;
				case 17:
					$params["sigma"]=$line;
					break;
				case 18:
					$params["mult_factor"]=$line;
					break;
				case 19:
					$params["sigma_mult_factor"]=$line;
					break;
				case 20:
					$params["threshold"]=$line;
					break;
				case 21:
					$params["filename"]=$line;
					break;
				case 22:
					$params["out2"]=$line;
					break;
				default:
					# code...
					break;
			}
		}
		
		//select parameters collection and add array
		$collection = $m -> selectCollection('test','parameters');
		$collection ->insert($params);
	}
	
}
else{
	echo "exists";
}
	$m->close();
	
	// foreach($cursor as $document) {
	// 	var_dump($document);
	// }
?>