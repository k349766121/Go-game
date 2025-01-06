"use strict";
class Board{
    static LINE = 19;
    #game;
    #spare;
    //the folowing two variables are for the virtual baord's white and black
    //so they are not the stone.js variable but in board.js
    #black;
    #white;
    //made up using array, used for 气 check
    #virtualBoard;
    //records for undo
    #previousBoard;
    #possiblePreviousBoard;
    
    /**
     * this class stores a array board and use the information to draw the stones that will be display on the actual board
     * In other words, this class stores all the position information and output as needed
     * @param {object} game an instance of the game class
     */
    constructor(game){
        this.#game = game;
        //use 0 to represent a spare
        this.#spare = 0;
        //1 represent a black
        this.#black = 1;
        //2 represent a white;
        this.#white = 2;
        this.#virtualBoard = [];
        this.#previousBoard= [];
        this.#possiblePreviousBoard= [];
        this.#initializeBoard(); 
    }

    get black(){
        return this.#black;
    }

    get white(){
        return this.#white;
    }

    get spare(){
        return this.#spare;
    }

    get virtualBoard(){
        return this.#virtualBoard;
    }

    get previousBoard(){
        return this.#previousBoard;
    }

    get possiblePreviousBoard(){
        return this.#possiblePreviousBoard;
    }


