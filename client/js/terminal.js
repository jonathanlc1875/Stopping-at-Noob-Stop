const messageLog = document.getElementById("log");
const inputBox = document.getElementById("input");
const submitButton = document.getElementById("submit");
const choices = document.getElementById("choices");
const audio = document.getElementById("bg-music");
const background = document.getElementById("backgroundImage");
var currentChoices = [];
var pageNumber = 0;
var previousPage = 0;
var heldItems = [];
var seenIntro = false;

let inputResolver = null; // holds the resolver for the current wait

function waitForUserInput() {
    return new Promise((resolve) => {
        inputResolver = resolve; // store resolver until user submits
    });
}

async function handleSubmit() {
    const result = await submitInput(); // get the actual number
    if (inputResolver) {
        inputResolver(result); // resolve the waiting promise
        inputResolver = null;  // reset so we don’t resolve twice
    }
}

// Attach listeners ONCE at startup
inputBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        handleSubmit();
    }
});

submitButton.addEventListener("click", () => {
    handleSubmit();
});

//each scene should always end in a choice 
//even if there is only one choice and it is to continue
async function initializeScene(sceneNumber) {
    messageLog.innerHTML = '';
    messageLog.innerText = '';
    previousPage = pageNumber;
    pageNumber = sceneNumber;

    console.log('new page is: ',pageNumber);
    console.log('last page was: ',previousPage);

    let result = -1;
    switch(sceneNumber) {
        case 0: //Goob Stop Entrance
            background.src = "../backgrounds/base.png";
            if(!seenIntro) {
                await printMessage(`${tab()}You open the doors and step inside the store.
                    Ambient music quietly plays from the speakers.
                    The cashier, who was sleeping before you walked through the doors, greets you unenthusiatically:
                    ${newParagraph()}* Hello and welcome to Goob Stop. Home to every good you could ever need.
                    ${newParagraph()}He lays his head back down on the counter.
                    You noticed that he emphasized the words 'goob' and 'good.' Hmm...
                    Behind the resting cashier is a wall of different weapons and items ranging from a rocket launcher, to... a mattress.
                    ${newParagraph()}Besides the cashier and his register, there are a few aisles and refrigerators filled with various grocery products.
                    You also see a hallway in the back of the store that seems to lead to more stores.
                    ${newParagraph()}* (That's strange... I could've sworn this place was smaller from the outside)
                    ${newParagraph()}The doors close behind you. As they normally do when you let go of them.
                    Your goal is simple:
                    Get some gear and leave... and maybe get a snack or something.
                    ${newParagraph()}You look around and consider your options...`,1);
                    seenIntro = true
            }
            else if(previousPage === 1) {
                await printMessage(`${tab()}You walk back to the center of the room.
                    ${newParagraph()}* Oh. Ok.
                    ${newParagraph()}The cashier goes back to sleeping.`,1);
            }
            else {
                await printMessage(`${tab()}You stand in the main room of the store.
                    The cashier is still sleeping.`,1)
            }
            setChoices([
                'Go to the register',
                'Go to the aisles',
                'Go to the hallway',
                'Leave'
            ]);
            while(result === -1 || result === null) {
                console.log('awaiting user input');
                result = await waitForUserInput();
                console.log('Result is: ', result);
            };
            switch(result) {
                case 1: //Register
                    return initializeScene(1);
                case 2: //Aisles
                    return initializeScene(2);
                case 3: //Hallway
                    return initializeScene(3);
                case 4: //Leave
                    //message about leaving
                    return initializeScene(0);
                default:
                    return initializeScene(-1)
            }
            break;
        case 1: //Register
            background.src = "../backgrounds/register.png";
            await printMessage(`${tab()}You walk over to the cash register.
                The cashier lifts his head as you approach and forces a weak smile.
                ${newParagraph()}* Hello sir, how can I help you today?`,1);
            setChoices([
                'Inspect the wall of items',
                'Talk to the cashier',
                `Purchase held items (holding ${heldItems.length} items)`,
                'Go back'
            ]);
            while(result === -1) {
                console.log('awaiting user input');
                result = await waitForUserInput();
                console.log('Result is: ', result);
            };
            switch(result) {
                case 1: //Wall of Items
                    return initializeScene(4);
                    break;
                case 2: //Cashier
                    return initializeScene(5);
                    break;
                case 3: //Purchase
                    //attempt purchase and go back
                    return initializeScene(1);
                    break;
                case 4: //Goob Stop Entrance
                    return initializeScene(0);
                    break;
                default:
                    return initializeScene(-1);
                    break;
            }
            break;
        default:
            pageNumber = -1;
            await printMessage(`${tab()}You're not sure how, but you find yourself in the void.
                You are enveloped in darkness.`);
            setChoices([
                'Wake up'
            ]);
            while(result === -1) {
                result = await waitForUserInput();
                console.log('result is: ',result);
            };
            switch(result) {
                case 1: //Goob Stop Entrance
                    return initializeScene(0);
                    break;
                default: //The Void
                    return initializeScene(-1);
                    break;
            }
            break;
    }
}

