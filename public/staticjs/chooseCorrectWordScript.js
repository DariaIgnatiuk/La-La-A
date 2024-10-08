//global variables for the choosing game
let button = document.getElementById('startGameButton');
let index = 0;
let randomNumbers = [];
const numberOfOptions = 3;
let numberOfPairsGuessed = 0;
let studySet = '';

const getTopResults = async (name, timeResult) => {
    apiRequest(`http://localhost:3000/api/playerstatistics/topresults/${studySet}/Choose%20Correct%20Word`)
    .then((data)=>{
        console.log(data);
        let table = `
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Correct Answers</th>
              <th>Time Spent</th>
            </tr>
            <br>
          </thead>
          <tbody>
            <tr>
              <td>${data[0].username}</td>
              <td>${data[0].correct_answers}</td>
              <td>${data[0].time_spent}</td>
            </tr>
            <tr>
              <td>${data[1].username}</td>
              <td>${data[1].correct_answers}</td>
              <td>${data[1].time_spent}</td>
            </tr>
            <tr>
              <td>${data[2].username}</td>
              <td>${data[2].correct_answers}</td>
              <td>${data[2].time_spent}</td>
            </tr>
            <tr>
              <td>${data[3].username}</td>
              <td>${data[3].correct_answers}</td>
              <td>${data[3].time_spent}</td>
            </tr>
            <tr>
              <td>${data[4].username}</td>
              <td>${data[4].correct_answers}</td>
              <td>${data[4].time_spent}</td>
            </tr>
          </tbody>
        </table> `
        document.getElementById('statistics').innerHTML += table;
    let inTop = false;
    for (const user of data){
        console.log(user);
        
        console.log(user.username, name);
        console.log(user.correct_answers,numberOfPairsGuessed);
        console.log(user.time_spent,timeResult);
        if ((user.username === name) && (user.correct_answers === numberOfPairsGuessed) && (user.time_spent === timeResult.toFixed(4))){
            inTop = true;
        }
        console.log(inTop);
    }
    if (inTop){document.getElementById('statistics').innerHTML += `<p>You are in top 5 😊 Congratulations!</p>`}
    else {document.getElementById('statistics').innerHTML += `<p>You didn't get in top 5 😔 Better luck next time!</p>`}
    }
    )

}


const postResults = async (name, timeResult) => {
    const options = {
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify({  
            "username": name,
            "set_name": studySet,
            "game_name": "Choose Correct Word",
            "correct_answers": numberOfPairsGuessed,
            "time_spent": timeResult})
    }
    apiRequest('http://localhost:3000/api/playerstatistics', options)
}

const finishGame = () => {
    // stop the timer
    const endTime = performance.now();
    // calculate the time
    const elapsedTime = endTime - startTime;
    const timeResult = elapsedTime / 1000;
        //remove fields for the cards
        document.getElementById("chooseGameContainer").innerHTML = '';
        // display the results
        document.getElementById('gameResult').innerHTML = `<div>Game took you ${timeResult.toFixed(3)} seconds you guessed ${numberOfPairsGuessed} words correctly</div>`;
    //get the user's name
    const name = prompt('Please enter your name:');
    postResults(name, timeResult);
    getTopResults(name, timeResult);

    // rename the Start game button to Play again and show it
    button.innerHTML = 'Play again';
    button.style.display = 'inline';
}

const getRepliesArray = () => {
    // create an empty array of replies. Length of the array is numberOfOptions (can be changed)
    let array = [];
    // fill the array with empty objects
    for (let i = 0; i < numberOfOptions; i++) {
        array.push(false);
    }
    // randomly choose an index of the array to put the correct answer and add the correct answer to the array
    const indexOfCorrectAnswer = Math.floor(Math.random() * numberOfOptions);
    array[indexOfCorrectAnswer] = wordsArray[randomNumbers[index]]
    // fill the rest of the array with random words from the wordsArray
    for (let i = 0; i < numberOfOptions; i++) {
        if (i !== indexOfCorrectAnswer) {
            //check if the word is already in the array
            do {
                let option = wordsArray[randomNumbers[Math.floor(Math.random() * randomNumbers.length)]]; 
                if (!array.includes(option)) {
                    array[i] = option;
                }
            }
            while (!array[i]); // if the word is already in the array, try again
        }
    }
    return array;
}

const checkAnswer = (e, id) => {
    // check if the clicked word is the correct answer
    if (id === wordsArray[randomNumbers[index]].id){
        // increase the number of pairs guessed
        numberOfPairsGuessed ++;
        // change the color of the clicked word to green
        e.target.style.backgroundColor = 'lightGreen';
        setTimeout(function() {
            //start the next round
            gameRound();
        }, 500); 
    } 
    else { // if the clicked word is not the correct answer
        // change the color of the clicked word to red
        e.target.style.backgroundColor = 'red';
        setTimeout(function() {
            //start the next round
            gameRound();
        }, 500); 
    }
    // increase the index - go to th next Hebrew word
    index ++;
}

function playSound() {
  const audio = document.getElementById('myAudio');
  audio.play();
}

const gameRound = () => {
    if (index === randomNumbers.length -1) {
        finishGame();
    }
    else{
        document.getElementById('oneWordInHeb').innerHTML = `<div class="matchCard" onClick="playSound()">▶️ ${wordsArray[randomNumbers[index]].hebrew}</div>
        <audio id="myAudio"><source src="${wordsArray[randomNumbers[index]].audio_file}" type="audio/mpeg"></audio><br><p>Choose the correct translation of this word: </p>`;
        let array = getRepliesArray();
        let html = ``;
        for (const word of array) {
            html += `<div class="matchCard" onClick=checkAnswer(event,${word.id})>${word.english}</div>`;
        }
        document.getElementById('optionsInEng').innerHTML = html;
    }
}

const startGame = (data) => {  
    document.getElementById('gameResult').innerHTML = '';
    document.getElementById('statistics').innerHTML = '';
    //get the words from the server
    wordsArray = data;
    //get the random numbers to show the Hebrew word
    randomNumbers = getRandomNumbers(0, wordsArray.length-1);
    // run the first round og the game
    gameRound();
}

//onCliclk on the start button
const setupChooseWordGame = () => {
    // hide the start game button
    button.style.display = 'none';
    // reset the variables
    numberOfPairsGuessed = 0;
    index = 0;
    // add fields for cards
    document.getElementById("chooseGameContainer").innerHTML = `<div id="oneWordInHeb"></div><div id="optionsInEng"></div>`
    // get the study set from the URL
    const url = new URL(window.location.href);
    studySet = url.searchParams.get('studySet');
    // get the words from the server
    gettheWords(studySet)
    // // start the timer
    startTime = performance.now();
}
