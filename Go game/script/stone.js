"use strict";
class Stone{
    #game;
    #blackOnlyMode;
    #blackTurn;
    #stoneRadius;
    #afterMoveAudio;
    #captureStoneAudio;
    #virtualPosition;
    #playStoneVaildity;
    //the following varaibles are used in a ko fright
    #previousCaptured;
    #oneTurnCaptureCount;
    //dead stone are used in estimating the terrority
    #blackDeadStone;
    #whiteDeadStone;
    /**
     * this class place a correct stone at a position choosen by the user and also records some information releated to the stone
     * @param {object} game the object of the game
     */
    constructor(game){
        this.#game = game;
        //a mode that the user can only play black stone
        this.#blackOnlyMode = false;
        //black goes first
        this.#blackTurn = true;
        this.#stoneRadius = 15;
        this.#afterMoveAudio = new Audio('audio/afterMoveAudio.mp3');
        this.#captureStoneAudio = new Audio('audio/captureStoneAudio.m4a');
        //controls if a position can put down stone or not
        this.#playStoneVaildity = false;

        //no captured at the start of the game
        this.#previousCaptured = ["",""];
        this.#oneTurnCaptureCount = 0;
        this.#blackDeadStone = 0;
        this.#whiteDeadStone = 0;
    }

    get blackDeadStone(){
        return this.#blackDeadStone;
    }
    
    get whiteDeadStone(){
        return this.#whiteDeadStone;
    }
    
    /**
     * this method alternate the move, in go, the user only play one move, then it will be the turn for another user to play
     */
    alternateTurn(){
        if(!this.#blackOnlyMode){
            if(this.#blackTurn){
                this.#blackTurn = false;
            }else{
                this.#blackTurn = true;
            }
        }    
    }

    /**
     * pre: when the user click the black only button
     * in this mode, the user can only play blacks
     */
    blackOnlyMode(){
        if(this.#blackOnlyMode){
            //end the mode
            this.#blackOnlyMode = false;
            document.getElementById("passButton").disabled = false;
            document.getElementById("estimateButton").disabled = false;
        }else{
            //start the mode
            this.#blackOnlyMode= true;
            this.#blackTurn = true;
            document.getElementById("passButton").disabled = true;
            document.getElementById("estimateButton").disabled = true;
        }
    }

    /**
     * this method draws the white stone
     * @param {number} x the x-coordinate of the stone
     * @param {number} y the y-coordinate of the stone
     */
    drawWhiteStone(x,y){
        //draw the frame to make it more visual appearing
        this.#game.canvas.drawCircle(x,y,"black",this.#stoneRadius + 1);
        this.#game.canvas.drawCircle(x,y,"white",this.#stoneRadius);
    }

    /**
     * this method draws the black stone
     * @param {number} x the x-coordinate of the stone
     * @param {number} y the y-coordinate of the stone
     */
    drawBlackStone(x,y){
        //draw the frame to make it more visual appearing
        this.#game.canvas.drawCircle(x,y,"white",this.#stoneRadius + 1);
        this.#game.canvas.drawCircle(x,y,"black",this.#stoneRadius);
    }

    /**
     * pre: when the user click the board 
     * this method place a stone on the intended position
     */
    playMove(){
        if(this.#playStoneVaildity){
            this.#game.board.copyBoard(this.#game.board.possiblePreviousBoard,
                this.#game.board.virtualBoard);
            //place the stone
            if(this.#blackTurn){
                this.#game.board.setBlack(this.#virtualPosition[0],this.#virtualPosition[1]);

            }else{
                this.#game.board.setWhite(this.#virtualPosition[0],this.#virtualPosition[1]);
            }
            
            //check if the stone follows the rule
            const stoneType = this.#game.board.virtualBoard[this.#virtualPosition[0]][this.#virtualPosition[1]];
            //this stone may not have liberty right now, but it can capture other stones and gain liberty
            //this stone will block its sorrounding stone's liberties
            this.#checkSurrounding(this.#virtualPosition[0]+1,this.#virtualPosition[1], stoneType);
            this.#checkSurrounding(this.#virtualPosition[0]-1,this.#virtualPosition[1], stoneType);
            this.#checkSurrounding(this.#virtualPosition[0],this.#virtualPosition[1]+1, stoneType);
            this.#checkSurrounding(this.#virtualPosition[0],this.#virtualPosition[1]-1, stoneType);

            //forbidden points, if there is no liberty on that point
            if(!this.#game.rule.haveLiberty(this.#virtualPosition[0],this.#virtualPosition[1])[0]){
                //remove the stone
                //it is not capturing a stone but just an illegal play, so I didn't used the captured stone method
                this.#game.board.setSpare(this.#virtualPosition[0],this.#virtualPosition[1]);
            }else{
                this.#game.board.copyBoard(this.#game.board.previousBoard, this.#game.board.possiblePreviousBoard);
                document.getElementById("undoButton").disabled = false;
                this.#afterMoveAudio.play();
                this.alternateTurn();
                //if the capture count is not 1, there are no needed to consider the ko fright
                if(this.#oneTurnCaptureCount !==1){
                    //reset the ko fright's forbidden point
                    this.#previousCaptured = ["",""];
                }
                this.#oneTurnCaptureCount = 0;
            }  
        }
    }

