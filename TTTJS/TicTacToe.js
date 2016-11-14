
function addCommonCode(newBoard) {

    newBoard.values = [];

    newBoard.rows = [];
    for (var y = 0; y < 3; y++) {
        var newRow = {};
        newRow.y = y;
        newRow.columns = [];
        newBoard.rows[y] = newRow;
        for (var x = 0; x < 3; x++) {
            var newCol = {};
            newCol.x = x;
            newRow.columns[x] = newCol;
        }
    }

    var nextBrain = {};
    nextBrain.play = function (board, availableCells) {
        return availableCells[0];
    }

    var randomBrain = {};
    randomBrain.play = function (board, availableCells) {
        var randomChoice = Math.round(Math.random() * (availableCells.length - 1));
        return availableCells[randomChoice];
    }

    var beginnerBrain = {};
    beginnerBrain.play = function (board, availableCells) {
        if (board.values[TopLeftCell].CurrentState == board.values[TopCell].CurrentState == board.cellStates[1].Name) {
            return TopRightCell;
        }
        return randomBrain.play(board, availableCells);
    }

    newBoard.aiPlayer = {
        brain: beginnerBrain
    };



    newBoard.aiPlayer.play = function () {
        var p = newBoard.aiPlayer;
        console.log('playing for ai now...');

        var availableCells = [];
        for (var i = 0; i < newBoard.cells.length; i++) {
            if (newBoard.values[i].CurrentState === newBoard.cellStates[2].Name) {
                availableCells.push(i);
            }
        }
        var playIndex = p.brain.play(newBoard, availableCells);
        newBoard.values[playIndex].CurrentState = newBoard.cellStates[1].Name;
    }

    newBoard.autoPlay = function () {
        console.log('auto-play');
        newBoard.aiPlayer.play();
        if (newBoard.checkForWin()) {
            newBoard.isGameOver = true;
        }
        else {
            newBoard.myTurn = !newBoard.myTurn;
        }
    }

    newBoard.click = function (row, col) {
        if (newBoard.isGameOver) return;
        else {
            var cell = newBoard.values[(row.y * 3) + col.x];
            if (cell.CurrentState === newBoard.cellStates[2].Name) {
                cell.CurrentState = newBoard.myTurn ? newBoard.cellStates[0].Name : newBoard.cellStates[1].Name;
                console.log('checking for winl...');
                if (!newBoard.checkForWin()) {
                    console.log('switching who\'s turn it is.');
                    newBoard.myTurn = !newBoard.myTurn;
                    if (!newBoard.myTurn) newBoard.autoPlay();
                } else {
                    newBoard.isGameOver = true;
                    newBoard.setStatus('GameOver');
                }
            }
        }
    }

    newBoard.setStatus = function (token) {
        newBoard.status = newBoard.languageTokens[token];
    };

    newBoard.playing = false;

    newBoard.printInfo = function (title, highlightFirst3, attributeToPrint) {
        var str = '<b>' + title + '</b><br />';
        str += '<div style="border: solid 1px black; width: 5em; text-align: center; padding: 0.5em; margin-bottom: 0.65em;">';
        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
                var cell = newBoard.values[(y * 3) + x];

                if (highlightFirst3 && cell.CellIndex < 3) str += '<span style="background-color: lightgray">';
                var newValue = newBoard.cellStates[cell.CurrentState][attributeToPrint];
                str += newValue || ' ';
                if (highlightFirst3 && cell.CellIndex < 3) str += '</span>';

                str += (x < 2 ? '  ' : '');
            }
            str += '<br />';
        }

        str += '</div>';

        newBoard.addString(str);
    }

    newBoard.print = function () {
        newBoard.printInfo("Current Board", true, 'SampleValue');
    }

    newBoard.addString = function (text) {
        var html = $('#rotations').html();
        $('#rotations').html(html + text);
    }

    newBoard.showWinner = function () {
        if (!newBoard.isGameOver) return "";
        else if (newBoard.isTieGame) return newBoard.languageTokens['TieGame'];
        else if (newBoard.myTurn) return newBoard.languageTokens['YouWon'];
        else return newBoard.languageTokens['TheyWon'];
    }
}


function commonAfterLoaded(newBoard, dataLoaded) {
    newBoard.myTurn = true;
    newBoard.boardLoaded = true;

    for (var i = 0; i < 9; i++) {
        newBoard.values[i] = newBoard.cells[i];
    }

    for (var i = 0; i < newBoard.cellStates.length; i++) {
        var cellState = newBoard.cellStates[i];
        newBoard.cellStates[cellState.Name] = cellState;
    }

    for (var i = 0; i < newBoard.languageTokens.length; i++) {
        var token = newBoard.languageTokens[i];
        newBoard.languageTokens[token.Token] = token.DisplayName;
    }

    newBoard.setStatus('GameOn');

    if (dataLoaded) dataLoaded(newBoard);
}

function createBoard() {
    var newBoard = {};

    addCommonCode(newBoard);
    addDerivedCode(newBoard);

    return newBoard;
}

function getFileUrl(fileName) {
    var rootUrl = 'https://eejai42.sdks.codeiverse.com/TicTacToeSDK/GoogleData/AdditionalResources/';
    var ext = '.csv.xml.json';
    return rootUrl + fileName + ext;
}

var filesToDownload = ['Cells', 'CellStates', 'Translations', 'CellPatterns', 'LanguageTokens']

function checkAngularFile(newBoard, fileIndex, $scope, $http, dataLoaded) {
    var fileName = filesToDownload[fileIndex];
    var lowerFileName = fileName.substring(0, 1).toLowerCase() + fileName.substring(1, fileName.length);
    var fileUrl = getFileUrl(fileName);

    $http.get(fileUrl)
      .success(function (data) {
          newBoard[lowerFileName] = data[fileName][fileName.substring(0, fileName.length - 1)];
          fileIndex++;
          if (fileIndex == filesToDownload.length) commonAfterLoaded(newBoard, dataLoaded);
          else checkAngularFile(newBoard, fileIndex, $scope, $http, dataLoaded);
      })
      .error(function (e) {
          console.log('Error getting ' + fileName);
          console.log(e);
      });

}

function angularBoard($scope, $http, dataLoaded) {
    var newBoard = $scope.newBoard = createBoard();

    checkAngularFile(newBoard, 0, $scope, $http, dataLoaded);

    return newBoard;
}

function checkJQueryFile(newBoard, fileIndex, dataLoaded) {
    var fileName = filesToDownload[fileIndex];
    var lowerFileName = fileName.substring(0, 1).toLowerCase() + fileName.substring(1, fileName.length);
    var fileUrl = getFileUrl(fileName);

    $.getJSON(fileUrl,
        function (data) {
            newBoard[lowerFileName] = data[fileName][fileName.substring(0, fileName.length - 1)];
            fileIndex++;
            if (fileIndex == filesToDownload.length) commonAfterLoaded(newBoard, dataLoaded);
            else checkJQueryFile(newBoard, fileIndex, dataLoaded);
        });

}

function jQueryBoard(dataLoaded) {
    var newBoard = createBoard();

    checkJQueryFile(newBoard, 0, dataLoaded);

    return newBoard;
}
