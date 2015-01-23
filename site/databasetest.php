<!DOCTYPE HTML>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>QGIS-Browser</title>
</head>
<body>

<?php
				$servername = "localhost";
				$username = "bigdata";
				$password = "bigdata";
				$dbname = "bigdatabase";  

				try {
			   $dbh = new PDO('pgsql:host=localhost;dbname=bigdatabase', $username, $password);

			   $query = "select id_track, name, id_user from public.track;";

			    foreach ($dbh->query($query) as $row) {
					echo " id_track " . $row[id_track] . "<br/>";
					echo " name " . $row[name] . "<br/>";
					echo " id_user " . $row[id_user] . "<br/>";
				}
   
				$query = "select ST_X(pnt), ST_Y(pnt) from public.waypoint  where id_track = ".$row[id_track]."
order by sequence_no;";

				echo $query;
				echo "<br/>";
   			    foreach ($dbh->query($query) as $row) {
					echo " pnt " . $row[0] . " " . $row[1] . "<br/>";
				}
				
			   $dbh = null;
			} catch (PDOException $e) {
			   print "Error!: " . $e->getMessage() . "<br/>";
			   die();
}
?>

</body>
</html>
