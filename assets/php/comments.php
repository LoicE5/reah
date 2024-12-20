<?php

// --------------------------------- Commentaires --------------------------------

// Ajout d'un commentaire
if (isset($_POST['comment_send'])) {

    $query = "SELECT * FROM videos, comments WHERE comment_id = " . $_POST['comment_send'] . " AND comment_video_id = video_id;";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $sql = "INSERT INTO comments (comment_content, comment_video_id, comment_user_id) VALUES (:content, :video_id, :user_id)";
    
    $attributes = array(
        'content' => addslashes($_POST["comment_content"]),
        'video_id' => $_POST['comment_send'],
        'user_id' => $_COOKIE['userid'],
    );
    
    $stmt = $db->prepare($sql);
    
    $stmt->execute($attributes);
    
    // header('Location: defi_details.php?defi='.$row['video_defi_id']);
}


// Signalement d'un commentaire
if (isset($_GET['report_comment'])) {

    $message_true = 'Ton signalement a bien été pris en compte.';

    $comment_id = $_GET['report_comment'];
    $user_id = $_COOKIE['userid'];

    $query = "SELECT * FROM comments WHERE comment_id= $comment_id";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    $report_user_id = $row["comment_report_id"].','.$user_id;

    $sql = "UPDATE comments SET comment_report_id='$report_user_id' WHERE comment_id='$comment_id'";

    $stmt = $db->prepare($sql);

    $stmt->execute();

    // header('Location: fil_actu.php?accueil=true');
}

// Signalement d'un film
if (isset($_GET['report_video'])) {

    $message_true = 'Ton signalement a bien été pris en compte.';

    $video_id = $_GET['report_video'];
    $user_id = $_COOKIE['userid'];

    $query = "SELECT * FROM videos WHERE video_id= $video_id";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    $report_user_id = $row["video_report_id"].','.$user_id;

    $sql = "UPDATE videos SET video_report_id='$report_user_id' WHERE video_id='$video_id'";

    $stmt = $db->prepare($sql);

    $stmt->execute();

    // header('Location: fil_actu.php?accueil=true');
}

// Supression d'un court-métrage
if (isset($_POST['video_delete'])) {

    $video_id = $_POST['video_delete'];
    
    $query = "SELECT video_title, video_url FROM videos WHERE video_id = '$video_id';";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $sql = "DELETE FROM videos WHERE video_id='$video_id'; DELETE FROM distribution WHERE distribution_video_id = '{$row['video_url']}'; DELETE FROM comments WHERE comment_video_id = '$video_id'; DELETE FROM saved WHERE saved_video_id = '$video_id'; DELETE FROM liked WHERE liked_video_id = '$video_id'";

    $stmt = $db->prepare($sql);

    $stmt->execute();
    
    $message_true='Ton court-métrage '.$row['video_title'].' a bien été supprimé.';

}

// Signalement d'un film
if (isset($_POST['modify_film_btn'])) {


    $video_id = $_POST['modify_film_btn'];
    $video_title = addslashes($_POST['title']);
    $video_synopsis = addslashes($_POST['synopsis']);

    $content_dir_poster = 'database/videos_posters/';
    $tmp_file_poster = $_FILES['poster']['tmp_name'];
    $name_file_poster = basename($_FILES['poster']['name']);

    $message_true = 'Ton court-métrage '. $video_title .' a bien été modifié.';


    if ($_FILES["poster"]['error'] == 0 ) {

        if(!is_uploaded_file($tmp_file_poster)) {
            $message_false = "Le fichier est introuvable.";
        }
    
        if(!move_uploaded_file($tmp_file_poster, $content_dir_poster . $name_file_poster)){
            $message_false = "Impossible de copier le fichier dans notre dossier.";
        }

        $sql = "UPDATE videos SET video_poster='$name_file_poster', video_title='$video_title', video_synopsis='$video_synopsis' WHERE video_id='$video_id'";
    } else {
        $sql = "UPDATE videos SET video_title='$video_title', video_synopsis='$video_synopsis' WHERE video_id='$video_id'";

    }

    $stmt = $db->prepare($sql);

    $stmt->execute();
}
?>