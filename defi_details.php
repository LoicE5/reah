<?php
include("assets/php/config.php");
// include("ressources/pop_up_film_information.php");
include("ressources/pop_up_connexion.php");
// include("ressources/pop_up_share.php");
// include('vimeo_setup.php');
include('assets/php/comments.php');

// Vérification de l'existance du défi
if(isset($_GET['defi'])){
    $query = "SELECT COUNT(*) as nbr FROM defis WHERE defi_id = '{$_GET['defi']}'";
        $stmt = $db->prepare($query);
        $stmt->execute();
    
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if($row['nbr'] <= 0) {
            redirect('defis.php');
        }
}




// Supression d'un commentaire
if (isset($_GET['delete_comment'])) {

    $query = "SELECT * FROM videos, comments WHERE comment_id = " . $_GET['delete_comment'] . " AND comment_video_id = video_id;";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    $comment_id = $_GET['delete_comment'];
    $user_id = $_COOKIE['userid'];
    $sql = "DELETE FROM comments WHERE comment_user_id='$user_id' AND comment_id='$comment_id'";

    $stmt = $db->prepare($sql);

    $stmt->execute();

    header('Location: defi_details.php?defi='.$row['video_defi_id']);

}

    if (isset($_POST["video_send"])){
        
        // Vimeo
        $file_name = $_FILES['video']['tmp_name'];
    $uri = $client->upload($file_name, array(
      "name" => "Untitled",
      "description" => "The description goes here."
    ));
    
    echo "Your video URI is: " . $uri;


    $response = $client->request($uri . '?fields=transcode.status');
    if ($response['body']['transcode']['status'] === 'complete') {
    print 'Your video finished transcoding.';
    } elseif ($response['body']['transcode']['status'] === 'in_progress') {
    print 'Your video is still transcoding.';
    } else {
    print 'Your video encountered an error during transcoding.';
    }

    $response = $client->request($uri . '?fields=link');
    echo "Your video link is: " . $response['body']['link'];

    $content_dir_video = 'database/videos/';
    $tmp_file_video = $_FILES['video']['tmp_name'];
    $name_file_video = basename($_FILES['video']['name']);

    // if ($_FILES["video"]['error'] == 0) {

        if(!is_uploaded_file($tmp_file_video)) {
            $message_false = "Le fichier est introuvable.";
        }
    
        if(!move_uploaded_file($tmp_file_video, $content_dir_video . $name_file_video)){
            $message_false = "Impossible de copier le fichier dans notre dossier.";
        }
    // }
        $sql = "INSERT INTO videos (video_url, video_title, video_user_id, video_synopsis, video_poster, video_genre, video_defi_id) VALUES (:url, :title, :user_id, :synopsis, :poster, :genre, :collab, :defi_id)";

        $attributes = array(
            'url' => $name_file_video,
            'title' => $_POST['title'],
            'user_id' => $_COOKIE['userid'],
            'synopsis' => $_POST['synopsis'],
            'poster' => $_POST['poster'],
            'genre' => $_POST['genre'],
            'collab' => $_POST['collab'],
            'video' => $_POST['video'],
            'defi_id' => $_GET['defi'],
        );
    
        $stmt = $db->prepare($sql);
    
        $stmt->execute($attributes);
    
}

if (isset($_GET["defi"])) {

    $query = "SELECT defi_name FROM defis WHERE defi_id= " . $_GET["defi"] . "";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
}
?>
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>REAH | <?php echo $row['defi_name']?></title>
    <link rel="apple-touch-icon" sizes="180x180" href="/sources/img/favicon/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/sources/img/favicon/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/sources/img/favicon/favicon-16x16.png">
<link rel="manifest" href="/sources/img/favicon/site.webmanifest">
<link rel="mask-icon" href="/sources/img/favicon/safari-pinned-tab.svg" color="#d60036">
<meta name="msapplication-TileColor" content="#2b5797">
<meta name="theme-color" content="#ffffff">
    <link rel="stylesheet" href="assets/css/dark_mode.css">
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="stylesheet" href="assets/css/fil_actu.css">
    <link rel="stylesheet" href="assets/css/defi_details.css">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="assets/css/fullpage.css" />
    <script src="assets/js/libraries/svg-inject-master/src/svg-inject.js"></script>
    <script src="https://player.vimeo.com/api/player.js"></script>
</head>

