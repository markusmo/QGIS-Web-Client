<?php
				$servername = "localhost";
				$username = "bigdata";
				$password = "bigdata";
				$dbname = "bigdatabase";  

				$id_track  = $_GET["analyzedTripId"];
				
				try {
				$dbh = new PDO('pgsql:host=localhost;dbname=bigdatabase', $username, $password);

				
				$query = 	"SELECT public.transporttype.name, ST_X(public.waypoint.pnt), ST_Y(public.waypoint.pnt) FROM public.waypoint, public.analyzedtrip, public.transporttype WHERE waypoint.id_track = (select waypoint.id_track from waypoint where analyzedtrip.id_startwaypoint = waypoint.id_waypoint) AND waypoint.sequence_no >= (select waypoint.sequence_no from waypoint where analyzedtrip.id_startwaypoint = waypoint.id_waypoint) AND waypoint.sequence_no <= (select waypoint.sequence_no from waypoint where analyzedtrip.id_endwaypoint = waypoint.id_waypoint) AND analyzedtrip.id_analyzedtrip = ".$id_track." AND analyzedtrip.id_transporttype = transporttype.id_transporttype ORDER BY public.waypoint.sequence_no;";
	
				$firstRoute = true;
				
				echo "{values:[";
			    foreach ($dbh->query($query) as $row) {
					if($firstRoute){
						$firstRoute = false;
					}
					else{
						echo ", " ;
					}
							
					echo "{type:'".$row[0]."',x:'" . $row[1] . "', y: '" . $row[2] . "'}";
				}
				
				echo "]}";
			   $dbh = null;
			} catch (PDOException $e) {
			   print "Error!: " . $e->getMessage() . "<br/>";
			   die();
			}
?>