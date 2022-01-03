<?php 
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL); 

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: *"); 
header("Connection: keep-alive");  
header("Access-Control-Allow-Origin: *");  
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE "); 
header("Access-Control-Max-Age: 86400");  

// $table_name = $wpdb->prefix . 'awaki_process'; 
// $headers = array('Content-Type: text/html; charset=UTF-8');
$recaptchaServerToken = "6LdKO_UUAAAAACBROFWBW-PTpbVwRum3RYPlJRJN";
$logo_link = 'https://awaki-tchalim.github.io/img/logo-white-awaki-tchalim-full-stack-developper-togo-africa.png';// 'https://awaki-tchalim.github.io/img/logo-awaki-tchalim-full-stack-developper-togo-africa.png';
$site_name = 'Awaki TCHALIM';
$site_link = 'https://awaki-tchalim.github.io/';
$address = 'Totsi, Lomé, Togo <br> Tel : +228 91 41 25 05 | E-mail : awaki.tchalim@gmail.com | Site : awaki.tchalim.com';
$site = 'awaki.tchalim.com';
$primaryColor = "#2c3092";//"#2c3092";#e83b35 
$_POST = json_decode(file_get_contents("php://input"),true);

try { 
   $ip = @$_SERVER['HTTP_CLIENT_IP'] ? $_SERVER['HTTP_CLIENT_IP'] : (@$_SERVER['HTTP_X_FORWARDED_FOR'] ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR']);
   require "dbip-client.class.php";
   $addrInfo = DBIP\Address::lookup($ip);  
   $continentCode = $addrInfo -> {'continentCode'};
   $continentName = $addrInfo -> {'continentName'};
   $countryCode = $addrInfo -> {'countryCode'};
   $countryName = $addrInfo -> {'countryName'};
   $stateProv = $addrInfo -> {'stateProv'};
   $city = $addrInfo -> {'city'};  
   } catch (Exception $e) {
      echo 'Exception reçue : ',  $e->getMessage(), "\n"; 
   }

if($_POST){   
    $token = isset($_POST['token'])? $_POST['token'] : '';
    $nom = isset($_POST['nom'])? $_POST['nom'] : '';
    $prenom = isset($_POST['prenom'])? $_POST['prenom'] : '';
    $email = isset($_POST['email'])? $_POST['email'] : '';
    $tel = isset($_POST['tel'])? $_POST['tel'] : '';
    $zip = isset($_POST['zip'])? $_POST['zip'] : '';
    $message = isset($_POST['message'])? $_POST['message'] : '';
    $link = isset($_POST['link'])? $_POST['link'] : '';
    $section = isset($_POST['section'])? $_POST['section'] : '';
    $societe = isset($_POST['societe'])? $_POST['societe'] : '';
    $type = isset($_POST['type'])? $_POST['type'] : '';
    $subject = isset($_POST['subject'])? $_POST['subject'] : '';
    $body = isset($_POST['body'])? $_POST['body'] : '';
    $ville = $city; 

    /*$headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=utf-8\r\n";
    $headers .= "From: hello@tchalim.com"."\r\n";*/
    $headers = array(
      'Content-type' => 'text/html; charset=utf-8\r\n',
      'MIME-Version' => '1.0',
      'From' => 'MYWEBPROFILE <hello@tchalim.com>',
      'Reply-To' => $email,
      'Cc' => 'awaki.tchalim@gmail.com',
      'X-Mailer' => 'PHP/' . phpversion()
    );
    $url = "https://www.google.com/recaptcha/api/siteverify";
    $data=[
        'secret' => $recaptchaServerToken,
        'response' => $token,
        'remoteip' => $_SERVER['REMOTE_ADDR']
    ];

    $options = array(
        'http' => array(
        'method' => "POST",
        'header' =>
            "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => http_build_query($data)
    )); 

    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
            
    $res = json_decode($response, true);
    
    ///if($res['success']==true){  
        
        if($type=="client"){
            $_body = $body;
        }else{
            $to ='awaki.tchalim@gmail.com,awaki2010@gmail.com';
			$subject = "$site_name | $section"; 

            $MailBodyHead = "<p>Un mail vous a été envoyé depuis $site_name</p>
                <strong>TYPE : $section </strong>
                <p><br>"; 

                    $MailBody = '';
                    if($nom!=''){$MailBody .= setItem('NOM',$nom);}
                    if($prenom!=''){$MailBody .= setItem('PRENOM',$prenom);}
                    if($email!=''){$MailBody .= setItem('EMAIL',$email);}
                    if($tel!=''){$MailBody .= setItem('TELEPHONE',$tel);}
                    if($zip!=''){$MailBody .= setItem('CODE POSTAL',$zip);}
                    if($societe!=''){$MailBody .= setItem('SOCIETE',$societe);}
                    if($message!=''){$MailBody .= setItem('MESSAGE',$message);}
                    if($link!=''){$MailBody .= setItem('URL',$link);}
                    if($city!=''){$MailBody .= setItem('ENVOYE DEPUIS',$city.', '.$countryName.', '.$continentName);} 
                    
            $MailBodyFooter = ""; 

            $_body = $MailBodyHead.$MailBody.$MailBodyFooter;
            
        } 
        $mailBody = htmlEmailString($subject, $_body);    
        
          /*$resultat = $wpdb->insert($table_name, array(
            'nom' => $nom,
            'prenom' => $prenom,
            'email' => $email,
            'tel' => $tel,
            'zip' => $zip,
            'message' => $message,
            'link' => $link,
            'location' => $city.', '.$countryName.', '.$continentName, 
            'subject' => $subject, 
            'section' => $section,  
            'societe' => $societe, 
        )); */
         
        $ok = mail( $to, $subject, $mailBody, $headers );

        if($ok){
            echo json_encode(
                   array(
                       "code"=> 200,
                       "success" => true, 
                       "mail" => $ok,
                       "message" => "Engistré avec succès",
                   )
               );
        }else{
            echo json_encode(
                   array(
                       "code"=> 500,
                       "success" => false, 
                       "mail" => $ok,
                       "message" => "Une erreur s'est produite",
                   )
               );
        }
        
	/*}else{
            echo json_encode(
                   array(
                       "code"=> 500,
                       "success" => false, 
                       "message" => "Recaptcha invalide",
                   )
               );
    }*/			 
}else{
            echo json_encode(
                   array(
                       "success" => false, 
                       "message" => "Aucune donnée reçue",
                   )
               );
    }		

function setItem($title,$value){
    return "<span>$title : $value</span><br>";
}

function htmlEmailString($subject, $body)
{
  global  $logo_link,$site_name,$site_link,$address,$site,$primaryColor;
  $str = ' 
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>' . $subject . '</title>
    <style>
       
      
      img {
        border: none;
        -ms-interpolation-mode: bicubic;
        max-width: 100%; 
      }

      body {
        background-color: #f6f6f6;
        font-family: sans-serif;
        -webkit-font-smoothing: antialiased;
        font-size: 14px;
        line-height: 1.4;
        margin: 0;
        padding: 0;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%; 
      }

      table {
        border-collapse: separate;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        width: 100%; }
        table td {
          font-family: sans-serif;
          font-size: 14px;
          vertical-align: top; 
      }
 

      .body {
        background-color: #f6f6f6;
        width: 100%; 
      }

      .container {
        display: block;
        margin: 0 auto !important; 
        max-width: 580px;
        padding: 10px;
        width: 580px; 
      } 

      .content {
        box-sizing: border-box;
        display: block;
        margin: 0 auto;
        max-width: 580px;
        padding: 10px; 
      }
 
      .main {
        background: #ffffff;
        border-radius: 3px;
        width: 100%; 
      }

      .wrapper {
        box-sizing: border-box;
        padding: 20px; 
      }

      .content-block {
        padding-bottom: 10px;
        padding-top: 10px;
      }

      .footer {
        clear: both;
        margin-top: 10px;
        text-align: center;
        width: 100%; 
      }
        .footer td,
        .footer p,
        .footer span,
        .footer a {
          color: #999999;
          font-size: 12px;
          text-align: center; 
      } 

      h1,
      h2,
      h3,
      h4 {
        color: #000000;
        font-family: sans-serif;
        font-weight: 400;
        line-height: 1.4;
        margin: 0;
        margin-bottom: 30px; 
      }

      h1 {
        font-size: 35px;
        font-weight: 300;
        text-align: center;
        text-transform: capitalize; 
      }

      p,
      ul,
      ol {
        font-family: sans-serif;
        font-size: 14px;
        font-weight: normal;
        margin: 0;
        margin-bottom: 15px; 
      }
        p li,
        ul li,
        ol li {
          list-style-position: inside;
          margin-left: 5px; 
      }

      a {
        color:' . $primaryColor. ';
        text-decoration: underline; 
      }
 
      .btn {
        box-sizing: border-box;
        width: 100%; }
        .btn > tbody > tr > td {
          padding-bottom: 15px; }
        .btn table {
          width: auto; 
      }
        .btn table td {
          background-color: #ffffff;
          border-radius: 5px;
          text-align: center; 
      }
        .btn a {
          background-color: #ffffff;
          border: solid 1px' . $primaryColor. ';
          border-radius: 5px;
          box-sizing: border-box;
          color:' . $primaryColor. ';
          cursor: pointer;
          display: inline-block;
          font-size: 14px;
          font-weight: bold;
          margin: 0;
          padding: 12px 25px;
          text-decoration: none;
          text-transform: capitalize; 
      }

      .btn-primary table td {
        background-color:' . $primaryColor. '; 
      }

      .btn-primary a {
        background-color:' . $primaryColor. ';
        border-color:' . $primaryColor. ';
        color: #ffffff; 
      }
 
      .last {
        margin-bottom: 0; 
      }

      .first {
        margin-top: 0; 
      }

      .align-center {
        text-align: center; 
      }

      .align-right {
        text-align: right; 
      }

      .align-left {
        text-align: left; 
      }

      .clear {
        clear: both; 
      }

      .mt0 {
        margin-top: 0; 
      }

      .mb0 {
        margin-bottom: 0; 
      }

      .preheader {
        color: transparent;
        display: none;
        height: 0;
        max-height: 0;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        mso-hide: all;
        visibility: hidden;
        width: 0; 
      }

      .powered-by a {
        text-decoration: none; 
      }

      hr {
        border: 0;
        border-bottom: 1px solid #f6f6f6;
        margin: 20px 0; 
      }
  
      @media only screen and (max-width: 620px) {
        table[class=body] h1 {
          font-size: 28px !important;
          margin-bottom: 10px !important; 
        }
        table[class=body] p,
        table[class=body] ul,
        table[class=body] ol,
        table[class=body] td,
        table[class=body] span,
        table[class=body] a {
          font-size: 16px !important; 
        }
        table[class=body] .wrapper,
        table[class=body] .article {
          padding: 10px !important; 
        }
        table[class=body] .content {
          padding: 0 !important; 
        }
        table[class=body] .container {
          padding: 0 !important;
          width: 100% !important; 
        }
        table[class=body] .main {
          border-left-width: 0 !important;
          border-radius: 0 !important;
          border-right-width: 0 !important; 
        }
        table[class=body] .btn table {
          width: 100% !important; 
        }
        table[class=body] .btn a {
          width: 100% !important; 
        }
        table[class=body] .img-responsive {
          height: auto !important;
          max-width: 100% !important;
          width: auto !important; 
        }
      }
 
      @media all {
        .ExternalClass {
          width: 100%; 
        }
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height: 100%; 
        }
        .apple-link a {
          color: inherit !important;
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          text-decoration: none !important; 
        }
        #MessageViewBody a {
          color: inherit;
          text-decoration: none;
          font-size: inherit;
          font-family: inherit;
          font-weight: inherit;
          line-height: inherit;
        }
        .btn-primary table td:hover {
          background-color: #34495e !important; 
        }
        .btn-primary a:hover {
          background-color: #34495e !important;
          border-color: #34495e !important; 
        } 
      }

      .logo-head{
        background-color:' . $primaryColor. '; 
        height: 50px;
      }

      .sujet{
        font-weight: bold;
        font-size: 20px;
        margin-top: 25px;
        margin-bottom: 25px;
      }

        .head-site{
        text-align: right; 
        vertical-align: bottom;
        padding: 25px;
        }
        .logo{
        text-align: left;
        }
    </style>
  </head>
  <body class=""> 
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="content">
 
            <table role="presentation" class="main"> 
              <tr>
                <td class="wrapper">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr class="logo-head">
                      <td class="logo"> 
                        <img width="100px" src="' . $logo_link . '" border="0" alt="" style="margin: 10px;" />
                      </td> 
                      <td class="head-site"> 
                        <a style="color: white !important;text-decoration: none;" href="' . $site_link . '">' . $site_name . '</a>
                      </td> 
                    </tr>
                    <tr>
                      <td colspan="2"> 
                        <h3 class="sujet">' . $subject . '</h3>

                        ' . $body . '  

                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
 
            </table> 

            

            <div class="footer">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="content-block">
                    <span class="apple-link">' . $address . '</span>
                    <br> Voir sur  <a href="' . $site_link . '">' . $site_name . '</a>.
                  </td>
                </tr>
                <tr>
                  <td class="content-block powered-by">
                    <a href="' . $site . '">' . $site . '</a>.
                  </td>
                </tr>
              </table>
            </div> 

          </div>
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>
  </body>
</html> 
    ';

  return $str;
}


?>