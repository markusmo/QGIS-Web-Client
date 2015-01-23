<?php
				$servername = "localhost";
				$username = "bigdata";
				$password = "bigdata";
				$dbname = "bigdatabase";  

				$id_track  = $_GET["routeId"];
				
			//	echo "Start";
				//echo $id_track;
				try {
				$dbh = new PDO('pgsql:host=localhost;dbname=bigdatabase', $username, $password);

				
				$query = "select ST_X(pnt), ST_Y(pnt) from public.waypoint where id_track = ".$id_track." order by sequence_no;";

				//echo "<br/>";
				//echo $query;
				
		//		echo "<br/>";
				
				$firstRoute = true;
				
				echo "{values:[";
			    foreach ($dbh->query($query) as $row) {
					if($firstRoute){
						$firstRoute = false;
					}
					else{
						echo ", " ;
					}
							
					echo "{x:'" . $row[0] . "', y: '" . $row[1] . "'}";
				}
				
				echo "]}";
			   $dbh = null;
			} catch (PDOException $e) {
			   print "Error!: " . $e->getMessage() . "<br/>";
			   die();
			}
?>