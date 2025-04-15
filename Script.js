console.log("Welcome to my Tic Tac Toe")

let currentplayer = "X";
let arr = Array(9).fill(null);
let gameOver = false;

// winner cheack function
function checkwin() {
    if (
        (arr[0] !== null && arr[0] == arr[1] && arr[1] == arr[2]) ||
        (arr[3] !== null && arr[3] == arr[4] && arr[4] == arr[5]) ||
        (arr[6] !== null && arr[6] == arr[7] && arr[7] == arr[8]) ||
        (arr[0] !== null && arr[0] == arr[3] && arr[3] == arr[6]) ||
        (arr[1] !== null && arr[1] == arr[4] && arr[4] == arr[7]) ||
        (arr[2] !== null && arr[2] == arr[5] && arr[5] == arr[8]) ||
        (arr[0] !== null && arr[0] == arr[4] && arr[4] == arr[8]) ||
        (arr[2] !== null && arr[2] == arr[4] && arr[4] == arr[6])
    )   {
        document.querySelector('.info').innerText = `Winner is ${currentplayer}`;
        gameOver = true;
        return true;
    }
    return false;
}

// Check for a draw
function checkDraw() {
    if (!arr.includes(null) && !gameOver) {
        document.querySelector('.info').innerText = "It's a Draw!";
        gameOver = true;
    }
}

// game logic
function handleClick(el) {
    if (gameOver) return;
    const id = Number(el.id);
    if(arr[id] !== null) return;
    arr[id] = currentplayer;
    el.innerText = currentplayer;
    if (!checkwin()) checkDraw();
    currentplayer = currentplayer === 'X' ? '0' : 'X'
}