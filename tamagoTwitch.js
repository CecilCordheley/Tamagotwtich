function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

class tamagoTwitch {
    constructor(name, bot, container) {
        this.name = name;
        this.stat = {
            joy: 0,
            fear: 0,
            angry: 100
        }
        this.bot = bot;
        this.container = container;
        this.viewer = {}
        this.feed = 0;
        this.maxFeed = 255;
        this.queue = [];

        this.feedType = {
            cake: 50,
            biscuit: 25
        };
        this.angryInterval = 0;
        this.initDisplay();
        this.initBot();
        this.feelAngry();
        this.startMoodLoop();
    }
    clampStat(value, min = 0, max = 255) {
        return Math.min(max, Math.max(min, value));
    }

    feelAngry() {
        if (this.angryInterval) return;

        this.angryInterval = setInterval(() => {
            if (this.stat.angry < 255)
                this.stat.angry += 1;
            else {
                clearInterval(this.angryInterval);
                this.angryInterval = null;
            }
        }, 1000);
    }
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /* ===================== UI ===================== */

    initDisplay() {
        this.container.innerHTML = "";

        this.title = document.createElement("h3");
        this.title.innerText = this.name;

        this.messageBox = document.createElement("div");
        this.messageBox.className = "tamago-messages";

        this.container.append(this.title, this.messageBox);
    }

    async addMessage(msg) {
        const p = document.createElement("p");
        p.innerText = msg;
        p.classList.add("message");

        this.messageBox.appendChild(p);
        this.queue.push(p);

        // Temps visible
        await this.wait(5000);

        // Déclenche l'animation
        p.classList.add("hide");

        // Temps de l'animation (doit matcher le CSS)
        await this.wait(500);

        p.remove();
        this.queue.shift();
    }
    getMood() {
        const { joy, fear, angry } = this.stat;

        if (angry > 200) return "AGRESSIF";
        if (angry > 130) return "EN_COLÈRE";
        if (fear > 150) return "EFFRAYÉ";
        if (joy > 150) return "JOYEUX";
        if (joy < 30 && angry < 80) return "TRISTE";

        return "CALME";
    }
    startMoodLoop() {
        setInterval(() => {
            const mood = this.getMood();

            switch (mood) {
                case "AGRESSIF":
                    this.reactAggressive();
                    break;
                case "EN_COLÈRE":
                    this.reactAngry();
                    break;
                case "JOYEUX":
                    this.reactHappy();
                    break;
                case "EFFRAYÉ":
                    this.reactFear();
                    break;
            }
        }, 15000);
    }
    //========Réaction au Mood======//
    reactAngry() {
        if (Math.random() < 0.4) {
            const msg = `${this.name} grogne dans un coin 😡`;
            this.bot.message(msg);
            this.addMessage(msg);
        }
    }

    reactAggressive() {
        const msg = `${this.name} mord quelqu’un au hasard 💢`;
        this.bot.message(`/me ${msg}`);
        this.addMessage(msg);
        this.stat.joy = Math.max(0, this.stat.joy - 10);
    }

    reactHappy() {
        if (Math.random() < 0.3) {
            const msg = `${this.name} sautille partout 🥰`;
            this.bot.message(msg);
            this.addMessage(msg);
        }
    }

    reactFear() {
        const msg = `${this.name} se cache sous la table 😱`;
        this.bot.message(msg);
        this.addMessage(msg);
    }

    renderMessages() {
        this.messageBox.innerHTML = "";
        this.queue.forEach(msg => {
            const p = document.createElement("p");
            p.innerText = msg;
            this.messageBox.appendChild(p);
            setTimeout(() => {
                p.classList.add("hide");
                this.queue.shift();
            }, 5000);
        });
    }

    /* ===================== BOT ===================== */

