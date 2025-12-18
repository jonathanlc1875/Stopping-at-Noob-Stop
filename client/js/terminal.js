//HTML elements
const messageLog = document.getElementById("log");
const inputBox = document.getElementById("input");
const submitButton = document.getElementById("submit");
const choices = document.getElementById("choices");
const stats = document.getElementById("stats");
const audio = document.getElementById("bg-music");
const background = document.getElementById("background");
const backgroundImage = document.getElementById("backgroundImage");
//logic variables
var currentChoices = [];
var pageNumber = 0;
var previousPage = 0;
var printingMessage = false;
//player stats
var health = 20;
var maxHealth = 20;
var stamina = 100;
var maxStamina = 100;
var money = 0;
var heldItems = [];
var inventory = [];
var notes = [];
//story variables
var seenIntro = false;

//tix collected booleans
var collectedT1Aisle = false;

let inputResolver = null; // holds the resolver for the current wait
let characterDelay = 50;

//written by AI
function waitForUserInput() {
    return new Promise((resolve) => {
        inputResolver = resolve; // store resolver until user submits
    });
}

//written by AI
async function handleSubmit() {
    if(printingMessage)
        return;

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

document.addEventListener("keydown", (event) => {
    if (event.key === 'Escape') {
        if(document.activeElement && document.activeElement !== document.body) {
            event.preventDefault();
            document.activeElement.blur();
        }
    }
    
    if (document.activeElement === inputBox)
        return;
    
    if (event.shiftKey) {
        console.log('shift is being held');
        characterDelay = 10;
    }
    else if (event.code === 'Space' || event.key === " ") {
        console.log('space was pressed');
        characterDelay = 0;
    }
    else if (event.key === 'Tab') {
        event.preventDefault();
        inputBox.focus();
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === 'Shift') {
        console.log('shift stopped being being held');
        characterDelay = 50;
    }
});

//each scene should always end in a choice 
//even if there is only one choice and it is to continue
async function initializeScene(sceneNumber) {
    if(seenIntro) {
        printingMessage = true;
        await sleep(1000);
        printingMessage = false;
    }

    Array.from(background.children).forEach((child) => {
        if(child.className === 'item')
            background.removeChild(child);
    })

    messageLog.innerHTML = '';
    messageLog.innerText = '';
    setChoices([
        'Press Space to skip text.',
        'Hold Shift to speed up text.',
        'Press Tab to select the input box.',
        'Press Escape to unselect.'
    ]);
    previousPage = pageNumber;
    pageNumber = sceneNumber;

    console.log('new page is: ',pageNumber);
    console.log('last page was: ',previousPage);

    let result = -1;
    switch(sceneNumber) {
        case 0: //Goob Stop Entrance
            backgroundImage.src = "../images/backgrounds/base.png";
            if(!seenIntro) {
                await printMessage(`${tab()}You open the doors and step inside the store.
                    Ambient music quietly plays from the speakers.
                    The cashier, who was sleeping before you walked through the doors, greets you unenthusiatically:
                    ${newParagraph()}* Hello and welcome to Goob Stop. Home to every good you could ever need.
                    ${newParagraph()}You noticed that he emphasized the words 'goob' and 'good.' Hmm...
                    Behind the cashier is a wall of different weapons and items ranging from a rocket launcher, to... a mattress.
                    ${newParagraph()}Besides the cashier and his register, there are a few aisles and refrigerators filled with various grocery products.
                    You also see a hallway in the back of the store that seems to lead to more stores.
                    ${newParagraph()}> (That's strange... I could've sworn this place was smaller from the outside)
                    ${newParagraph()}The doors close behind you. As they normally do when you let go of them.
                    ${newParagraph()}Your goal is simple:
                    Get some gear and leave... and maybe get a snack or something.
                    ${newParagraph()}You look around and consider your options...`,1);
                    seenIntro = true
            }
            else if(previousPage === 1) {
                await printMessage(`${tab()}You walk back to the center of the room.
                    ${newParagraph()}* Oh. Ok.
                    ${newParagraph()}What shall you do?`,1);
            }
            else {
                await printMessage(`${tab()}You stand in the main room of the store.
                    What shall you do?`,1)
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
                default: //The Void
                    return initializeScene(-1)
            }
            break;
        case 1: //Register
            backgroundImage.src = "../images/backgrounds/register.png";
            if(previousPage === 1)
                await printMessage(`${tab()}He looks really tired.`)
            else
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
                    let purchaseInfo = '';
                    let purchaseTotal = 0;
                    heldItems.forEach((item) => {
                        switch(item) {
                            case 'Plush':
                                purchaseInfo += '<br>- Strangely familiar plush toy: $1<br>';
                                purchaseTotal += 1;
                                break;
                        }
                    });

                    await printMessage(`${tab()}* Alright sir, here's the bill: 
                        ${purchaseInfo}
                        So, that brings you to a total of $${purchaseTotal}`,1);
                    setChoices([
                        'Confirm Purchase',
                        'Nevermind'
                    ]);
                    result = -1;
                    while(result === -1) {
                        console.log('awaiting user input');
                        result = await waitForUserInput();
                        console.log('Result is: ', result);
                        if(result === -1) { //invalid input
                            await printMessage(`${tab()}* Uh... Say that again?`);
                        }

                        switch(result) {
                            case 1: //accept
                                if(money >= purchaseTotal) { //enough money
                                    await printMessage(`${tab()}* Good choice.`,1);
                                    money -= purchaseTotal;
                                    inventory.push(...heldItems);
                                    heldItems = [];
                                    reloadInformation();
                                }
                                else {
                                    await printMessage(`${tab()}* Sorry, but I don't think that's enough.`,1);
                                }
                                break;
                            case 2: //decline
                                await printMessage(`${tab()}* Understood.`);
                                break;
                        }
                    };
                    return initializeScene(1);
                    break;
                case 4: //Goob Stop Entrance
                    return initializeScene(0);
                    break;
                default: //The Void
                    return initializeScene(-1);
                    break;
            }
            break;
        case 2: //Aisles
            backgroundImage.src = "../images/backgrounds/aisles.png";
            //set up items
            if(!heldItems.includes('Plush') && !inventory.includes('Plush')) {
                console.log(heldItems);
                console.log(inventory);
                spawnItem('plush_item_shelf', {x: 694, y: 102});
            }
            if(!collectedT1Aisle)
                spawnItem('tix1_aisle', {x:458, y: 408});
            await printMessage(`${tab()}You walk over to the aisles and take a look at what's available.
                You can see the cashier in the background.
                He's awake... barely.`,1);
            setChoices([
                `Put away held items (holding ${heldItems.length} items)`,
                'Go back'
            ]);
            while(result === -1) {
                console.log('awaiting user input');
                result = await waitForUserInput();
                console.log('Result is: ', result);
            };
            switch(result) {
                case 1: //Put away held items
                    heldItems = [];
                    reloadInformation();
                    console.log(heldItems);
                    characterDelay = 0;
                    return initializeScene(2);
                    break;
                case 2: //Goob Stop Entrance
                    return initializeScene(0);
                    break;
                default: //The Void
                    return initializeScene(-1);
                    break;
            }
            break;
        default: //The Void
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
    return `&nbsp;&nbsp;&nbsp;&nbsp;`;
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

//helped by AI (but now I feel like I should've just figured out tag parsing by myself ._. it's not that hard)
async function printMessage(message, type = 1) {
    const messageArray = [...message];
    printingMessage = true;
    
    //console.log(message);
    if(messageLog.innerHTML !== "") {
        messageLog.innerHTML += "<br>";
    }

    if(type === 0) //player
        messageLog.innerHTML += `> `;
    else if(type === -1) //entity
        messageLog.innerHTML += `>>> `;
    else if(type === 1) //server
        messageLog.innerHTML += ``;

    let inTag = false;
    let inEntity = false;
    let tagBuffer = "";
    let entityBuffer = "";
    
    for(let i = 0; i < messageArray.length; i++) {
        let char = `${messageArray[i]}`;

        if(char === "<") {
            inTag = true;
            tagBuffer = "<";
        }
        else if(char === "&") {
            inEntity = true;
            entityBuffer = "&";
        }
        else if(inTag) {
            tagBuffer += char;
            if(char === ">") {
                messageLog.innerHTML += tagBuffer;
                inTag = false;
                tagBuffer = "";
            }
        }
        else if(inEntity) {
            entityBuffer += char;
            if(char === ";") {
                messageLog.innerHTML += entityBuffer;
                inEntity = false;
                entityBuffer = "";
            }
        }
        else {
            messageLog.innerHTML += char;
            if(characterDelay > 0)
                await sleep(characterDelay);
            messageLog.scrollTo({
                top: messageLog.scrollHeight,
                behavior: "smooth"
            });
        }
    }

    messageLog.innerHTML += `<br>`
    printingMessage = false;
    if (characterDelay !== 50)
        characterDelay = 50;
}

async function reloadInformation() {
    let healthInfo = `Health: ${health}/${maxHealth}<br>`;
    let staminaInfo = `Stamina: ${stamina}/${maxStamina}<br>`;
    let moneyInfo = `Money: $${money}<br>`;
    let inventoryInfo = '';
    if(inventory.length > 0)
        inventoryInfo = `Inventory: ${inventory}<br>`;
    let heldItemsInfo = '';
    if(heldItems.length > 0)
        heldItemsInfo = `Held Items: ${heldItems}<br>`
    //let notesInfo = `Notes: ${notes}`;
    stats.innerHTML = healthInfo + staminaInfo + moneyInfo + inventoryInfo + heldItemsInfo;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

function spawnItem(itemName, position) {
    const item = document.createElement('img');
    item.src = `../images/items/${itemName}.png`;
    item.className = 'item';
    item.id = itemName;

    item.style.position = 'absolute';
    item.style.left = `${position.x}px`;   // fixed pixel X
    item.style.top = `${position.y}px`;    // fixed pixel Y

    background.appendChild(item);
}

background.addEventListener('click', (event => {
    if(event.target.classList.contains('item')) {
        event.target.remove();

        switch(event.target.id) {
            case 'plush_item_shelf':
                heldItems.push('Plush');
                break;
            case 'tix1_aisle':
                money += 1;
                collectedT1Aisle = true;
                break;
            default:
                console.log('unknown item: ',event.target.name);
                break;
        }
        reloadInformation();
    }
}));

audio.volume = 0.05;
audio.play().catch(() => {
    document.body.addEventListener('click', () => {
        if(audio.paused)
            audio.play();
    });
});

initializeScene(pageNumber);
reloadInformation();