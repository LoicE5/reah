<?php include('assets/php/config.php'); ?>
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>REAH | Inscription</title>
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="stylesheet" href="assets/css/inscription.css">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">

</head>

<body>


    <a href="fil_actu.php" class="reah_logo">
        <img src="sources/img/dark_reah_logo.png" alt="">
    </a>


    <?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require 'assets/PHPMailer/src/Exception.php';
require 'assets/PHPMailer/src/PHPMailer.php';
require 'assets/PHPMailer/src/SMTP.php';

$global_wrapper_visibility = false;


if(func::checkLoginState($db) ){
    redirect('index.php');
}

$user_email = $_GET['client_email'];

$query = "SELECT * FROM users WHERE user_email = '$user_email';";

$stmt = $db->prepare($query);
$stmt->execute();

$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!isset($_GET['client_email'])){
    redirect('signup.php');
}else {
    if(count($row['user_email']) < 1){
        redirect('signup.php');
    }
}

if(isset($_POST['code1']) 
    && isset($_POST['code2']) 
    && isset($_POST['code3']) 
    && isset($_POST['code4']) 
    && isset($_POST['code5']) 
    && isset($_POST['code6'])){

        $code = $_POST['code1'].$_POST['code2'].$_POST['code3'].$_POST['code4'].$_POST['code5'].$_POST['code6'];

        $query = "SELECT * FROM users WHERE user_email = '$user_email'";
        $stmt = $db->prepare($query);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row['user_email_verify'] != $code){
            // $sql = "DELETE FROM users WHERE user_email='$user_email'";

            // $stmt = $db->prepare($sql);
        
            // $stmt->execute();
            $message_false = "Le code saisi est incorrecte.";
        } else {
            redirect('login.php?signup=true');
            $sql = "UPDATE users SET user_status='1'";
        
            $stmt = $db->prepare($sql);
        
            $stmt->execute();
        }
    
    $global_wrapper_visibility = true;
} 

if(isset($_GET['code_reset'])){
    echo '<p class="message_true_container">Un nouveau code vous a été envoyé.</p>';
    
    $new_code = random_int(100000, 999999);

    $sql = "UPDATE users SET user_email_verify='$new_code' WHERE user_email='$user_email'";
        
    $stmt = $db->prepare($sql);

    $stmt->execute();

    mail($user_email, 'Confirmation de l\'adresse e-mail', "Voici le code pour confirmer ton adresse e-mail : ".$new_code);

}

if (isset($message_false)) {
    echo '<p class="message_false_container">'.$message_false.'</p>';
}

if (isset($message_true)) {
    echo '<p class="message_true_container">'.$message_true.'</p>';
}

?>


    <main class="main_content">
        <div id="global-wrapper">
            <!-- Background video -->
            <video class="background_video" poster="" autoplay loop muted>
                <source src="sources/video/videobackPT.mp4" type="video/mp4">
            </video>

            <form id="form2" action="" method="POST">


                <div class="form_container3" style="display: flex !important;">

                    <!-- Back arrow -->
                    <svg class="btn_prev2" xmlns="http://www.w3.org/2000/svg" width="31.621" height="25.241"
                        viewBox="0 0 31.621 25.241">
                        <g class="fleche" id="Groupe_12" data-name="Groupe 12" transform="translate(-754.379 -406.379)">
                            <line class="line2" id="Ligne_12" data-name="Ligne 12" x1="0" x2="27"
                                transform="translate(756.5 418.5)" fill="none" stroke="#efe4ef" stroke-linecap="round"
                                stroke-width="3" />
                            <line class="line2" id="Ligne_13" data-name="Ligne 13" y1="10" x2="10"
                                transform="translate(756.5 408.5)" fill="none" stroke="#efe4ef" stroke-linecap="round"
                                stroke-width="3" />
                            <line class="line2" id="Ligne_14" data-name="Ligne 14" x2="10" y2="10.9"
                                transform="translate(756.5 418.6)" fill="none" stroke="#efe4ef" stroke-linecap="round"
                                stroke-width="3" />
                        </g>
                    </svg>

                    <!-- Input validation code -->
                    <p id="mail">Entre le code de validation envoyé à <?php echo $user_email; ?> : <span
                            class="mailcontainer"></span> </p>
                    <!-- <p>Cette partie ne marche pas mais tu es bel et bien inscrit, va te connecter !</p> -->
                    <div class="input_confirm_container">
                        <input class="input_connexion input_confirm third_form" maxlength="1" type="text"
                            pattern="[0-9]{1}" onKeyUp="suivant(this,'code2', 1)" id="code1" name="code1" required>
                        <input class="input_connexion input_confirm third_form" type="text" pattern="[0-9]{1}"
                            maxlength="1" onKeyUp="suivant(this,'code3', 1)" id="code2" name="code2" required>
                        <input class="input_connexion input_confirm third_form" type="text" pattern="[0-9]{1}"
                            maxlength="1" onKeyUp="suivant(this,'code4', 1)" id="code3" name="code3" required>
                        <input class="input_connexion input_confirm third_form" type="text" pattern="[0-9]{1}"
                            maxlength="1" onKeyUp="suivant(this,'code5', 1)" id="code4" name="code4" required>
                        <input class="input_connexion input_confirm third_form" type="text" pattern="[0-9]{1}"
                            maxlength="1" onKeyUp="suivant(this,'code6', 1)" id="code5" name="code5" required>
                        <input class="input_connexion input_confirm third_form" type="text" pattern="[0-9]{1}"
                            maxlength="1" onKeyUp="suivant(this,'code6', 1)" id="code6" name="code6" required>
                    </div>

                    <!-- Link haven't received the code.  -->
                    <a href="email_verify.php?client_email=<?php echo $user_email; ?>&code_reset=true" class="link">Je
                        n'ai pas reçu de code</a>

                    <!-- Validation button -->
                    <button class="btn btn_connexion cannot_click">Valider</button>
                </div>
            </form>
        </div>
    </main>

    <script type="text/javascript" src="assets/js/libraries/jquery/jquery.min.js"></script>
    <script src="assets/js/app.js"></script>
    <script src="assets/js/register.js"></script>
    <script>
        function suivant(enCours, suivant, limite) {
            //   console.log(enCours.value.length);
            //   console.log(suivant);

            if (enCours.value.match(/[^0-9]/)) {
                enCours.value = enCours.value.replace(/[^0-9]/, '');
            } else {

                if (enCours.value >= '0')
                    document.getElementById(suivant).focus();
            }


            const inputList = document.querySelectorAll("input");
            for (let i = 0; i < inputList.length; i++) {



                // console.log(inputList[i].value);
                console.log(inputList[5].value);
                if (inputList[0].value != '' && inputList[1].value != '' && inputList[2].value != '' && inputList[3]
                    .value != '' && inputList[4].value != '' && inputList[5].value != '') {
                    $('.btn_connexion').addClass('can_click');
                } else {
                    $('.btn_connexion').removeClass('can_click');
                }
            }
        }
    </script>

    <?php
            if($global_wrapper_visibility){
                makeVisible('#global-wrapper',true);
            }
        ?>
</body>

</html>