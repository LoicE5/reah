<?php
include('config.php');

$parameter = htmlspecialchars($_GET['action']);

if($parameter == 'research'){

    $research = htmlspecialchars(addslashes($_GET['search']));

    $query = "SELECT * FROM videos, users WHERE video_user_id = user_id AND video_title LIKE '%$research%';";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $json = json_encode($results);

    echo $json;

    echo 'splitter';

    $query = "SELECT * FROM users WHERE user_username LIKE '%$research%'";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $json = json_encode($results);

    echo $json;

    echo 'splitter';


    $query = "SELECT * FROM defis WHERE defi_verified = '1' AND defi_name LIKE '%$research%'";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $json = json_encode($results);

    echo $json;
    
} else if($parameter == 'addLike'){

    $video_vimeo_id = htmlspecialchars($_GET['video']);
    $cookie_user_id = $_COOKIE['userid'];

    $query = "SELECT video_like_number, video_id FROM videos WHERE video_url = $video_vimeo_id";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $initial_count = $results[0]['video_like_number'];
    $video_id = $results[0]['video_id'];

    $final_count = $initial_count+1;
    echo $final_count;

    $query = "UPDATE videos SET video_like_number = $final_count  WHERE video_url = $video_vimeo_id; INSERT INTO liked(liked_user_id, liked_video_id) VALUE ('$cookie_user_id', '$video_id');";
    $stmt = $db->prepare($query);
    $stmt->execute();
}
 else if($parameter == 'removeLike') {
    $video_vimeo_id = htmlspecialchars($_GET['video']);
    $cookie_user_id = $_COOKIE['userid'];

    $query = "SELECT video_like_number, video_id FROM videos WHERE video_url = $video_vimeo_id";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $initial_count = $results[0]['video_like_number'];
    $video_id = $results[0]['video_id'];

    $final_count = $initial_count-1;
    echo $final_count;

    $query = "UPDATE videos SET video_like_number = $final_count WHERE video_url = $video_vimeo_id; DELETE FROM liked WHERE liked_user_id = '$cookie_user_id' AND liked_video_id ='$video_id';";
    $stmt = $db->prepare($query);
    $stmt->execute();
}
else if($parameter == 'save') {
    $video_id = htmlspecialchars($_GET['video']);
    $cookie_user_id = $_COOKIE['userid'];

    $query = "INSERT INTO saved(saved_user_id, saved_video_id) VALUE ('$cookie_user_id', '$video_id');";
    $stmt = $db->prepare($query);
    $stmt->execute();
}
else if($parameter == 'unsave') {
    $video_id = htmlspecialchars($_GET['video']);
    $cookie_user_id = $_COOKIE['userid'];

    $query = "DELETE FROM saved WHERE saved_user_id = '$cookie_user_id' AND saved_video_id ='$video_id';";
    $stmt = $db->prepare($query);
    $stmt->execute();
}

function oldAddLike($onlyHereForArchivePurposes,$db){

    $video_vimeo_id = htmlspecialchars($_GET['video']);


    /*⬇ COOKIE check phase ⬇*/
    $cookie_user_id = $_COOKIE['userid'];

    consoleLog($cookie_user_id);
    
    /*⬇ SQL ⬇*/
    $hasLiked_query = "SELECT user_has_liked FROM users WHERE user_id LIKE $cookie_user_id;";
    $stmt = $db->prepare($hasLiked_query);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    /*⬆ SQL ⬆*/

    /*⬇ JSON ⬇*/
    $liked_json = json_encode($results[0]);
    $liked_table = json_decode($liked_json,true);
    /*⬆ JSON ⬆*/

    $has_liked_string = $liked_table['user_has_liked'];
    $table = transformToArray($has_liked_string);

    $checkBool = false;

    foreach($table as $tab){
        consoleLog($tab);
       if($video_vimeo_id == $tab){
            $checkBool = true;
       }
    }

    consoleLog($checkBool);
    /*⬆ COOKIE check phase ⬆*/



    /*⬇ GET DATA ⬇*/

    $query = "SELECT video_like_counter FROM videos WHERE video_vimeo_id LIKE $video_vimeo_id";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $initial_count = $results[0]['video_like_counter'];

    // echo $initial_count;
    if(!$checkBool){
        $final_count = $initial_count+1;
    } else if ($checkBool){
        $final_count = $initial_count-1;
    }

    // echo $final_count;
    /*⬆ GET DATA ⬆*/

    /*⬇ SEND DATA ⬇*/
    $query = "UPDATE videos SET video_like_counter = $final_count WHERE video_vimeo_id LIKE $video_vimeo_id";

    $stmt = $db->prepare($query);
    $stmt->execute();

    // ---------------

    if(!$checkBool){
        $send = $has_liked_string.$video_vimeo_id.',';
        consoleLog($send);
        $query = "UPDATE users SET user_has_liked = '$send' WHERE user_id LIKE $cookie_user_id";
        consoleLog($query);

        $stmt = $db->prepare($query);
        $stmt->execute();
    } else if($checkBool){
        $send = chop($has_liked_string,$video_vimeo_id.',');
        consoleLog($send);
        $query = "UPDATE users SET user_has_liked = '$send' WHERE user_id LIKE $cookie_user_id";
        consoleLog($query);

        $stmt = $db->prepare($query);
        $stmt->execute();
    }
    /*⬆ SEND DATA ⬆*/

    /*⬇ RE-GET DATA ⬇*/
    $query = "SELECT video_like_counter FROM videos WHERE video_vimeo_id LIKE $video_vimeo_id";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $rslt = $results[0]['video_like_counter'];

    echo $rslt;
}






?>