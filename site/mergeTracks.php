<?php

function getConnection()
{
	$servername = "localhost";
	$username = "bigdata";
	$password = "bigdata";
	$dbname = "bigdatabase"; 
	
	$dbh = new PDO('pgsql:host=localhost;dbname=bigdatabase', $username, $password);
	return $dbh;			
}

function getMaxSequenceNumber($id_track)
{
	try 
	{
		echo "getConnection";
		$dbh = getConnection();
		$query = "SELECT max(sequence_no) FROM waypoint WHERE id_track = '" . $id_track . "';";
		foreach($dbh->query($query) as $row) 
		{
			return $row[0] + 1;
		}
		return 0;
	}
	catch(Exception $e) 
	{
		print "Error!: " . $e->getMessage() . "<br/>";
		die();	
	}
}

try 
{
	echo "starting<br>";
	$trackings = array();
	foreach(explode(',', $_REQUEST['ids']) as $id_track)
	{
		$trackings[$id_track] = getMaxSequenceNumber($id_track);
	}
	echo "after foreach<br>";
	
	$master_track_id = array_keys($trackings)[0];
	echo "master track id = " . $master_track_id . "<br>";

	$globalSequence = array_values($trackings)[0] + 1;
	echo "globalSequence = " . $globalSequence . "<br>";
	foreach($trackings as $id => $count)
	{
		if($id == $master_track_id) 
		{
			// Skip master
		}
		else 
		{
			echo $id . " => " . $count . "<br/>";
			$query = "UPDATE waypoint SET sequence_no = sequence_no + " . $globalSequence . " WHERE id_track = '" . $id . "';";
			echo $query . "<br>";
			$query = "UPDATE waypoint SET id_track = '" . $master_track_id . "' WHERE id_track = '" . $id . "';";
			echo $query . "<br>";
			$globalSequence += $count;
		}
	}
} 
catch (PDOException $e) 
{
	print "Error!: " . $e->getMessage() . "<br/>";
	die();
}
			
?>