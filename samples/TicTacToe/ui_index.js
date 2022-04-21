let statusDisplay, thisUserProfile;
let widgetData = {};
let gameActive = true;
let currentPlayer = 0; // Tracks current player: 0 => firstPlayer, 1 => secondPlayer
let gameState = new Array(9).fill(-1);

const winningMessage = () => `${currentPlayer === thisPlayerNumber() ? "You have" : (currentPlayerFirstName() + " has")} won!`;
const drawMessage = () => `Its a draw!`;
const currentPlayerTurn = () => `It's ${currentPlayer === thisPlayerNumber() ? "your" : (currentPlayerFirstName() + "'s")} turn`;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

window.onload = function() {
    statusDisplay = document.querySelector('.gameStatus');
    statusDisplay.innerHTML = currentPlayerTurn();
    document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
    setTimeout(async () => {
        updateIframeHeight();
        thisUserProfile = await Adobe.getUserProfile();
        widgetData = await Adobe.getWidgetData();
        dataUpdated(widgetData);
        Adobe.subscribeToWidgetData(dataUpdated);
        updateIframeHeight();
    }, 200);
};

function updateIframeHeight() {
    const expectedHeight = window.document.getElementsByTagName("html")[0].getBoundingClientRect().height;
    if (expectedHeight > 0) {
        Adobe.updateWidgetSize({
            height: expectedHeight
        });
    }
}

function dataUpdated(data) {
    widgetData = data;
    if (data.currentScreen !== "game") {
        updateStartScreen();
    } else {
        updateGameScreen();
    }
}

function currentPlayerProfile() {
    return currentPlayer === 0 ? firstPlayer() : (currentPlayer === 1 ? secondPlayer() : undefined);
}

function currentPlayerFirstName() {
    const profile = currentPlayerProfile();
    return (profile && profile.userName.split(' ')[0]) || "";
}

function updateCellImage(clickedCell, value) {
    const cellImage = clickedCell.querySelector('.userAvatar');
    if (cellImage) {
        if (value !== -1) {
            cellImage.src = (value === 0 ? firstPlayer() : secondPlayer()).userAvatarImage;
            cellImage.style.display = "block";
        } else {
            cellImage.style.display = "none";
        }
    }
}

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    updateCellImage(clickedCell, currentPlayer);
    widgetData.gameState = gameState;
    Adobe.setWidgetData(widgetData);
}

function handlePlayerChange() {
    currentPlayer = currentPlayer ? 0 : 1;
    statusDisplay.innerHTML = currentPlayerTurn();
}