    initBot() {
        this.bot.setCommand("!mood", (args, tag) => {
            const msg = `/me @${tag.username} demande comment ${this.name} se sent`;
            this.bot.message(msg);
            this.addMessage(msg);
            const mood = this.getMood();

            switch (mood) {
                case "CALME":{
                    this.bot.message(`/me ${this.name} souris à @${tag.username} `);
                    this.addMessage(`${this.name} souris à ${tag.username}`);
                    break;
                }
                case "AGRESSIF": {
                    this.bot.message(`/me ${this.name} bondit sur @${tag.username} et s'apprete à le mordre ! `);
                    this.addMessage(`${this.name} bondit sur ${tag.username} et s'apprete à le mordre ! `);
                    break;
                }
                case "EN_COLÈRE": {
                    this.bot.message(`/me ${this.name} jette un regard sur @${tag.username} ! `);
                    this.addMessage(`${this.classNameame} jette un regard sur @${tag.username}`);
                    break;
                }
                case "JOYEUX": {
                    this.bot.message(`/me ${this.name} bondit sur @${tag.username} et lui fait un calin `);
                    this.addMessage(`${this.name} bondit sur ${tag.username} et lui fait un calin  ! `);
                    break;
                }
                case "EFFRAYÉ": {
                    this.bot.message(`/me ${this.username} reste dans son coin `);
                    this.addMessage(`${this.username} reste dans son coin`);
                    break;
                }
            }
        })
        this.bot.setCommand("!slap", (args, tag) => {
            const msg = `/me @${tag.username} frappe ${this.name}`;
            this.stat.fear = this.clampStat(this.stat.fear + 5);
            this.stat.joy = this.clampStat(Math.floor(this.stat.joy / 2));
            this.bot.message(msg);
            this.addMessage(msg);
        });
        this.bot.setCommand("!jouer", (args, tag) => {
            const choices = ["pierre", "ciseau", "feuille"];

            if (!choices.includes(args[0])) {
                const msg = `${this.name} joue à shifumi. ${tag.username}, pierre, ciseau ou feuille ?`;
                this.bot.message(msg);
                this.addMessage(msg);
                return;
            }
            this.stat.joy = this.clampStat(this.stat.joy + 5);
            this.stat.angry = this.clampStat(this.stat.angry - 2);
            this.bot.message(`/me ${tag.username} joue ${args[0]}`);
            this.addMessage(`${tag.username} joue ${args[0]}`);
            const botChoice = choices[getRandomInt(3)];
            const msg = `${this.name} joue ${botChoice} contre ${tag.username}`;

            this.bot.message(msg);
            this.addMessage(msg);
            const rules = {
                pierre: "ciseau",
                ciseau: "feuille",
                feuille: "pierre"
            };

            let msgResult = "";
            let player = args[0];

            if (player === botChoice) {
                msgResult = "égalité !";
            } else if (rules[player] === botChoice) {
                msgResult = `${tag.username} a gagné`;
            } else {
                msgResult = `${this.name} a gagné`;
                this.stat.joy = this.clampStat(this.stat.joy + 5);
            }

            this.bot.message(`/me ${msgResult}`);
            this.addMessage(msgResult);
        });

        this.bot.setCommand("!feed", (args, tag) => {
            const food = args[0];
            if (food == undefined) {
                const msg = `il n'y a rien dans la main de ${tag.username}, ${this.name} est deçu 😥`;
                this.bot.message(msg);
                this.addMessage(msg);
                return;
            }
            if (!this.feedType[food]) {
                const msg = `${this.name} ne mange pas ${food}`;
                this.bot.message(msg);
                this.addMessage(msg);
                return;
            }

            if (this.feed >= this.maxFeed) {
                const msg = `${this.name} est repu et recrache sur ${tag.username}`;
                this.bot.message(msg);
                this.addMessage(msg);
                return;
            }

            this.feed += this.feedType[food];
            this.stat.angry = Math.max(
                0,
                this.stat.angry - this.feedType[food]
            );
            if (food === "cake") {
                this.stat.joy += 10;
            }
            const msg = `${tag.username} donne ${food} à ${this.name} ❤️`;
            this.feelAngry();
            this.bot.message(msg);
            this.addMessage(msg);
        });

        this.bot.openBot();
    }
}