    /**
     * check if the position have liberty or not using the rule.js and records useful information
     * @param {number} column the column of the stone
     * @param {number} row the row of the stone
     * @param {number} stoneType a variable that indicate the type of the stone
     */
    #checkSurrounding(column,row, stoneType){
        //a stone mainly affect its opposite colours liberty
        if(this.#game.board.virtualBoard[column][row] === this.#oppositeStone(stoneType)){
            const libertyResult = this.#game.rule.haveLiberty(column,row); 
            //do not have liberty
            //this index stores true if there is liberty, so ! mark is needed
            if(!libertyResult[0]){
                this.#oneTurnCaptureCount = libertyResult[1].size;
                //ko fright may happen if only one stone is captured
                if(libertyResult[1].size ===1){
                    if(this.#game.rule.captureValidity(this.#previousCaptured, this.#virtualPosition)){
                        //0 is x, 1 is y
                        //records for the next possible ko fright
                        this.#previousCaptured = [column,row];
                        this.#captureStone(column,row);
                    }
                }else{
                    //other stones also got captured, ko fright won't happened
                    //remove all the dead stones
                    const iterator = libertyResult[1].values();
                    for(let i=0; i<libertyResult[1].size; i++){
                        //ko fright only happened when the captured stone is one
                        const position = iterator.next().value;
                        
                        //find the space in the string that sperate the column and row
                        for(let k = 0; k<position.length; k++){
                            if(position[k] === " "){
                                this.#captureStone(Number(position.slice(0,k)),Number(position.slice(k)));
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * this method capture a stone and records the information
     * @param {number} column the column of the stone 
     * @param {number} row the row of the stone
     */
    #captureStone(column, row){
        const stoneType = this.#game.board.virtualBoard[column][row];
        if(stoneType ===this.#game.board.black){
            this.#blackDeadStone ++;
        }else{
            this.#whiteDeadStone ++;
        }
        //becomes spare
        this.#game.board.setSpare(column,row);
        this.#captureStoneAudio.play();
    }

    /**
     * this method returns the oppostie stone of the input stone
     * @param {number} stoneType white or black
     * @return {number} also white or black
     */
    #oppositeStone(stoneType){
        if(stoneType === this.#game.board.black){
            return this.#game.board.white;
        }else{
            return this.#game.board.black;
        }
    }

    /**
     * this method draws a temporary stone to indicate the user where is the stone going to land
     */
    update(){
        if(this.#game.controller.positionVaildity){
            this.#virtualPosition = this.#game.board.getVirtualPosition(this.#game.controller.x, this.#game.controller.y);
            if(this.#game.rule.alreadyHaveStone(this.#virtualPosition[0],this.#virtualPosition[1])){
                this.#playStoneVaildity = false;
            }else{
                this.#playStoneVaildity = true;
                //draw a temporary stone to show the user there are they playing
                this.#game.canvas.context.globalAlpha = 0.7;
                if(this.#blackTurn){
                    //x, y in here are for the actual board
                    this.drawBlackStone(this.#game.controller.x, this.#game.controller.y);
                }else{
                    this.drawWhiteStone(this.#game.controller.x, this.#game.controller.y);
                }
                this.#game.canvas.context.globalAlpha = 1;
            } 
        }else{
            this.#playStoneVaildity = false;
        }       
    }
}