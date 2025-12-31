<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="../tmi.min.js"></script>
    <script src="../ChatBot.js"></script>
    <script src="tamagoTwitch.js"></script>
    <link rel="stylesheet" href="tamagoTwitch.css">
    <title>TamagoTwitch</title>
</head>

<body>
        <div class="tamagoTwitch">

        </div>
        <script>
            //Bot 
             var bot = new GameBot("GAMEBOT", ["d4rkh0und"]);
        bot.mInterval = 2;
        bot.setIgnore("WizeBot");
        bot.setIgnore("wizebot");
        bot.setIgnore("streamelements");
            let tamago=new tamagoTwitch("myTamago",bot,document.querySelector(".tamagoTwitch"));
            tamago.display();
        </script>
</body>

</html>