<?php
	$dbhost = 'localhost';
	$dbname = 'test';


	//connect to test db
	$m = new Mongo("mongodb://$dbhost");
	$db = $m ->$dbname;
	//name of requested file
	
	$grid = $db->getGridFS();

	//pull a cursor query
	$cursor = $grid->find(array('contentType' => 'epr'));
	
	$m->close();
	
	//echo $removeFile;
	 foreach($cursor as $document) {
		$fileNames[] = $document->getFilename();
	 }
	echo json_encode($fileNames);
	//echo $cursor->getBytes();
?>