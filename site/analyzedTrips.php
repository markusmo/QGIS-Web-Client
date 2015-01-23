<?php
				$servername = "localhost";
				$username = "bigdata";
				$password = "bigdata";
				$dbname = "bigdatabase";  

				$id_track  = $_GET["trackid"];
				
				try {
				$dbh = new PDO('pgsql:host=localhost;dbname=bigdatabase', $username, $password);

				
				$query = "select distinct id_analyzedtrip from public.analyzedtrip, public.waypoint where waypoint.id_track = ".$id_track." and(analyzedtrip.id_startwaypoint = waypoint.id_waypoint or analyzedtrip.id_endwaypoint = waypoint.id_waypoint);";
	
				$firstRoute = true;
				
				echo "{id:".$id_track.",values:[";
			    foreach ($dbh->query($query) as $row) {
					if($firstRoute){
						$firstRoute = false;
					}
					else{
						echo ", " ;
					}
							
					echo "{id:'" . $row[0] . "'}";
				}
				
				echo "]}";
			   $dbh = null;
			} catch (PDOException $e) {
			   print "Error!: " . $e->getMessage() . "<br/>";
			   die();
			}
?>