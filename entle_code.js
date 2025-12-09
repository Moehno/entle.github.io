const maxGuesses = 6;
let currentGuess = 0;
let letterIndex = 0;

//defines today as a number so every user gets the same word at the same day
const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
let randomWord = "";

//fetch a random word from database by using "today" as a seed
fetch("/entle_db.json")
    .then(response => response.json())
    .then(database => {
        const databaseSize = database.length;
        const todaysWord = today % databaseSize;
        randomWord = database[todaysWord].toUpperCase();
        createBoxes();
    })

//function that creates boxes based on word length and maxguesses
function createBoxes() {
    const playerGuesses = document.getElementById("playerGuesses");
    playerGuesses.textContent = "";

    //create one row for each maxguess
    for (let divRow = 0; divRow < maxGuesses; divRow++) {
        const row = document.createElement("div");
        row.classList.add("row");

        //create one box per row for each letter of randomword
        for (let divBox = 0; divBox < randomWord.length; divBox++) {
            const letterbox = document.createElement("div");
            letterbox.classList.add("letterbox");
            row.appendChild(letterbox);
        }
        playerGuesses.appendChild(row);
    }
    createPlayerInput();
}

//playerinput is hidden in the beginning and only revealed if boxcreation was successfull
function createPlayerInput() {
    const buttons = document.getElementById("buttons");
    const keyboard = document.getElementById("keyboard");

    buttons.removeAttribute("hidden");
    keyboard.removeAttribute("hidden");
}

//function to get a reference to the boxes in the current row
function getCurrentBoxes() {
    let rows = document.getElementById("playerGuesses").children;
    let currentRow = rows[currentGuess];
    return currentRow.children;
}

//function for keyboard letters
function enterLetter(button) {
    if (letterIndex < randomWord.length) {
        //finds the first empty letterbox and fills it with the keyboard input
        const boxes = getCurrentBoxes();
        let currentBox = boxes[letterIndex];
        currentBox.textContent = button.textContent;
        letterIndex++;
    }
}

//function for "confirm" button
function compareToSolution() {
    if (letterIndex === randomWord.length) {
        //two variables to keep track of which letters have already been checked and count number of correct letters
        const boxes = getCurrentBoxes();
        let randomWordCopy = randomWord;
        let correctGuesses = 0;

        //first loop will only check for correct letters in the correct boxes
        for (let i = 0; i < randomWord.length; i++) {
            let currentBox = boxes[i];
            let guessedLetter = currentBox.textContent;
            let correctLetter = randomWord[i];
            let guessedLetterInKeyboard = document.getElementById(guessedLetter);

            //mark correct letters green
            if (guessedLetter === correctLetter) {
                currentBox.classList.add("correctLetter");
                currentBox.classList.add("checkedLetter");
                guessedLetterInKeyboard.classList.add("correctLetter");

                //remove guessed letters from auxiliary array so they get marked correctly
                randomWordCopy = randomWordCopy.replace(guessedLetter, "");

                //count amount of correctly guessed letters
                correctGuesses++;
            }
        }

        //seconds loop to check for semicorrect and incorrect letters
        for (let i = 0; i < randomWord.length; i++) {
            let currentBox = boxes[i];
            let guessedLetter = currentBox.textContent;
            let correctLetter = randomWord[i];
            let guessedLetterInKeyboard = document.getElementById(guessedLetter);
            let containsLetterInCopy = randomWordCopy.includes(guessedLetter);
            let containsLetterInOriginal = randomWord.includes(guessedLetter);

            currentBox.classList.add("checkedLetter");

            //mark semicorrect letters yellow
            if (containsLetterInCopy && guessedLetter != correctLetter) {
                currentBox.classList.add("semicorrectLetter");
                if (!guessedLetterInKeyboard.classList.contains("correctLetter")) {
                    guessedLetterInKeyboard.classList.add("semicorrectLetter");
                }

                //remove guessed letters from auxiliary array so they get marked correctly
                randomWordCopy = randomWordCopy.replace(guessedLetter, "");
            }

            //disable incorrect letters on keyboard
            else if (!containsLetterInOriginal) {
                guessedLetterInKeyboard.disabled = true;
                if (!guessedLetterInKeyboard.classList.contains("correctLetter") && !guessedLetterInKeyboard.classList.contains("semicorrectLetter")) {
                    guessedLetterInKeyboard.classList.add("incorrectLetter");
                }
            }
        }

        //do x if the player guessed correctly
        if (correctGuesses === randomWord.length) {
            console.log("Richtig geraten!");

            //play delayed jump animation for each letter, then show win message
            Array.from(boxes).forEach((box, index) => {
                setTimeout( () => {
                    box.classList.add("winnerLetter");
                }, 400 + 160 * (index + 1));

                if (index === randomWord.length - 1) {
                    showGameOverDialog("Gut Gemacht!", "Du hast richtig geraten! Schau morgen nochmal vorbei um ein neues Puzzle zu lösen", 1200 + 160 * (index + 1));
                }
            });
            
        }
        //do y if the player guessed incorrectly and has no guesses left
        else if ((currentGuess + 1) === maxGuesses) {
            console.log("Game Over!");
            showGameOverDialog("Schade!", "Das gesuchte Wort war " + randomWord + ", versuch's doch morgen nochmal!")
        }
        //do z if the player guessed incorrectly and has guesses left
        else {
            console.log("Versuchs nochmal! Versuche verbleibend: " + (maxGuesses - (currentGuess + 1)));
        }

        //move to next row
        currentGuess++;
        letterIndex = 0;
    }
}

//function for "delete" button
function deleteLastLetter() {
    if (letterIndex >= 1) {
        const boxes = getCurrentBoxes();
        let currentBox = boxes[letterIndex - 1];
        currentBox.textContent = "";
        letterIndex--;
    }
}

//function for "delete all" button
function deleteAllLettersInRow() {
    //gets the current row and deletes all letters inside it
    const boxes = getCurrentBoxes();

    for (let box of boxes) {
        box.textContent = "";
    }

    letterIndex = 0;
}

//function for the dialogbox that appears when the game is over
function showGameOverDialog(title, text, delay) {
    const gameOverBox = document.getElementById("gameOver");
    let gameOverTitle = document.getElementById("gameOverTitle");
    let gameOverText = document.getElementById("gameOverText");

    gameOverTitle.textContent = title;
    gameOverText.textContent = text;

    //delay the appearance of the box
    setTimeout(() => {
        gameOverBox.showModal();
    }, delay);
}

function playDuckAudio() {
    audio = document.getElementById("duckAudio");
    audio.play();
}