<body>



    <!-- Signalement -->
    <?php
    if (isset($message_true)) {
        echo '
        <p class="message_true_container">
                '.$message_true.'
        </p>';
    }
    if (isset($_GET['upload']) == 'true') {
        echo '
        <p class="message_true_container">
                Ton court-métrage a bien été déposé.
        </p>';
    }
    if (isset($_GET['upload']) == 'false') {
        echo '
        <p class="message_false_container">
        La vidéo est trop lourde.
        </p>';
    }

    if (isset($message_false)) {
        echo '
        <p class="message_false_container">'
                .$message_false.
        '</p>';
    }
    ?>
    <main class="main_content">

        <div class='dark_filter' onclick="closePopupFilm(this)"></div>
        <div class="share_dark_filter" onclick="closePopupShare()"></div>
        <div class="like_dark_filter" onclick="closePopupUserLike()"></div>
        <div class="delete_dark_filter" onclick="closePopupDeleteFilm()"></div>

        <!-- Navigation menu -->
        <nav>
            <!-- Logo Réah -->
            <a href="fil_actu.php" class="reah_logo" alt=""></a>

            <div class="menu_nav">
                <!-- Categories's title -->
                <div class="menu_category">
                    <p class="category_title category_title1" number="1" number1="2" number2="3">Défi</p>
                    <p class="category_title category_title2" number="2" number1="1" number2="3">Courts-métrages</p>
                    <p class="category_title category_title3" number="3" number1="1" number2="2">Classement</p>
                    <div class="red_line underline"></div>
                    <div class="fb_jsb ai-c category_list">
                        <p class="category_list_title">Catégories</p>
                        <div class="category_triangle"></div>
                    </div>
                </div>

                <!-- Search bar -->
                <form action="search.php" method="GET" class="form_search_bar">
                    <input class="search_bar" type="text" placeholder="Défis, courts-métrages, utilisateurs..."
                        oninput="searchEngine(this.value)">
                </form>

                <?php
                if (func::checkLoginState($db)) { # If the user is connected
                    $query = "SELECT * FROM users WHERE user_id = " . $_COOKIE['userid'] . ";";
                    $stmt = $db->prepare($query);
                    $stmt->execute();

                    $row = $stmt->fetch(PDO::FETCH_ASSOC);

                    echo "<div class='menu_profile'>
                        <!-- Fil actu icon -->
                        <form action='fil_actu.php' method='GET'>
                            <button type='submit' name='accueil' class='fil_actu_icon' value='true'></button>
                        </form>
                        <!-- Defi icon -->
                        <a href='defis.php' class='defi_icon'></a>
                        <!-- Profile photo -->
                        <img src='database/profile_pictures/".$row['user_profile_picture']."' class='menu_pp' onclick='toggleBurgerMenu()'>
                        </div>
                        </nav>";
                } else {

                    echo "<div class='menu_profile'>
                        <!-- Fil actu icon -->
                        <form action='fil_actu.php' method='GET'>
                            <button type='submit' name='accueil' class='fil_actu_icon' value='true'></button>
                        </form>
                        <!-- Defi icon -->
                        <a href='defis.php' class='defi_icon' alt=''></a>
                        <!-- Profile photo -->
                        <div class='se-connecter' onclick='redirect(`login.php`)'>
                        <div class='se-connecter menu_pp_icon' onclick='redirect(`login.php`)' onload='SVGInject(this)'>

                    </div>
                        </div>
                        </div>
                        </nav>";
                }
                ?>

            </div>
        </nav>

        <!-- Category list  -->
        <div class="category_list_container">

            <p class="category_list_category category_list_category1" number="1" number1="2" number2="3">Défi</p>
            <p class="category_list_category category_list_category2" number="2" number1="1" number2="3">Couts-métrages
            </p>
            <p class="category_list_category category_list_category3" number="3" number1="1" number2="2">Classement</p>
        </div>

        <!-- Menu -->
        <?php
        require("ressources/menu.php");
        ?>

        <!-- Nav footer -->

        <div class="nav_footer">
            <div class="nav_footer_category" number="1" number2="2" number3="3">
                <div class="defi_constraints_icon"></div>
                Défi
            </div>
            <div class="nav_footer_category" number="2" number2="1" number3="3">
                <div class="short_film_icon"></div>
                Courts-métrages
            </div>
            <div class="nav_footer_category" number="3" number2="1" number3="2">
                <div class="classement_icon"></div>
                Classement
            </div>
        </div>


        <div class="all_category_container">

            <!-- "Ajout récent" catégory -->
            <div class="defi_category" id="category1">

                <!-- Title -->
                <?php
                if (isset($_GET["defi"])) {

                    $query = "SELECT * FROM defis WHERE defi_id= " . $_GET["defi"] . "";
                    $stmt = $db->prepare($query);
                    $stmt->execute();

                    $row = $stmt->fetch(PDO::FETCH_ASSOC);

                    echo "<h1 id='title1'>
                        <div class='red_line title_line'></div>
                        " . strtoupper($row['defi_name']) . "</h1>";
                }
                ?>

                <!-- Constraints -->
                <div class="defi_container">
                    <div class="defi_constraints">
                        <p><b>Consignes</b></p>
                        <p>

                            <?php
                            echo nl2br($row['defi_description']);
                            ?>

                        </p>
                        <p style="color:#d60036">*Nous vous rappelons que tout contenu inapproprié se verra retiré de la
                            plateforme.</p>
                        <p><b>À vos marques, prêt·e·s, tournez !</b></p>
                    </div>

                    <div class="defi_information">
                        <?php
                        if (func::checkLoginState($db)) { # If the user is connected
                                if($row['defi_current'] == 1){

                                    echo '
                            <div href="depot.php" class="btn depot_btn" onclick="popupAddFilm()">
                                <img class="depot_icon" src="sources/img/depot_icon.svg" alt="">
                                Déposer un court-métrage
                            </div>';
                                }
                        } else { # If the user is an asshole
                            echo '
                        <div href="depot.php" class="btn depot_btn" onclick="popupConnexion()">
                            <img class="depot_icon" src="sources/img/depot_icon.svg" alt="">
                            Déposer un court-métrage
                        </div>';
                        }
                        ?>


                        <!-- Time left and number of short films submitted -->
                        <?php
                        if (isset($_GET["defi"])) {

                            $query = "SELECT COUNT(video_id) as defi_number, defi_date_end FROM defis, videos WHERE defi_id=video_defi_id AND defi_id=" . $_GET["defi"] . "";
                            $stmt = $db->prepare($query);
                            $stmt->execute();

                            $row = $stmt->fetch(PDO::FETCH_ASSOC);

                            echo " <p><span>Temps restant</span><span id='time' time=".$row['defi_date_end']."></span></p>";
                            echo " <p><span>Nombre de courts-métrages déposés</span>" . $row['defi_number'] . "</p>";
                        }
                        ?>
                    </div>
                </div>
            </div>

            <div class="second_category" id="category2">

                <!-- prev arrow -->
                <div class="arrow_prev_container">
                </div>

                <!-- Category content  -->
                <div class="category_content">

                    <!-- Category title -->
                    <h1 id="title2">
                        <div class="red_line title_line"></div>
                        COURTS-MÉTRAGES
                    </h1>

                    <!-- All videos -->
                    <div class="all_video_container">

                        <?php

                        if (isset($_GET["defi"])) {

                            $query = "SELECT *, DATE_FORMAT(video_duration, '%imin %ss' ) as time FROM videos, defis, users WHERE defi_id=video_defi_id AND video_user_id = user_id AND defi_id=" . $_GET["defi"] . " ORDER BY RAND()";
                            $stmt = $db->prepare($query);
                            $stmt->execute();

                            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

                            foreach ($rows as $row) {
                                echo "<!-- Video container -->
                    <div class='video_container'>

                        <!-- Short film (class=video) -->
                        <div class='video_content'>";
            if($row['video_poster'] != ''){
                echo"
                <img src='database/videos_posters/".$row['video_poster']."' class='video_poster'>";
            }

            echo"
                        <iframe src='https://player.vimeo.com/video/" . $row['video_url'] . "' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen class='video'></iframe>

                            <!-- Name + pp -->
                            <a href='profil.php?id=" . $row['user_id'] . "' class='user_container'>

                                <img src='database/profile_pictures/".$row['user_profile_picture'] . "' alt=''  class='pp_profile'>

                    <p class='pseudo'>" . $row['user_username'] . "</p>
                    <div class='flou'></div>
                </a>

                            <!-- Time -->
                            <p class='time'>" . $row['time'] . "</p>
                        </div>

                        <!-- Short film\'s informations -->
                        <div class='description_container'>
                            <div class='fb_jsb'>
                                <div class='synopsis_title_container' title=" . $row['video_id'] . " onclick='popupFilm(this)'>
                                    <h3 class='synopsis_title'>" . $row['video_title'] . "</h3>
                                    <p class='see_more'>Voir plus
                                        <img src='sources/img/see_more_arrow.svg' class='see_more_arrow' alt=''>
                                        </p>
                                </div>";

                                if (func::checkLoginState($db)) { # If the user is connected
                                    echo "
                                <div class='reaction_container'>
                                    <div class='fb_jsb like_container'>";

                                // <!-- Pop corn image -->

                                $query10 = "SELECT COUNT(*) as nbr FROM liked WHERE liked_user_id={$_COOKIE['userid']} AND liked_video_id={$row['video_id']}";
                                $stmt10 = $db->prepare($query10);
                                $stmt10->execute();

                                $row10 = $stmt10->fetch(PDO::FETCH_ASSOC);

                                if ($row10['nbr'] >= 1) {
                                    echo"
                                    <img src='sources/img/pop_corn.png' class='pop_corn_icon' onclick='addLike(this)'>";
                                } else {
                                    echo"
                                    <img src='sources/img/pop_corn_icon.svg' class='pop_corn_icon' onclick='addLike(this)'>";
                                }

                                echo"
                                        <!-- Like\'s number -->
                                        <p class='pop_corn_number' title='".$row["video_id"]."' onclick='popupUserLike(this)'>" . $row['video_like_number'] . " J'aime</p>
                                    </div>
                                    <!-- Comment icon -->
                                    <div class='fb_jc ai-c' title=" . $row['video_id'] . " onclick='popupComment(this)' >
                                        <div class='comment_icon'></div>
                                        <p class='profile_comment_title'>";

                                // Comment's number
                                $query2 = "SELECT COUNT(*) as number FROM comments, videos WHERE comment_video_id=video_id AND video_id={$row['video_id']}";
                                $stmt2 = $db->prepare($query2);
                                $stmt2->execute();

                                $row2 = $stmt2->fetch(PDO::FETCH_ASSOC);
                                echo "
                                        <p class='profile_comment_title'><nobr>" . $row2['number'] . " commentaires</nobr></p>";

                                echo "
                                    </div>

                                    <!-- Share icon -->
                                    <div class='share_icon' title=" . $row['video_id'] . " onclick='popupShare(this)'></div>

                                </div>";
                                } else { # If the user is an asshole
                                    echo "
                                    <div class='reaction_container'>
                                    <div class='fb_jsb like_container'>
                                        <!-- Pop corn image -->
                                        <img src='sources/img/pop_corn_icon.svg' class='pop_corn_icon' onclick='popupConnexion()'>
                                        <!-- Like\'s number -->
                                        <p class='pop_corn_number' title='".$row["video_id"]."' onclick='popupUserLike(this)'>" . $row['video_like_number'] . " J'aime</p>
                                    </div>
                                    <!-- Comment icon -->
                                    <div class='fb_jc ai-c' onclick='popupConnexion()' >
                                        <div class='comment_icon'></div>
                                        <p class='profile_comment_title'>";

                                        // Comment's number
                                        $query2 = "SELECT COUNT(*) as number FROM comments, videos WHERE comment_video_id=video_id AND video_id={$row['video_id']}";
                                        $stmt2 = $db->prepare($query2);
                                        $stmt2->execute();
        
                                        $row2 = $stmt2->fetch(PDO::FETCH_ASSOC);
                                        echo "
                                                <p class='profile_comment_title'><nobr>" . $row2['number'] . " commentaires</nobr></p>";
        
                                        echo "
                                    </div>

                                    <!-- Share icon -->
                                    <div class='share_icon' onclick='popupConnexion()'></div>

                                </div>";
                                }

                                echo "
                            </div>
                            <p>" . nl2br($row['video_synopsis']) . "</p>
                        </div>


                    </div>";
                            }

                            $stmt = null;
                            $query = null;
                            $rows = null;
                        }
                        ?>


                    </div>
                </div>

                <!-- next arrow -->
                <div class="arrow_next_container fp-controlArrow fp-next">
                </div>
            </div>

            <div class="third_category" id="category3">

                <!-- Category content  -->
                <div class="classement_content">

                    <!-- Category title -->
                    <h1 id='title3'>
                        <div class="red_line title_line"></div>
                        CLASSEMENT
                    </h1>

                    <!-- Gold section -->
                    <div class="gold_container">

                        <div class="position_title">
                            <div class="gold_medal"></div>
                            <h2>1<sup>ère</sup> position</h2>
                        </div>

                        <div class="gold_medal" id="medal"></div>


                        <!-- Video container -->
                        <?php

                        if (isset($_GET["defi"])) {

                            $query = "SELECT *, DATE_FORMAT(video_duration, '%imin %ss' ) as time FROM videos, defis, users WHERE defi_id=video_defi_id AND video_user_id = user_id AND defi_id=" . $_GET["defi"] . " ORDER BY video_like_number DESC LIMIT 1";
                            $stmt = $db->prepare($query);
                            $stmt->execute();

                            $rows = $stmt->fetchall(PDO::FETCH_ASSOC);

                            foreach ($rows as $row) {

                                echo "<div class='video_container'>
        
                                <!-- Short film (class=video) -->
                                <div class='video_content'>";
            if($row['video_poster'] != ''){
                echo"
                <img src='database/videos_posters/".$row['video_poster']."' class='video_poster'>";
            }

            echo"
                                <iframe src='https://player.vimeo.com/video/" . $row['video_url'] . "' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen class='video'></iframe>

                                    <!-- Name + pp -->
                                    <a href='profil.php?id=" . $row['user_id'] . "' class='user_container'>

                                <img src='database/profile_pictures/".$row['user_profile_picture'] . "' alt=''  class='pp_profile'>

                    <p class='pseudo'>" . $row['user_username'] . "</p>
                    <div class='flou'></div>
                </a>
        
                                    <!-- Time -->
                                    <p class='time'>" . $row['time'] . "</p>
                                </div>
        
                                <!-- Short film\'s informations -->
                                <div class='description_container'>
                                    <div class='fb_jsb'>
                                        <div class='synopsis_title_container' title=" . $row['video_id'] . " onclick='popupFilm(this)'>
                                            <h3 class='synopsis_title'>" . $row['video_title'] . "</h3>
                                            <p class='see_more'>Voir plus
                                                <img src='sources/img/see_more_arrow.svg' class='see_more_arrow' alt=''>
                                                </p>
                                        </div>";

                                if (func::checkLoginState($db)) { # If the user is connected
                                    echo "
                                        <div class='reaction_container'>
                                            <div class='fb_jsb like_container'>";

                                            // <!-- Pop corn image -->
            
                                            $query10 = "SELECT COUNT(*) as nbr FROM liked WHERE liked_user_id={$_COOKIE['userid']} AND liked_video_id={$row['video_id']}";
                                            $stmt10 = $db->prepare($query10);
                                            $stmt10->execute();
            
                                            $row10 = $stmt10->fetch(PDO::FETCH_ASSOC);
            
                                            if ($row10['nbr'] >= 1) {
                                                echo"
                                                <img src='sources/img/pop_corn.png' class='pop_corn_icon' onclick='addLike(this)'>";
                                            } else {
                                                echo"
                                                <img src='sources/img/pop_corn_icon.svg' class='pop_corn_icon' onclick='addLike(this)'>";
                                            }
            
                                            echo"
                                                <!-- Like\'s number -->
                                                <p class='pop_corn_number' title='".$row["video_id"]."' onclick='popupUserLike(this)'>" . $row['video_like_number'] . " J'aime</p>
                                            </div>
                                            <!-- Comment icon -->
                                            <div class='fb_jc ai-c' title=" . $row['video_id'] . " onclick='popupComment(this)' >
                                                <div class='comment_icon'></div>
                                                <p class='profile_comment_title'>";

                                // Comment's number
                                $query2 = "SELECT COUNT(*) as number FROM comments, videos WHERE comment_video_id=video_id AND video_id={$row['video_id']}";
                                $stmt2 = $db->prepare($query2);
                                $stmt2->execute();

                                $row2 = $stmt2->fetch(PDO::FETCH_ASSOC);
                                echo "
                                        <p class='profile_comment_title'><nobr>" . $row2['number'] . " commentaires</nobr></p>";

                                echo "
                                            </div>
        
                                            <!-- Share icon -->
                                            <div class='share_icon' title=" . $row['video_id'] . " onclick='popupShare(this)'></div>
        
                                        </div>";
                                } else { # If the user is an asshole
                                    echo "
                                            <div class='reaction_container'>
                                            <div class='fb_jsb like_container'>
                                                <!-- Pop corn image -->
                                                <img src='sources/img/pop_corn_icon.svg' class='pop_corn_icon' onclick='popupConnexion()'>
                                                <!-- Like\'s number -->
                                                <p class='pop_corn_number' title='".$row["video_id"]."' onclick='popupUserLike(this)'>" . $row['video_like_number'] . " J'aime</p>
                                            </div>
                                            <!-- Comment icon -->
                                            <div class='fb_jc ai-c' onclick='popupConnexion()' >
                                                <div class='comment_icon'></div>
                                                <p class='profile_comment_title'>";

                                // Comment's number
                                $query2 = "SELECT COUNT(*) as number FROM comments, videos WHERE comment_video_id=video_id AND video_id={$row['video_id']}";
                                $stmt2 = $db->prepare($query2);
                                $stmt2->execute();

                                $row2 = $stmt2->fetch(PDO::FETCH_ASSOC);
                                echo "
                                        <p class='profile_comment_title'><nobr>" . $row2['number'] . " commentaires</nobr></p>";

                                echo "
                                            </div>
        
                                            <!-- Share icon -->
                                            <div class='share_icon' onclick='popupConnexion()'></div>
        
                                        </div>";
                                }

                                echo "
                                    </div>
                                    <p>" . nl2br($row['video_synopsis']) . "</p>
                                </div>
        
        
                            </div>";
                            }
                            $stmt = null;
                            $query = null;
                            $rows = null;
                        }
                        ?>
                    </div>

                    <!-- Silver container -->
                    <div class='gold_container'>

                        <div class='position_title'>
                            <div class="silver_medal"></div>

                            <h2>2<sup>ème</sup> position</h2>
                        </div>

                        <div class="silver_medal" id="medal"></div>

                        <?php

                        if (isset($_GET["defi"])) {

                            $query = "SELECT *, DATE_FORMAT(video_duration, '%imin %ss' ) as time FROM videos, defis, users WHERE defi_id=video_defi_id AND video_user_id = user_id AND defi_id=" . $_GET["defi"] . " ORDER BY video_like_number DESC LIMIT 1 OFFSET 1";
                            $stmt = $db->prepare($query);
                            $stmt->execute();

                            $rows = $stmt->fetchall(PDO::FETCH_ASSOC);

                            foreach ($rows as $row) {

                                echo "<!-- Video container -->
                            <div class='video_container'>
        
                                <!-- Short film (class=video) -->
                                <div class='video_content'>";
            if($row['video_poster'] != ''){
                echo"
                <img src='database/videos_posters/".$row['video_poster']."' class='video_poster'>";
            }

            echo"
                                <iframe src='https://player.vimeo.com/video/" . $row['video_url'] . "' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen class='video'></iframe>

                                    <!-- Name + pp -->
                                    <a href='profil.php?id=" . $row['user_id'] . "' class='user_container'>

                                <img src='database/profile_pictures/".$row['user_profile_picture'] . "' alt=''  class='pp_profile'>

                    <p class='pseudo'>" . $row['user_username'] . "</p>
                    <div class='flou'></div>
                </a>
        
                                    <!-- Time -->
                                    <p class='time'>" . $row['time'] . "</p>
                                </div>
        
                                <!-- Short film\'s informations -->
                        <div class='description_container'>
                            <div class='fb_jsb'>
                                <div class='synopsis_title_container' title=" . $row['video_id'] . " onclick='popupFilm(this)'>
                                    <h3 class='synopsis_title'>" . $row['video_title'] . "</h3>
                                    <p class='see_more'>Voir plus
                                        <img src='sources/img/see_more_arrow.svg' class='see_more_arrow' alt=''>
                                        </p>
                                </div>";

                                if (func::checkLoginState($db)) { # If the user is connected
                                    echo "
                                <div class='reaction_container'>
                                    <div class='fb_jsb like_container'>";

                                // <!-- Pop corn image -->

                                $query10 = "SELECT COUNT(*) as nbr FROM liked WHERE liked_user_id={$_COOKIE['userid']} AND liked_video_id={$row['video_id']}";
                                $stmt10 = $db->prepare($query10);
                                $stmt10->execute();

                                $row10 = $stmt10->fetch(PDO::FETCH_ASSOC);

                                if ($row10['nbr'] >= 1) {
                                    echo"
                                    <img src='sources/img/pop_corn.png' class='pop_corn_icon' onclick='addLike(this)'>";
                                } else {
                                    echo"
                                    <img src='sources/img/pop_corn_icon.svg' class='pop_corn_icon' onclick='addLike(this)'>";
                                }

                                echo"
                                        <!-- Like\'s number -->
                                        <p class='pop_corn_number' title='".$row["video_id"]."' onclick='popupUserLike(this)'>" . $row['video_like_number'] . " J'aime</p>
                                    </div>
                                    <!-- Comment icon -->
                                    <div class='fb_jc ai-c' title=" . $row['video_id'] . " onclick='popupComment(this)' >
                                        <div class='comment_icon'></div>
                                        <p class='profile_comment_title'>";

                                // Comment's number
                                $query2 = "SELECT COUNT(*) as number FROM comments, videos WHERE comment_video_id=video_id AND video_id={$row['video_id']}";
                                $stmt2 = $db->prepare($query2);
                                $stmt2->execute();

                                $row2 = $stmt2->fetch(PDO::FETCH_ASSOC);
                                echo "
                                        <p class='profile_comment_title'><nobr>" . $row2['number'] . " commentaires</nobr></p>";

                                echo "
                                    </div>

                                    <!-- Share icon -->
                                    <div class='share_icon' title=" . $row['video_id'] . " onclick='popupShare(this)'></div>

                                </div>";
                                } else { # If the user is an asshole
                                    echo "
                                    <div class='reaction_container'>
                                    <div class='fb_jsb like_container'>
                                        <!-- Pop corn image -->
                                        <img src='sources/img/pop_corn_icon.svg' class='pop_corn_icon' onclick='popupConnexion()'>
                                        <!-- Like\'s number -->
                                        <p class='pop_corn_number' title='".$row["video_id"]."' onclick='popupUserLike(this)'>" . $row['video_like_number'] . " J'aime</p>
                                    </div>
                                    <!-- Comment icon -->
                                    <div class='fb_jc ai-c' onclick='popupConnexion()' >
                                        <div class='comment_icon'></div>
                                        <p class='profile_comment_title'>";

                                // Comment's number
                                $query2 = "SELECT COUNT(*) as number FROM comments, videos WHERE comment_video_id=video_id AND video_id={$row['video_id']}";
                                $stmt2 = $db->prepare($query2);
                                $stmt2->execute();

                                $row2 = $stmt2->fetch(PDO::FETCH_ASSOC);
                                echo "
                                        <p class='profile_comment_title'><nobr>" . $row2['number'] . " commentaires</nobr></p>";

                                echo "
                                    </div>

                                    <!-- Share icon -->
                                    <div class='share_icon' onclick='popupConnexion()'></div>

                                </div>";
                                }

                                echo "
                            </div>
                            <p>" . nl2br($row['video_synopsis']) . "</p>
                        </div>
        
        
                            </div>";
                            }
                            $stmt = null;
                            $query = null;
                            $rows = null;
                        }
                        ?>

                    </div>

                    <!-- Bronze section -->
                    <div class='gold_container'>

                        <div class='position_title'>
                            <div class="bronze_medal"></div>

                            <h2>3<sup>ème</sup> position</h2>
                        </div>

                        <div class="bronze_medal" id="medal"></div>

                        <?php

                        if (isset($_GET["defi"])) {

                            $query = "SELECT *, DATE_FORMAT(video_duration, '%imin %ss' ) as time FROM videos, defis, users WHERE defi_id=video_defi_id AND video_user_id = user_id AND defi_id=" . $_GET["defi"] . " ORDER BY video_like_number DESC LIMIT 1 OFFSET 2";
                            $stmt = $db->prepare($query);
                            $stmt->execute();

                            $rows = $stmt->fetchall(PDO::FETCH_ASSOC);

                            foreach ($rows as $row) {

                                echo "<!-- Video container -->
                            <div class='video_container'>
        
                                <!-- Short film (class=video) -->
                                <div class='video_content'>";
            if($row['video_poster'] != ''){
                echo"
                <img src='database/videos_posters/".$row['video_poster']."' class='video_poster'>";
            }

            echo"
                                <iframe src='https://player.vimeo.com/video/" . $row['video_url'] . "' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen class='video'></iframe>

                                    <!-- Name + pp -->
                                    <a href='profil.php?id=" . $row['user_id'] . "' class='user_container'>

                                <img src='database/profile_pictures/".$row['user_profile_picture'] . "' alt=''  class='pp_profile'>

                    <p class='pseudo'>" . $row['user_username'] . "</p>
                    <div class='flou'></div>
                </a>
        
                                    <!-- Time -->
                                    <p class='time'>" . $row['time'] . "</p>
                                </div>
        
                                <!-- Short film\'s informations -->
                        <div class='description_container'>
                            <div class='fb_jsb'>
                                <div class='synopsis_title_container' title=" . $row['video_id'] . " onclick='popupFilm(this)'>
                                    <h3 class='synopsis_title'>" . $row['video_title'] . "</h3>
                                    <p class='see_more'>Voir plus
                                        <img src='sources/img/see_more_arrow.svg' class='see_more_arrow' alt=''>
                                        </p>
                                </div>";

                                if (func::checkLoginState($db)) { # If the user is connected
                                    echo "
                                <div class='reaction_container'>
                                    <div class='fb_jsb like_container'>";

                                // <!-- Pop corn image -->

                                $query10 = "SELECT COUNT(*) as nbr FROM liked WHERE liked_user_id={$_COOKIE['userid']} AND liked_video_id={$row['video_id']}";
                                $stmt10 = $db->prepare($query10);
                                $stmt10->execute();

                                $row10 = $stmt10->fetch(PDO::FETCH_ASSOC);

                                if ($row10['nbr'] >= 1) {
                                    echo"
                                    <img src='sources/img/pop_corn.png' class='pop_corn_icon' onclick='addLike(this)'>";
                                } else {
                                    echo"
                                    <img src='sources/img/pop_corn_icon.svg' class='pop_corn_icon' onclick='addLike(this)'>";
                                }

                                echo"
                                        <!-- Like\'s number -->
                                        <p class='pop_corn_number' title='".$row["video_id"]."' onclick='popupUserLike(this)'>" . $row['video_like_number'] . " J'aime</p>
                                    </div>
                                    <!-- Comment icon -->
                                    <div class='fb_jc ai-c' title=" . $row['video_id'] . " onclick='popupComment(this)' >
                                        <div class='comment_icon'></div>
                                        <p class='profile_comment_title'>";

                                // Comment's number
                                $query2 = "SELECT COUNT(*) as number FROM comments, videos WHERE comment_video_id=video_id AND video_id={$row['video_id']}";
                                $stmt2 = $db->prepare($query2);
                                $stmt2->execute();

                                $row2 = $stmt2->fetch(PDO::FETCH_ASSOC);
                                echo "
                                        <p class='profile_comment_title'><nobr>" . $row2['number'] . " commentaires</nobr></p>";

                                echo "
                                    </div>

                                    <!-- Share icon -->
                                    <div class='share_icon' title=" . $row['video_id'] . " onclick='popupShare(this)'></div>

                                </div>";
                                } else { # If the user is an asshole
                                    echo "
                                    <div class='reaction_container'>
                                    <div class='fb_jsb like_container'>
                                        <!-- Pop corn image -->
                                        <img src='sources/img/pop_corn_icon.svg' class='pop_corn_icon' onclick='popupConnexion()'>
                                        <!-- Like\'s number -->
                                        <p class='pop_corn_number' title='".$row["video_id"]."' onclick='popupUserLike(this)'>" . $row['video_like_number'] . " J'aime</p>
                                    </div>
                                    <!-- Comment icon -->
                                    <div class='fb_jc ai-c' onclick='popupConnexion()' >
                                        <div class='comment_icon'></div>
                                        <p class='profile_comment_title'>";

                                // Comment's number
                                $query2 = "SELECT COUNT(*) as number FROM comments, videos WHERE comment_video_id=video_id AND video_id={$row['video_id']}";
                                $stmt2 = $db->prepare($query2);
                                $stmt2->execute();

                                $row2 = $stmt2->fetch(PDO::FETCH_ASSOC);
                                echo "
                                        <p class='profile_comment_title'><nobr>" . $row2['number'] . " commentaires</nobr></p>";

                                echo "
                                    </div>

                                    <!-- Share icon -->
                                    <div class='share_icon' onclick='popupConnexion()'></div>

                                </div>";
                                }

                                echo "
                            </div>
                            <p>" . nl2br($row['video_synopsis']) . "</p>
                        </div>
        
        
                            </div>";
                            }
                            $stmt = null;
                            $query = null;
                            $rows = null;
                        }
                        ?>

                    </div>

                </div>
            </div>
        </div>
    </main>

    <!-- Dark filter -->
    <div class='upload_dark_filter' onclick="closePopupAddFilm()"></div>

    <!-- Pop up upload films -->
    <div class="pop_up_container upload_container">
        <form action="assets/php/upload.php" method="POST" enctype='multipart/form-data'>

            <div class="pop_up_header upload_header">
                <h2>Déposer un court-métrage</h2>
                <img src='sources/img/close_icon.svg' class='close_icon' alt='' onclick="closePopupAddFilm()">
            </div>

            <?php 
            $query = "SELECT * FROM defis WHERE defi_id = {$_GET['defi']}";
            $stmt = $db->prepare($query);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);
                echo'
                <p class="defi_title">Défi : '.$row["defi_name"].'</p>

                ';
            ?>
            <!-- Challenge's name -->

            <div class="pop_up_text upload_content">

                <!-- Inputs -->
                <div class="upload_input">
                    <div class="input_container">
                        <label for="title">
                            <span>Titre</span>
                            <input type="text" class="input_connexion" id="title" name="title" required>
                        </label>
                    </div>
                    <div class="input_container input_synopsis">
                        <label for="synopsis">
                            <span>Synopsis</span>
                            <textarea class="input_connexion input_synopsis" id="synopsis" name="synopsis" cols="30"
                                rows="10" required></textarea>
                        </label>
                    </div>
                    <div class="input_container">
                        <label for="genre">
                            <span>Genres</span>
                            <div class="input_tag_container_genre">

                            </div>
                            <input type="text" class="input_connexion" id="genre" name="genre" value="" required
                                style="display:none">

                            <select id="genre_select" required>
                                <option id="option_genre_selected" value="" selected disabled>Choisis des genres
                                </option>
                                <option id="option_genre" value="Action">Action</option>
                                <option id="option_genre" value="Comédie">Comédie</option>
                                <option id="option_genre" value="Documentaire">Documentaire</option>
                                <option id="option_genre" value="Drame">Drame</option>
                                <option id="option_genre" value="Horreur">Horreur</option>
                                <option id="option_genre" value="Intrigues">Intrigues</option>
                                <option id="option_genre" value="Policier">Policier</option>
                                <option id="option_genre" value="Romance">Romance</option>
                                <option id="option_genre" value="Science-fiction">Science-fiction</option>
                                <option id="option_genre" value="Fantastique">Fantastique</option>
                                <option id="option_genre" value="Thriller">Thriller</option>
                            </select>
                        </label>
                    </div>
                    <div class="input_container">
                        <label for="collab">
                            <span>Collaborateurs</span>
                            <input type="text" class="input_connexion" id="collab" name="collab" style="display:none">
                            <div class="input_tag_container_collab">

                            </div>
                            <select id="collab_select">
                                <option id="option_collab_selected" value="" selected disabled>Choisis des
                                    collaborateurs</option>

                                <?php
                                 $query = "SELECT * FROM users WHERE user_id != " . $_COOKIE['userid'] . ";";
                                 $stmt = $db->prepare($query);
                                 $stmt->execute();
                 
                                 $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                                 foreach($rows as $row){
                                     echo'
                                        <option id="option_collab" value="'.$row['user_username'].'" user_id="'.$row['user_id'].'">'.$row['user_username'].'</option>
                                     ';
                                 }
                                ?>
                            </select>
                        </label>
                    </div>
                </div>

                <!-- Video -->
                <div class="upload_video">
                    <!-- Input upload video -->
                    <div class="file_video btn">
                        <button class="btn file_video_btn">Sélectionner un fichier</button>
                        <input type="file" name="video" class="" accept="video/*" required>
                    </div>

