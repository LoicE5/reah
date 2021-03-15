<?php
// ini_set('display_errors',1);
// ini_set('display_startup_errors',1);
    include('assets/php/config.php');
    require("ressources/pop_up_film_information.php");
?>
<?php
    if(!func::checkLoginState($db)){ # If the user isn't connected
        redirect('login.php');
    } else {
        if(isset($_GET['id'])){
            $query = "SELECT * FROM users WHERE user_id = ".$_GET['id'].";";
            $stmt = $db->prepare($query);
            $stmt->execute();
    
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
        $query = "SELECT * FROM users WHERE user_id = ".$_COOKIE['userid'].";";
        $stmt = $db->prepare($query);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
    }
}

if(isset($_GET["modify_btn"]) && isset($_GET["username"])){

    $id = $_COOKIE['userid'];
    $username = $_GET['username'];
      $profile_picture = $_GET['profile_picture'];
      $banner = $_GET['banner'];
      $name = $_GET['name'];
      $website = $_GET['website'];
      $bio = $_GET['bio'];

    if(isset($_GET["profile_picture"]) && isset($_GET["banner"])){
        $sql = "UPDATE users SET user_username='$username', user_profile_picture='$profile_picture', user_banner='$banner', user_name='$name', user_website='$website', user_bio='$bio' WHERE user_id='$id'";
      }

    else if(isset($_GET["profile_picture"])){
        $sql = "UPDATE users SET user_username='$username', user_profile_picture='$profile_picture', user_name='$name', user_website='$website', user_bio='$bio' WHERE user_id='$id'";
    }

    else if(isset($_GET["banner"])){
        $sql = "UPDATE users SET user_username='$username', user_banner='$banner', user_name='$name', user_website='$website', user_bio='$bio' WHERE user_id='$id'";
    }

    else {
        $sql = "UPDATE users SET user_username='$username', user_name='$name', user_website='$website', user_bio='$bio' WHERE user_id='$id'";

    }

    $stmt = $db->prepare($sql);

    $stmt->execute();

    header('Location: profil.php?success=true');
}
?>

<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>>REAH | Profil</title>
    <link rel="stylesheet" href="assets/css/dark_mode.css">
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="stylesheet" href="assets/css/fil_actu.css">
    <link rel="stylesheet" href="assets/css/profil.css">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="assets/css/fullpage.css" />
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.4.1/jquery.min.js"></script>
    <script src="assets/js/functions.js" defer></script>
</head>

<body>