function validateResult() {
    let roundWon = false;
    for (const winCondition of winningConditions) {
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        if ([a, b, c].includes(-1)) {
            continue;
        } else if (a === b && b === c) {
            roundWon = true;
            break
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = winningMessage();
        gameActive = false;
        return;
    }

    let roundDraw = !gameState.includes(-1);
    if (roundDraw) {
        statusDisplay.innerHTML = drawMessage();
        gameActive = false;
        return;
    }

    handlePlayerChange();
}

function firstPlayer() {
    return widgetData.firstPlayer && JSON.parse(widgetData.firstPlayer);
}

function secondPlayer() {
    return widgetData.secondPlayer && JSON.parse(widgetData.secondPlayer);
}

function thisPlayerNumber() {
    const first = firstPlayer();
    if (first && thisUserProfile.userId === first.userId) {
        return 0;
    }
    const second = secondPlayer();
    if (second && thisUserProfile.userId === second.userId) {
        return 1;
    }
    return -2;
}

function handleCellClick(clickedCellEvent) {
    if (thisPlayerNumber() !== currentPlayer) {
        return;
    }
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if (gameState[clickedCellIndex] !== -1 || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    validateResult();
}

function handleRestartGame() {
    gameActive = true;
    currentPlayer = 0;
    gameState.fill(-1);
    widgetData.gameState = gameState;
    widgetData.restartGame = true;
    // Swap players in widgetData if second player restarts the game
    if (thisUserProfile.userId === secondPlayer().userId) {
        swapPlayers();
    }
    Adobe.setWidgetData(widgetData);
    statusDisplay.innerHTML = currentPlayerTurn();
    document.querySelectorAll('.cell').forEach(cell => updateCellImage(cell, -1));
}

function swapPlayers() {
    const first = widgetData.firstPlayer;
    widgetData.firstPlayer = widgetData.secondPlayer;
    widgetData.secondPlayer = first;
}

function getAvatarWithSrc(src) {
    var avatar = document.createElement("img");
    avatar.setAttribute("src", src);
    avatar.setAttribute("width", "50px");
    avatar.setAttribute("height", "50px");
    return avatar;
}

function updateStartScreen() {
    document.querySelector('#startScreen').style.display = "block";
    document.querySelector('#gameScreen').style.display = "none";
    let avatars = [];
    const first = firstPlayer();
    const second = secondPlayer();
    if (first) {
        avatars.push(getAvatarWithSrc(first.userAvatarImage));
    }
    if (second) {
        avatars.push(getAvatarWithSrc(second.userAvatarImage));
    }
    document.querySelector('#userAvatars').replaceChildren(...avatars);
    updateStartScreenButtons()
    updateIframeHeight();
}

function updateStartScreenButtons() {
    let startVisible = false;
    let startDisabled = false;
    if (widgetData.firstPlayer) {
        if (widgetData.secondPlayer) {
            startVisible = true;
            startDisabled = false;
        } else if (firstPlayer().userId === thisUserProfile.userId) {
            startVisible = true;
            startDisabled = true;
        } else {
            startVisible = false;
            startDisabled = false;
        }
    }
    document.querySelector('.gameJoin').style.display = startVisible ? "none" : "block";
    document.querySelector('.gameStart').style.display = startVisible ? "block" : "none";
    document.querySelector('.gameStart').disabled = startDisabled;
}

function updateGameScreen() {
    document.querySelector('#startScreen').style.display = "none";
    document.querySelector('#gameScreen').style.display = "block";
    if (widgetData.restartGame) {
        gameActive = true;
        delete widgetData.restartGame;
    }
    if (widgetData.gameState) {
        updateGameCells();
    }
    if (gameActive) {
        statusDisplay.innerHTML = currentPlayerTurn();
    }
    updateIframeHeight();
}

function updateGameCells() {
    const newGameState = widgetData.gameState;
    let nextPlayer = 0;
    for (let index = 0; index < gameState.length; index++) {
        const oldState = gameState[index];
        const newState = newGameState[index];
        if (oldState !== newState) {
            handleGameCellUpdate(index, newState);
        }
        if (newState === 0) {
            nextPlayer++;
        } else if (newState === 1) {
            nextPlayer--;
        }
    }
    gameState = newGameState;
    currentPlayer = nextPlayer;
}

function handleGameCellUpdate(cellIndex, value) {
    gameState[cellIndex] = value;
    updateCellImage(document.querySelector(`[data-cell-index="${cellIndex}"]`), value);
    validateResult();
}

function handleJoinGame() {
    if (!widgetData.firstPlayer) {
        document.querySelector('#userAvatars').appendChild(getAvatarWithSrc(thisUserProfile.userAvatarImage));
        widgetData.firstPlayer = JSON.stringify(thisUserProfile);
        Adobe.setWidgetData(widgetData);
    } else if (!widgetData.secondPlayer && firstPlayer().userId !== thisUserProfile.userId) {
        document.querySelector('#userAvatars').appendChild(getAvatarWithSrc(thisUserProfile.userAvatarImage));
        widgetData.secondPlayer = JSON.stringify(thisUserProfile);
        Adobe.setWidgetData(widgetData);
    }
    updateStartScreenButtons();
    updateIframeHeight();
}

function handleStartGame() {
    document.querySelector('#startScreen').style.display = "none";
    document.querySelector('#gameScreen').style.display = "block";
    widgetData.currentScreen = "game";
    // Swap players in widgetData if second player starts the game
    if (thisUserProfile.userId === secondPlayer().userId) {
        swapPlayers();
    }
    Adobe.setWidgetData(widgetData);
    updateIframeHeight();
}