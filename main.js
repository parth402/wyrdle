  // --- Browser: run the game with input from the page (keyboard + tiles) ---
  // Wait for DOM so the board and keyboard definitely exist
  document.addEventListener('DOMContentLoaded', function () {

  /* Creates the game board 6 total gueses each 5 letters long */
  const ROWS = 6;
  const COLS = 5;

  /* picks a random word from the list also intializes the current row to be the first row and current guess to be empty and the game to still be running */
  let targetWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)].toUpperCase();
  let currentRow = 0;
  let currentGuess = '';
  let gameOver = false;

  // Find the little box on the board at this row and column.
  function getTile(row, col) {
    return document.getElementById('tile-' + row + '-' + col);
  }

  // Show the letters the player has typed so far in the current row of boxes.
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

  function evaluateGuess(guess, target) {
    const result = [];
    const targetCounts = {};
    for (let i = 0; i < target.length; i++) {
      targetCounts[target[i]] = (targetCounts[target[i]] || 0) + 1;
    }
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === target[i]) {
        result[i] = 'correct';
        targetCounts[guess[i]]--;
      } else {
        result[i] = null;
      }
    }
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

  function applyResultToRow(row, guess, result) {
    for (let c = 0; c < COLS; c++) {
      const tile = getTile(row, c);
      tile.textContent = guess[c];
      tile.classList.remove('filled', 'correct', 'present', 'absent');
      tile.classList.add(result[c]);
    }
  }

  function submitGuess() {
    if (gameOver) return;
    if (currentGuess.length !== 5) return;

    const guess = currentGuess.toUpperCase();
    const guessLower = guess.toLowerCase();
    if (!WORD_LIST.includes(guessLower)) {
      alert('Not in word list');
      return;
    }

    const result = evaluateGuess(guess, targetWord);
    applyResultToRow(currentRow, guess, result);

    if (guess === targetWord) {
      gameOver = true;
      setTimeout(function () {
        alert('You won!');
      }, 300);
      return;
    }

    currentRow++;
    currentGuess = '';
    updateTilesForCurrentGuess();

    if (currentRow >= ROWS) {
      gameOver = true;
      setTimeout(function () {
        alert('Game over. The word was: ' + targetWord);
      }, 300);
    }
  }

  function pressKey(key) {
    if (gameOver) return;

    if (key === 'ENTER') {
      submitGuess();
      return;
    }
    if (key === 'BACKSPACE') {
      if (currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, -1);
        updateTilesForCurrentGuess();
      }
      return;
    }
    if (key.length === 1 && /[A-Za-z]/.test(key) && currentGuess.length < 5) {
      currentGuess += key.toUpperCase();
      updateTilesForCurrentGuess();
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
