<?php
				$servername = "localhost";
				$username = "bigdata";
				$password = "bigdata";
				$dbname = "bigdatabase";  

				try {
			   $dbh = new PDO('pgsql:host=localhost;dbname=bigdatabase', $username, $password);

			   $query = "select ST_X(pnt), ST_Y(pnt) from public.waypoint where id_track = 0 order by sequence_no;";

				$firstRoute = true;
				echo "Start<br/>";
				
				//echo "{values:[";
			    foreach ($dbh->query($query) as $row) {
					if($firstRoute){
						$firstRoute = false;
					}
					else{
					//	echo ", " ;
					}
					
					//echo "{id:'".$row[id_track]."',name:'".$row[name]."'}";
					echo $row[0]." ".$row[1]."<br/>";
				}
				
				//echo "]}";
			   $dbh = null;
			} catch (PDOException $e) {
			   print "Error!: " . $e->getMessage() . "<br/>";
			   die();
}
?>