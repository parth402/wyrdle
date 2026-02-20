  // --- Browser: run the game with input from the page (keyboard + tiles) ---
  // Wait for DOM so the board and keyboard definitely exist
  document.addEventListener('DOMContentLoaded', function () {

  /* Creates the game board 6 total gueses each 5 letters long */
  const ROWS = 6;
  const COLS = 5;

  const toastMessage = document.getElementById('toast-message');
  const welcomeModal = document.getElementById('welcome-modal');
  const welcomePlayBtn = document.getElementById('welcome-play-btn');
  const gameOverModal = document.getElementById('game-over-modal');
  const gameOverTitle = document.getElementById('game-over-title');
  const gameOverWord = document.getElementById('game-over-word');
  const playAgainBtn = document.getElementById('play-again-btn');

  welcomePlayBtn.addEventListener('click', function () {
    welcomeModal.classList.remove('show');
    welcomeModal.setAttribute('aria-hidden', 'true');
    document.body.focus();
  });

  /* picks a random word from the list also intializes the current row to be the first row and current guess to be empty and the game to still be running */
  let targetWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)].toUpperCase();
  let currentRow = 0;
  let currentGuess = '';
  let gameOver = false;
  let keyboardState = {};

  // Finds the specific letter at the row and column given
  function getTile(row, col) {
    return document.getElementById('tile-' + row + '-' + col);
  }

  // Updates the letters in the current row
  function updateTilesForCurrentGuess() {
    for (let c = 0; c < COLS; c++) {
      const tile = getTile(currentRow, c);
      if (!tile) return;
      if (c < currentGuess.length) {
        tile.textContent = currentGuess[c];
        tile.classList.add('filled');
      } else {
        tile.textContent = '';
        tile.classList.remove('filled');
      }
    }
  }

  // Evaluates the guess
  function evaluateGuess(guess, target) {
    const result = [];
    const targetCounts = {};

    // Counts the number of times each letter appears in the target word
    for (let i = 0; i < target.length; i++) {
      targetCounts[target[i]] = (targetCounts[target[i]] || 0) + 1;
    }

    // Checks if the letter is in the correct position
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === target[i]) {
        result[i] = 'correct';
        targetCounts[guess[i]]--;
      } else {
        result[i] = null;
      }
    }

    // Checks if the letter exists in the word but is just in the wrong position or if it doesnt exist at all
    for (let i = 0; i < guess.length; i++) {
      if (result[i] !== null) continue;
      if (targetCounts[guess[i]] > 0) {
        result[i] = 'present';
        targetCounts[guess[i]]--;
      } else {
        result[i] = 'absent';
      }
    }
    return result;
  }

  // Applies the result to the current row
  function applyResultToRow(row, guess, result) {
    for (let c = 0; c < COLS; c++) {
      const tile = getTile(row, c);
      tile.textContent = guess[c];
      tile.classList.remove('filled', 'correct', 'present', 'absent');
      tile.classList.add(result[c]);
    }
  }

  // function for user to submit their guess if they press enter
  function submitGuess() {
    // cant submit a guess if the game is over or the guess is not 5 letters long
    if (gameOver) return;
    if (currentGuess.length !== 5) return;

    // checks if the users guess is in the valid word list
    const guess = currentGuess.toUpperCase();
    const guessLower = guess.toLowerCase();
    if (!WORD_LIST.includes(guessLower)) {
      toastMessage.textContent = 'Not in word list';
      toastMessage.classList.add('show');
      toastMessage.setAttribute('aria-hidden', 'false');
      setTimeout(function () {
        toastMessage.classList.remove('show');
        toastMessage.setAttribute('aria-hidden', 'true');
      }, 2500);
      return;
    }

    // applies the result to the current row *colors*
    const result = evaluateGuess(guess, targetWord);
    applyResultToRow(currentRow, guess, result);

    // update keyboard state for each letter (green/yellow/gray) so the virtual keys stay colored
    for (let i = 0; i < 5; i++) {
      const status = result[i] === 'correct' ? 'green' : result[i] === 'present' ? 'yellow' : 'gray';
      updateLetterStatus(guess[i], status);
    }

    // checks if the user has guessed the word if they did they win and the game is over
    if (guess === targetWord) {
      gameOver = true;
      gameOverTitle.textContent = 'You won!';
      gameOverWord.textContent = '';
      gameOverModal.classList.add('show');
      gameOverModal.setAttribute('aria-hidden', 'false');
      return;
    }

    // moves to the next row and resets the CURRENT guess
    currentRow++;
    currentGuess = '';
    updateTilesForCurrentGuess();

    // if you run out of guesses ends the game and displays the correct answer
    if (currentRow >= ROWS) {
      gameOver = true;
      gameOverTitle.textContent = 'Game over';
      gameOverWord.textContent = 'The word was: ' + targetWord;
      gameOverModal.classList.add('show');
      gameOverModal.setAttribute('aria-hidden', 'false');
    }
  }

  function playAgain() {
    targetWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)].toUpperCase();
    currentRow = 0;
    currentGuess = '';
    gameOver = false;
    keyboardState = {};
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = getTile(r, c);
        if (tile) {
          tile.textContent = '';
          tile.classList.remove('filled', 'correct', 'present', 'absent');
        }
      }
    }
    document.querySelectorAll('.key').forEach(function (keyEl) {
      keyEl.classList.remove('correct', 'present', 'absent');
    });
    gameOverModal.classList.remove('show');
    gameOverModal.setAttribute('aria-hidden', 'true');
    updateTilesForCurrentGuess();
  }

  playAgainBtn.addEventListener('click', playAgain);

  // function for user to enter words with either the virtual or physical keyboard
  function pressKey(key) {
    // cant enter a word if the game is over
    if (gameOver) return;

    // if the user presses enter submit their guess (length check happens in submitGuess function)
    if (key === 'ENTER') {
      submitGuess();
      return;
    }
    // if the user presses backspace remove the last letter from the current guess
    if (key === 'BACKSPACE') {
      if (currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, -1);
        updateTilesForCurrentGuess();
      }
      return;
    }
    // adds letter to current guess only if its a actual letter and there is space for that letter
    if (key.length === 1 && /[A-Za-z]/.test(key) && currentGuess.length < 5) {
      currentGuess += key.toUpperCase();
      updateTilesForCurrentGuess();
    }
  }

  function updateLetterStatus(letter, status) {
    const current = keyboardState[letter];
    if (status === 'green') {
      keyboardState[letter] = 'green';
    } else if (status === 'yellow' && current !== 'green') {
      keyboardState[letter] = 'yellow';
    } else if (status === 'gray' && current !== 'green' && current !== 'yellow') {
      keyboardState[letter] = 'gray';
    }
    // update the keyboard display
    const keyEl = document.querySelector(`[data-key="${letter}"]`);
    if (keyEl) {
      keyEl.classList.remove('correct', 'present', 'absent');
      if (keyboardState[letter]) {
        keyEl.classList.add(keyboardState[letter] === 'green' ? 'correct' : keyboardState[letter] === 'yellow' ? 'present' : 'absent');
      }
    }
  }

  // Virtual keyboard
  document.querySelectorAll('.key').forEach(function (keyEl) {
    keyEl.addEventListener('click', function () {
      const key = keyEl.getAttribute('data-key');
      pressKey(key);
    });
  });

  // Physical keyboard
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
          e.preventDefault();
          pressKey('ENTER');
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          pressKey('BACKSPACE');
        } else if (e.key.length === 1 && /[A-Za-z]/.test(e.key)) {
          e.preventDefault();
          pressKey(e.key);
        }
  });

  // Initial empty row
  updateTilesForCurrentGuess();

  // So physical keyboard works even if user hasn't clicked: make page focusable and focus it
  document.body.setAttribute('tabindex', '0');
  document.body.focus();

  }); // end DOMContentLoaded
