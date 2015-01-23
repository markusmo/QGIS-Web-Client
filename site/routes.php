<?php
				$servername = "localhost";
				$username = "bigdata";
				$password = "bigdata";
				$dbname = "bigdatabase";  

				try {
			   $dbh = new PDO('pgsql:host=localhost;dbname=bigdatabase', $username, $password);

			   $query = "select id_track, name, id_user from public.track;";

				$firstRoute = true;
				
				echo "{values:[";
			    foreach ($dbh->query($query) as $row) {
					if($firstRoute){
						$firstRoute = false;
					}
					else{
						echo ", " ;
					}
					
					echo "{id:'".$row[id_track]."',name:'".$row[name]."'}";
					
				}
				
				echo "]}";
			   $dbh = null;
			} catch (PDOException $e) {
			   print "Error!: " . $e->getMessage() . "<br/>";
			   die();
}
?>