function newParagraph() {
    return `${newLine() + tab()}`;
}

function newLine() {
    return `<br>`
}

function tab() {
    return `&nbsp&nbsp&nbsp&nbsp`;
}

async function submitInput() {
    const inputCommand = inputBox.value;
    let inputNumber = Number.parseFloat(inputCommand);
    if(inputCommand.trim() === "")
        return -1;
    inputBox.value = "";
    console.log('command is: ',inputCommand);
    console.log('number is: ',inputNumber);
    //await printMessage(inputCommand, 0);

    if(Number.isInteger(inputNumber) && inputNumber > 0 && inputNumber <= currentChoices.length)
        await printMessage(getChoice(inputNumber), 0);
    else if(isFloat(inputNumber)) {
        await printMessage(`Make a decision.`,-1);
        inputNumber = -1;
    }
    else {
        await printMessage(`Invalid response. Choose a number 1 through ${currentChoices.length}.`,-1);
        inputNumber = -1;
    }

    messageLog.scrollTo({
        top: messageLog.scrollHeight,
        behavior: "smooth"
    });

    console.log('returning result: ',inputNumber);
    return inputNumber;
}

/*async function handleCommand(inputCommand) {
    const inputNumber = Number.parseFloat(inputCommand);
    console.log(inputCommand);
    console.log(inputNumber);

    if(Number.isInteger(inputNumber) && inputNumber > 0 && inputNumber <= currentChoices.length)
        await printMessage(getChoice(inputNumber), 0);
    else if(isFloat(inputNumber))
        await printMessage(`Make a decision.`,-1);
    else
        await printMessage(`Invalid response. Choose a number 1 through ${currentChoices.length}.`,-1);

    messageLog.scrollTo({
        top: messageLog.scrollHeight,
        behavior: "smooth"
    });
}*/

async function printMessage(message, type = 1) {
    //console.log(message);
    if(messageLog.innerHTML !== "") {
        messageLog.innerHTML += "<br>";
    }

    if(type === 0) //player
        messageLog.innerHTML += `\> ${message}<br>`;
    else if(type === -1) //entity
        messageLog.innerHTML += `\>\>\> ${message}<br>`;
    else if(type === 1) //server
        messageLog.innerHTML += `${message}<br>`;
}

function isFloat(number) {
    return Number(number) === number && number % 1 !== 0;
}

function setChoices(newChoices) {
    choices.innerHTML = "";
    currentChoices = newChoices;
    newChoices.forEach(choice => {
        choices.innerHTML += `<li>${choice}</li>`;
    });
}

function getChoice(index) {
    return currentChoices[index-1];
}

audio.volume = 0.05;
audio.play().catch(() => {
    document.body.addEventListener('click', () => {
        if(audio.paused)
            audio.play();
    });
});

initializeScene(pageNumber);