<p style="color: #d60036;">Compressez votre vidéo avant de la déposer. <u>100Mo max.</u></p>
                    <!-- Video preview -->
                    <div class="preview_video"></div>

                    <!-- Input upload poster -->
                    <div class="file_poster btn">
                        <button class="btn file_poster_btn">Sélectionner une miniature</button>
                        <input type="file" name="poster" class="" accept='.jpg,.jpeg,.png'>
                    </div>
                </div>

            </div>

            <div class="upload_footer">
                <p>
                    En mettant en ligne des vidéos sur REAH, vous reconnaissez accepter les Conditions d’utilisation et
                    le
                    Règlement de la communauté de REAH. <br>
                    Veillez à ne pas enfreindre les droits d’auteur ni les droits à la vie privée d’autrui.
                </p>

                <?php # echo '<input type="text" value="'.$_GET['defi'].'" name="defi" style="display: none;">'; ?>

                <button class="btn btn_send" name="video_send" value="<?php echo $_GET['defi']; ?>">Valider</button>

            </div>
        </form>
    </div>



    <script type="text/javascript" src="assets/js/libraries/jquery/jquery.min.js">
    </script>
    <script src="assets/js/defi_details.js"></script>
    <script src="assets/js/app2.js"></script>
    <!-- <script src="assets/js/defis.js"></script> -->
    <script src="assets/js/functions.js"></script>
</body>

</html>