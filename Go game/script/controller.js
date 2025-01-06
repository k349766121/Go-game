"use strict";
class Controller{
    #game;
    #x;
    #y;
    #positionVaildity;
    /**
     * this class receive information from user's output such as clicking and moving a mouse
     * then it call method form other class according to the input
     * @param {object} game the instance of the main game, this variable connects this class with the main game
     */
    constructor(game){
        this.#game = game;
        this.#positionVaildity = false;
        //game have not start when this class is created, so the user is not in any state
        document.addEventListener("mousemove",  this.#updateMouse);
        document.addEventListener("click", this.#updateClick);

        //detect when buttons are click by the user
        document.getElementById("passButton").addEventListener("click", ()=>this.#game.stone.alternateTurn());
        document.getElementById("blackOnlyButton").addEventListener("click", ()=>this.#game.stone.blackOnlyMode());
        document.getElementById("estimateButton").addEventListener("click", ()=>this.#game.estimating.initalOrEndEstimate());
        document.getElementById("confirmButton").addEventListener("click", ()=>this.#game.estimating.estimate());
        document.getElementById("undoButton").addEventListener("click", ()=>this.#game.board.undo());
    }

    get x(){
        return this.#x;
    }

    get y(){
        return this.#y;
    }

    get positionVaildity(){
        return this.#positionVaildity;
    }
    
    /**
     * this method changed the x and y value from relative to the screen to relative to the canvas
     * @param {number} clientX the x of the cursor on the screen
     * @param {number} clientY this y of the cursor on the screen
     */
    #cursorPosition(clientX, clientY){
        
        const canvasDimension = this.#game.canvas.gameScreen.getBoundingClientRect();
        const absoluteX = clientX - canvasDimension.left;
        const absoluteY = clientY  - canvasDimension.top;
        //make sure the x and y is on the board and on the line
        //x, y must be an mutiple of the gap to be on the line
        if(absoluteX%this.#game.background.gap <this.#game.background.gap/2){
            this.#x = Math.floor(absoluteX/this.#game.background.gap)*this.#game.background.gap;
        }else{
            this.#x = Math.ceil(absoluteX/this.#game.background.gap)*this.#game.background.gap;
        }
        if(absoluteY%this.#game.background.gap <this.#game.background.gap/2){
            this.#y = Math.floor(absoluteY/this.#game.background.gap)*this.#game.background.gap;
        }else{
            this.#y = Math.ceil(absoluteY/this.#game.background.gap)*this.#game.background.gap;
        }

        //check if the final position are on the board, the Math.floor may cause 
        //x or y becomes 0 which is out of the baord
        if(this.#y < this.#game.background.margin ||this.#y > Canvas.HEIGHT - this.#game.background.margin 
            ||this.#x < this.#game.background.margin ||this.#x > Canvas.WIDTH - this.#game.background.margin){
            //records the result
            this.#positionVaildity = false;
        }else{
            this.#positionVaildity = true;
        }
    }

    /**
     * this method get the cursor position
     * @param {html event} event 
     */
    #updateMouse=(event)=>{
        this.#cursorPosition(event.x,event.y);
    }

    /**
     * this method reacts to the click based on the state of the go game
     * @param {html event} event 
     */
    #updateClick=(event)=>{
        //during estimating, playing stone is not allowed
        if(this.#game.estimating.estimateState){
            this.#game.estimating.selectingDeadStone();
        }else{
            this.#game.stone.playMove();
        }
    }
}