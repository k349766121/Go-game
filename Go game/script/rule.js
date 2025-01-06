"use strict";
class Rule{
    #game;
    /**
     * this class checks if a move follows the rule of go or not
     * @param {object} game an instance of the game 
     */
    constructor(game){
        this.#game = game;
    }

    /**
     * the user cannot play on top of another stone
     * @param {number} column the column of the position
     * @param {number} row the row of the position
     * @return {boolen} a statement that indicate whether the position has stone or not
     */
    alreadyHaveStone(column, row){
        if(this.#game.board.virtualBoard[column][row]=== this.#game.board.spare){
            return false;
        }else{
            return true;
        }
    }

    /**
     * check if a stone have 气(liberty) or not
     * DFS, since even one liberty is found(any position), the stone(s) are alive
     * @param {number} column the column of the stone on the virtual board, a chess board has 0 to 18 column
     * @param {number} row the row of the stone on the virtual board, a chess board has 0 to 18 row
     * @return {array} an array that shows if there are liberty or not, if no liberties, the arry will also contain all the dead stone
     */
    haveLiberty(column, row){
        const virtualBoard = this.#game.board.virtualBoard;
        const stack = [[column, row]];
        const deathStone = new Set();
        const stoneType = virtualBoard[column][row];
        while(stack.length){
            const visiting = stack.pop();
            const currentColumn = visiting[0];
            const currentRow = visiting[1];
        
            //check if the position if not out of the board and if it is the right colour
            if(deathStone.has(`${currentColumn} ${currentRow}`) || virtualBoard[currentColumn][currentRow] !== stoneType){
                continue;
            }
            
            //if there are spare(liberty) detected 
            if(this.#game.board.ifSurroundingExists(currentColumn,currentRow,this.#game.board.spare)){
                return [true];
            } 

            //a set can check faster if something exists compare to an array
            deathStone.add(`${currentColumn} ${currentRow}`);
            stack.push([currentColumn + 1,currentRow]);
            stack.push([currentColumn - 1,currentRow]);
            stack.push([currentColumn,currentRow+1]);
            stack.push([currentColumn,currentRow-1]);    
        }
        
        //no liberty found
        return [false, deathStone];        
    }

    /**
     * this method check if a the user is against the rule of the ko fright
     * "ko fright" rule, reappearance is not allowed in go, the user cannot recapture the same stone
     * https://en.wikipedia.org/wiki/Ko_fight
     * @param {array} previousCapture the x and y of removed stone (if there are stone that were removed in the previous step)
     * @param {array} currentCapture the x and y of the current move (a move that will capture a stone)
     * @return {boolen} a statement that indicate whether or not this position vaild to play
     */
    captureValidity(previousCapture, currentCapture){
        if(previousCapture[0] === currentCapture[0] && previousCapture[1] === currentCapture[1]){
            return false;
        }else{
            return true;
        }
    }
}