    /**
     * this method create an array board which stores all the stone position based on column and row
     * so that other classes could know where have stones and it is easier to understand compare to x,y coordinate
     */
    #initializeBoard(){
        //false meaning out of the board, therefore, when a search program reaches to false, it knows that is is out of the board
        //only the 1 - 19 column and row is the vaild board
        for(let column= 0; column<Board.LINE+2; column++){
            //a column always start with a false
            this.#virtualBoard.push([false]);
            this.#previousBoard.push([false]);
            this.#possiblePreviousBoard.push([false]);
            for(let row=0; row<Board.LINE; row++){
                //if it is the first or the last column, all their row also starts or ends with false
                if(column === 0 || column === 20){
                    this.#virtualBoard[column].push(false);
                    this.#previousBoard[column].push(false);
                    this.#possiblePreviousBoard[column].push(false);
                }else{
                    //initally, the vaild baord are all spare
                    this.#virtualBoard[column].push(this.#spare);   
                    this.#previousBoard[column].push(this.#spare);  
                    this.#possiblePreviousBoard[column].push(this.#spare);  
                }    
            }
            //a column always end with a false
            this.#virtualBoard[column].push(false);
            this.#previousBoard[column].push(false);
            this.#possiblePreviousBoard[column].push(false);
        }
    }

    /**
     * this method copies the virtualBoard to previous Board
     * @param {arr} board1 a 2d array
     * @param {arr} board2 a 2d array
     */
    copyBoard(board1, board2){
        for(let column = 0; column<this.#virtualBoard.length; column++){
            for(let row = 0; row<this.#virtualBoard[column].length; row++){
                board1[column][row] = board2[column][row];
            }
        }
    }

    /**
     * this method change the position in virtural (arr) board to the actual board(x,y)
     * @param {number} column the colum number in the stone arr
     * @param {number} row the row number in the stone arr
     * @return {arr} the x and y of the actual position in the board
     */
    getBoardPosition(column,row){
        const x = column * this.#game.background.gap;
        const y = row * this.#game.background.gap;
        return [x,y];
        
    }

    /**
     * this method change the position from the actual board to the virture (arr) board
     * @param {number} x the x coord when the user click to play a move
     * @param {number} y the y coord when the user click to play a move
     * @return {arr} the column and row of the vritual baord
     */
    getVirtualPosition(x,y){
        const column = x /this.#game.background.gap;
        const row = y /this.#game.background.gap;
        return [column,row];
    }

    /**
     * this method checks if the surrounds extists black, white or spare using the information stored inside the virtual board
     * @param {number} column the column of the virtual board
     * @param {number} row the row of the virtual board
     * @param {number} type black, white or spare
     * @return {boolean} a statement about whether the type is found on surrounding
     */
    ifSurroundingExists(column, row, type){
        if(this.#virtualBoard[column + 1][row] === type || this.#virtualBoard[column -1][row] === type
            || this.#virtualBoard[column][row +1] === type || this.#virtualBoard[column][row-1] === type){
            return true;
        } 
    }

    /**
     * an API that set the position as a black stone
     * @param {number} column the column of the virtual board
     * @param {number} row the row of the virtual board
     */
    setBlack(column, row){
        this.#virtualBoard[column][row] = this.#black;
    }

    /**
     * an API that set the position as a whitestone
     * @param {number} column the column of the virtual board
     * @param {number} row the row of the virtual board
     */
    setWhite(column, row){
        this.#virtualBoard[column][row] = this.#white;
    }

    /**
     * an API that set the position as a spare(no stone)
     * @param {number} column the column of the virtual board
     * @param {number} row the row of the virtual board
     */
    setSpare(column, row){
        this.#virtualBoard[column][row] = this.#spare;
    }

    /**
     * this method checks if the surrounds extists black, white or spare specfic for estiamte 
     * where a stone can be labeled as dead by the user
     * @param {number} column 
     * @param {number} row 
     * @param {number} type black,white or spare
     * @return {boolean} a statement about whether the type is found on surrounding
     */
    ifSurroundingExistsForEstimate(column, row, type){
        //the type is found if is on the left, right, up or down of the stone and the type is not labeled by the user as a dead stone
        if((this.#virtualBoard[column + 1][row] === type && !this.#game.estimating.userSlectedDead.has(`${column + 1} ${row}`)) || (this.#virtualBoard[column -1][row] === type && !this.#game.estimating.userSlectedDead.has(`${column - 1} ${row}`))
            || (this.#virtualBoard[column][row +1] === type && !this.#game.estimating.userSlectedDead.has(`${column} ${row +1}`)) ||(this.#virtualBoard[column][row -1] === type && !this.#game.estimating.userSlectedDead.has(`${column} ${row -1}`))){
            return true;
        } 
    }

    /**
     * run when the undo button is clicked
     */
    undo(){
        document.getElementById("undoButton").disabled = true;
        this.copyBoard(this.virtualBoard, this.previousBoard);
        this.#game.stone.alternateTurn();
    }

    /**
     * this method constantly used the information received from other classes to update the actual baord for user to see
     */
    update(){
        //those two for loops go through the whole virtual board
        for(let row = 1; row<Board.LINE+1; row++){
            for(let column=1; column<Board.LINE+1; column++){
                //get the x,y position of the column row
                const actualPosition = this.getBoardPosition(column,row);
                if(this.#virtualBoard[column][row] !== this.#spare){
                    if(this.#virtualBoard[column][row] === this.#black){
                        this.#game.stone.drawBlackStone(actualPosition[0],actualPosition[1]);
                    }else{
                        this.#game.stone.drawWhiteStone(actualPosition[0],actualPosition[1]);
                    }
                    //if the user used the estimate method
                    if(this.#game.estimating.estimateState){
                        if(this.#game.estimating.userSlectedDead.has(`${column} ${row}`)){
                            this.#game.estimating.drawDeadSelectedSymbol(actualPosition[0],actualPosition[1]);
                        }
                    }
                }
                //draw the result of the estimate for the user to see
                if(this.#game.estimating.estimateResultAvailable){
                    if(this.#game.estimating.blackTerritory.has(`${column} ${row}`)){
                        this.#game.estimating.drawTerritorySymbol(actualPosition[0],actualPosition[1],this.#game.board.black);
                    }else if(this.#game.estimating.whiteTerritory.has(`${column} ${row}`)){
                        this.#game.estimating.drawTerritorySymbol(actualPosition[0],actualPosition[1],this.#game.board.white);
                    }
                }
                
            }
        }
    }
}