<?php
    if (isset($_GET['success'])) {
        echo'
        <div class="message_container">
                Ton profil a bien été modifié !
        </div>';
    }
    ?>
    <main class="main_content">

        <!-- Navigation menu -->
        <nav class="menu_nav">

            <!-- Logo Réah -->
            <a href="fil_actu.php" class="reah_logo"></a>

            <!-- Search bar -->
            <form action="" class="form_search_bar">
                <input class="search_bar" type="text" placeholder="Défis, courts-métrages, utilisateurs...">
            </form>

            <?php
                 if(func::checkLoginState($db)){ # If the user is connected
                    $query = "SELECT * FROM users WHERE user_id = ".$_COOKIE['userid'].";";
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
                    <div style='background: url(data:image/jpg;base64," . base64_encode($row['user_profile_picture']) .") no-repeat center/cover'  class='menu_pp' onclick='toggleBurgerMenu()'></div>
                    </div>
                    </nav>";
                    
                } else {
                    echo "<div class='menu_profile'>
                    <!-- Fil actu icon -->
                    <form action='fil_actu.php' method='GET'>
                    <button type='submit' name='accueil' class='fil_actu_icon' value='true'></button>
                    </form>
                    <!-- Defi icon -->
                    <a href='defis.php' class='defi_icon'></a>
                    <!-- Profile photo -->
                    <div class='se-connecter menu_pp_icon' onclick='redirect(`login.php`)' onload='SVGInject(this)'>
                    </div>
                    </nav>";
                }
            ?>
        </nav>

        <!-- Menu -->
        <?php
            require("ressources/menu.php");
        ?>


        <div class="banner_container">
            <div class="banner_flou_left"></div>
            <?php
                    echo"<div style='background: url(data:image/jpg;base64," . base64_encode($row['user_banner']) .") no-repeat center/cover' alt=''  class='banner'></div>";
                ?>
            <div class="banner_flou_right"></div>
        </div>

        <div class="profile_container">

            <div class="fb_jsa profile_content1">
                <!-- Subscription section -->
                <div class="fb_c ai-c">
                    <div class="fb_jsb profile_subscription_container">
                        <div class="profile_subscription_content" number="1">
                            <p class="fb profile_subscription_number">1213</p>
                            <div class="red_line profile_subscription_line"></div>
                            <p class="profile_subscription_title">Abonnés</p>
                        </div>

                        <div class="profile_subscription_content" number="2">
                            <p class="fb profile_subscription_number">2000</p>
                            <div class="red_line profile_subscription_line"></div>
                            <p class="profile_subscription_title">Abonnements</p>
                        </div>
                    </div>


                    <!-- Subcription btn -->
                    <?php
                    if(isset($_GET['id'])){ #if the profile is an other user's profile
                        $query = "SELECT * FROM users WHERE user_id = ".$_GET['id'].";";
                        $stmt = $db->prepare($query);
                        $stmt->execute();
                
                        $row = $stmt->fetch(PDO::FETCH_ASSOC);
                        echo'
                            <div class="fb ai-c">
                                <div class="btn subscribe_btn">S\'abonner</div>
                                <img src="sources/img/modify_icon.svg" class="modify_icon modify_icon2" alt="">
                            </div>';
                    }
                    ?>
                </div>


                <!-- Profile photo + username -->
                <?php
                    echo"<div style='background: url(data:image/jpg;base64," . base64_encode($row['user_banner']) .") no-repeat center/cover' alt=''  class='profile_photo'></div>";
                ?>
            </div>

            <div class="fb_jsb profile_content2">
                <div class="fb profile_bio_container">
                    <?php
                        echo '<p class="profile_username">'.$row['user_username'].'</p>';
                    ?>
                    <div class="red_line profile_line"></div>
                    <?php 
                        echo '<p class="profile_name">'.$row['user_name'].'</p>';
                    ?>
                    <?php 
                        echo '<p class="profile_bio">'.$row['user_bio'].'</p>';
                    ?>
                       <?php 
                        echo '<a target="_blank" href="https://'.$row['user_website'].'" class="profile_website">'.$row['user_website'].'</a>';
                    ?>
                </div>

                <!-- Modify icon -->

                <?php
                    if(isset($_GET['id'])){ #if the profile is an other user's profile
                        $query = "SELECT * FROM users WHERE user_id = ".$_GET['id'].";";
                        $stmt = $db->prepare($query);
                        $stmt->execute();
                
                        $row = $stmt->fetch(PDO::FETCH_ASSOC);
                        echo"
                        <div class='user_settings'>
                        <div class='user_settings_icon' onclick='userSettings()'>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>";
        
                        echo"
                        <div class='user_settings_container'>
                            <div>Signaler</div>
                            <div>Bloquer</div>
                        </div>
                    </div>";
                    
                    } else {
                        echo'
                        <img src="sources/img/modify_icon.svg" class="modify_icon" alt="">';
                    }
                    ?>
                <div class="fb_c">
                </div>
            </div>
        </div>

        <!-- Realisations's number -->

        <div class="fb_jc realisation_number_container">
            <div class="fb_jsb realisation_number_content">
                <p class="realisation_number_content_title realisation_number_content_title1" number="2"><span
                        class="realisation_number_content_number ">20</span> réalisations </p>
                <p class="realisation_number_content_title realisation_number_content_title2" number="1"><span
                        class="realisation_number_content_number">80</span> identifiés </p>
                <div class="red_line realisation_number_content_line"></div>
            </div>
        </div>


        <!-- All realisations -->
        <div class="all_realisation_container">

            <!-- Realisations's videos -->
            <div class="realisation_container">

                <?php
                // $requete="SELECT title,username,url,DATE_FORMAT(duration, '%imin %s' ) AS duration,synopsis,poster,photo FROM re_films, re_users, re_a_realise WHERE id_films=realise_ext_films AND id_users=realise_ext_users";
                // $stmt=$db->query($requete);
                // $resultat=$stmt->fetchall(PDO::FETCH_ASSOC);
                // foreach($resultat as $films){
                    echo "

                <!-- Video container -->
                <div class='video_container'>

                    <!-- Short film -->
                    <div class='video_content'>
                        <video class='video' poster='{$films["poster"]}' muted>
                            <source src='{$films["url"]}' type='video/mp4'>
                        </video>

                        <!-- Time -->
                        <p class='time'>{$films["duration"]}</p>
                    </div>

                    <!-- Short film\'s informations -->
                    <div class='description_container'>
                        <div class='reaction_container'>
                            <div class='fb_jsb'>

                                <!-- Pop corn image -->
                                <img class='pop_corn_icon' src='sources/img/pop_corn.png' alt=''>
                                <!-- Like\'s number -->
                                <p class='pop_corn_number'>515 J'aime</p>
                            </div>

                            <!-- Comment icon -->
                            <div class='fb_jc ai-c'>
                                <div class='comment_icon'></div>
                                <p class='profile_comment_title'><nobr>1 925 commentaires</nobr></p>
                            </div>

                            <!-- Share icon -->
                            <div class='fb_jsb share_container'>
                                <div class='share_icon'></div>
                                <p class='share_title'>Partager</p>
                            </div>
                        </div>

                        <div class='fb_c_jsb'>
                            <div class='synopsis_title_container' >
                                <h3 class='synopsis_title'>{$films["title"]}</h3>
                                <p class='see_more'>Voir plus
                                <img src='sources/img/see_more_arrow.svg' class='see_more_arrow' alt=''>
                                </p>
                            </div>
                    
                        <p>{$films["synopsis"]}</p>


                        </div>
                    </div>


                </div>

                ";
                // }

                ?>
            </div>

            <!-- Identified's videos -->
            <div class="identified_container">

                <?php
                // $requete="SELECT title,username,url,DATE_FORMAT(duration, '%imin %s' ) AS duration,synopsis,poster,photo FROM re_films, re_users, re_a_realise WHERE id_films=realise_ext_films AND id_users=realise_ext_users";
                // $stmt=$db->query($requete);
                // $resultat=$stmt->fetchall(PDO::FETCH_ASSOC);
                // foreach($resultat as $films){
                echo "

                <!-- Video container -->
                <div class='video_container'>

                    <!-- Short film -->
                    <div class='video_content'>
                        <video class='video' poster='{$films["poster"]}' muted>
                            <source src='{$films["url"]}' type='video/mp4'>
                        </video>

                        <!-- Name + pp -->
                        <div class='user_container'>
                            <img src='{$films["photo"]}' class='pp_profile' alt=''>
                            <p class='pseudo'>{$films["username"]}</p>
                            <div class='flou'></div>
                        </div>

                        <!-- Time -->
                        <p class='time'>{$films["duration"]}</p>
                    </div>

                    <!-- Short film\'s informations -->
                    <div class='description_container'>
                        <div class='reaction_container'>
                            <div class='fb_jsb'>

                                <!-- Pop corn image -->
                                <img class='pop_corn_icon' src='sources/img/pop_corn.png' alt=''>
                                <!-- Like\'s number -->
                                <p class='pop_corn_number'>515 J'aime</p>
                            </div>

                            <!-- Comment icon -->
                            <div class='fb_jc ai-c'>
                                <div class='comment_icon'></div>
                                <p class='profile_comment_title'><nobr>1 925 commentaires</nobr></p>
                            </div>

                            <!-- Share icon -->
                            <div class='fb_jsb share_container'>
                                <div class='share_icon'></div>
                                <p class='share_title'>Partager</p>
                            </div>
                        </div>

                        <div class='fb_c_jsb'>
                            <div class='synopsis_title_container' >
                                <h3 class='synopsis_title'>{$films["title"]}</h3>
                                <p class='see_more'>Voir plus
                                <img src='sources/img/see_more_arrow.svg' class='see_more_arrow' alt=''>
                                </p>
                            </div>
                    
                        <p>{$films["synopsis"]}</p>


                        </div>
                    </div>


                </div>

                ";
                // }
                ?>
            </div>
        </div>
    </main>

    <!-- Modify btn -->
    <div class="pop_up_container modify_container">
        <form action="profil.php" method="get">
            <!-- Close icon -->
            <img src='sources/img/close_icon.svg' class='modify_close_icon' alt=''>

            <!-- Banner -->
                <?php
                    echo"<div style='background: url(data:image/jpg;base64," . base64_encode($row['user_banner']) .") no-repeat center/100%' alt=''  class='modify_banner'></div>";
                ?>

            <div class="modify_profile_photo_container">
                <!-- Profile photo -->
             <?php
                    echo"<div style='background: url(data:image/jpg;base64," . base64_encode($row['user_banner']) .") no-repeat center/cover' alt=''  class='modify_profile_photo'></div>";
                ?>

                <div class="modify_file_container">
                    <!-- Input banner -->
                    <div class="modify_file_banner btn">
                        <button class="btn modify_btn_banner">Modifier la bannière</button>
                        <input type="file" class="" name="banner">
                    </div>
                    <!-- Input profile photo -->
                    <div class="modify_file_profile_photo btn">
                        <button class="btn modify_btn_profile_photo">Modifier la photo de profil</button>
                        <input type="file" class="" name="profile_picture">
                    </div>

                </div>
            </div>
            <!-- Inputs username, name, bio.. -->
            <div class="modify_input_container">
                <div class="input_container">
                    <label for="username">
                        <span>Nom d'utilisateur</span>
                        <input type="text" class="input_connexion" id="username" name="username"
                            value="<?php echo $row['user_username'];?>" required>
                    </label>
                </div>
                <div class="input_container">
                    <label for="name">
                        <span>Nom</span>
                        <input type="text" class="input_connexion" id="name" name="name"
                            value="<?php echo $row['user_name'];?>">
                    </label>
                </div>
                <div class="input_container">
                    <label for="website">
                        <span>Site web</span>
                        <input type="text" class="input_connexion" id="website" name="website"
                            value="<?php echo $row['user_website'];?>">
                    </label>
                </div>
                <div class="input_container">
                    <label for="bio">
                        <span>Bio</span>
                        <textarea class="input_connexion input_bio" id="bio" name="bio" cols="30"
                            rows="6"><?php echo $row['user_bio'];?>"</textarea>
                    </label>
                </div>

                <input type="submit" class="btn modify_btn" name="modify_btn" value="Modifier">
            </div>
        </form>
    </div>

    <!-- Subscribers and subsciptions page -->
    <div class="pop_up_container subscription_container">
        <div class="pop_up_header subscription_header">
            <!-- Username -->
            <h2><?php echo $row['user_username'];?></h2>
            <!-- Close icon -->
            <img src='sources/img/close_icon.svg' class='close_icon' alt=''>
        </div>

        <!-- Title -->
        <div class="subsciption_title_container">
            <div class="subscription_title1 subscriber_title" number="2"><span
                    class="realisation_number_content_number ">1213 </span> Abonnés</div>
            <div class="subscription_title2 subscription_title" number="1"><span
                    class="realisation_number_content_number ">2000 </span> Abonnements</div>
            <div class="red_line subscription_line"></div>
        </div>

        <div class="pop_up_text subscription_content">
            <!-- All subscribers -->
            <div class="subscriber_section">

                <!-- User -->
                <div class="subscription_user">
                    <div class="subcription_pp"></div>
                    <div class="subscription_username_container">
                        <div class="subscription_username">Jstm</div>
                        <div class="subscription_name">Julie Saint Martin</div>
                    </div>
                    <div class="btn subscriber_user_btn">Supprimer</div>
                </div>

                <!-- User -->
                <div class="subscription_user">
                    <div class="subcription_pp"></div>
                    <div class="subscription_username_container">
                        <div class="subscription_username">Jstm</div>
                        <div class="subscription_name">Julie Saint Martin</div>
                    </div>
                    <div class="btn subscriber_user_btn">Supprimer</div>
                </div>

            </div>

            <!-- All subscriptions -->
            <div class="subscription_section">

                <!-- User -->
                <div class="subscription_user">
                    <div class="subcription_pp"></div>
                    <div class="subscription_username_container">
                        <div class="subscription_username">Jstm</div>
                        <div class="subscription_name">Julie Saint Martin</div>
                    </div>
                    <div class="btn subscription_user_btn subcribe_btn_click">Abonné(e)</div>
                </div>

                <!-- User -->
                <div class="subscription_user">
                    <div class="subcription_pp"></div>
                    <div class="subscription_username_container">
                        <div class="subscription_username">Jstm</div>
                        <div class="subscription_name">Julie Saint Martin</div>
                    </div>
                    <div class="btn subscription_user_btn subcribe_btn_click">Abonné(e)</div>
                </div>
            </div>
        </div>

    </div>

    <div class="unfollow_dark_filter"></div>

    <!-- Unfollow pop up-->
    <div class="pop_up_container unfollow_container">
        <div class="pop_up_header">
            <h2>Se désabonner</h2>
            <img src='sources/img/close_icon.svg' class='unfollow_close_icon' alt=''>
        </div>
        <p class="pop_up_text">Se désabonner de <?php echo $row['user_username']; ?> ?</p>
        <div class="btn pop_up_btn unfollow_btn">Se désabonner</div>
    </div>

    <script src="assets/js/profil.js"></script>
    <script src="assets/js/app2.js"></script>
    <script src="assets/js/functions.js"></script>
    <!-- <script src="assets/js/fil_actu.js"></script> -->
</body>

</html>