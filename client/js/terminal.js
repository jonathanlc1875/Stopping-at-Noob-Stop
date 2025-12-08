const messageLog = document.getElementById("log");
const inputBox = document.getElementById("input");
const submitButton = document.getElementById("submit");
var currentChoices = [];

inputBox.addEventListener("keydown", (event) => {
    if(event.key === 'Enter') {
        event.preventDefault;
        submitInput();
    }
});

submitButton.addEventListener("click", () => {
    submitInput();
});

function submitInput() {
    const inputCommand = inputBox.value;
    if(inputCommand.trim() === "")
        return;
    inputBox.value = "";
    console.log(inputCommand);
    messageLog.innerHTML += "<br>\> " + inputCommand + "<br>";
    handleCommand(inputCommand);
}

function handleCommand(inputCommand) {
    const inputNumber = Number.parseFloat(inputCommand);

    if(Number.isInteger(inputNumber))
        messageLog.innerHTML += `<br>\>\>\> That's a nice integer: ${Number.parseInt(inputCommand)}.<br>`;
    else if(isFloat(inputNumber))
        messageLog.innerHTML += "<br>\>\>\> Make a real choice.<br>"
    else
        messageLog.innerHTML += "<br>\>\>\> Error: Command not recognized.<br>";
}

function isFloat(number) {
    return Number(number) === number && number % 1 !== 0;
}

function setChoices(newChoices) {
    currentChoices = newChoices;
}

class Room {
    constructor(roomName) {
        this.roomName = roomName;
    }
}