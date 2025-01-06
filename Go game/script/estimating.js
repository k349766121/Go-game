"use strict";
class Estimating{
    #game;
    #estimateState;
    #estimateResultAvailable;
    #userSlectedDead;
    #selectedBlackDead;
    #selectedWhiteDead;
    #whiteTerritory;
    #blackTerritory;
    /**
     * Go is so complicated, is will easy took a perosn several decades to master it
     * therefore, based on my ability and time, I chooses to let the user to judge if some stones is potentially dead (those that still have liberties but has very little chance of surviving) 
     * otherwise, I believe machine learning and tree searching is required to determine if the stone potentially dead or not. (the computer need to know how the play the go game to make judgement)
     * this class requires users to removes (potential) dead, then it calculate the territory of each player and output the result
     * @param {*} game 
     */
    constructor(game){
        this.#game =game;
        this.#estimateState = false;
        //this variable indicates if the computer finished estimating or not
        this.#estimateResultAvailable = false;
    }

    get estimateState(){
        return this.#estimateState;
    }

    get estimateResultAvailable(){
        return this.#estimateResultAvailable;
    }

    get userSlectedDead(){
        return this.#userSlectedDead;
    }

    get whiteTerritory(){
        return this.#whiteTerritory;
    }

    get blackTerritory(){
        return this.#blackTerritory;
    }

    /**
     * pre:when the user click the estimate button or finished estimate
     */
    initalOrEndEstimate(){
        //if the game already is alrady estimating, stop the estimate
        if(this.#estimateState){
            this.#estimateState = false;
            this.#estimateResultAvailable = false;
            document.getElementById("blackOnlyButton").disabled = false;
            document.getElementById("passButton").disabled = false;
            document.getElementById("estimateButton").disabled = false;
            document.getElementById("confirmButton").hidden = true;
            document.getElementById("paragraph").innerText = "";
        }else{
            //start the estimate
            this.#userSlectedDead = new Set();
            this.#estimateState =true;
            document.getElementById("blackOnlyButton").disabled = true;
            document.getElementById("passButton").disabled = true;
            document.getElementById("estimateButton").disabled = true;
            document.getElementById("confirmButton").hidden = false;
            document.getElementById("paragraph").innerText = "Please select dead stone by clicking on top of the stone";

            //those number are temporary. those stone are slected by the user as potentially dead
            //as game progress they may survive again, so this program didn't count them in to the dead stone in the stone.js
            this.#selectedBlackDead = 0;
            this.#selectedWhiteDead = 0;   
        }
        
    }

    /**
     * this method draws a red dot to indicate that the stone is dead
     * @param {number} x the x coordinate of the symbol
     * @param {number} y the y coordinate of hte symbol
     */
    drawDeadSelectedSymbol(x,y){
        this.#game.canvas.drawCircle(x,y,"red",5);
    }

    /**
     * pre: begin to estimate
     * this method update information to the virtual board after a stone is slected
     */
    selectingDeadStone(){
        //make a copy of the click position
        const x = this.#game.controller.x;
        const y = this.#game.controller.y;
        const virtualPosition = this.#game.board.getVirtualPosition(x,y);
        if(!this.#userSlectedDead.has(`${virtualPosition[0]} ${virtualPosition[1]}`)){
            this.#userSlectedDead.add(`${virtualPosition[0]} ${virtualPosition[1]}`);
            if(this.#game.board.virtualBoard[virtualPosition[0]][virtualPosition[1]]=== this.#game.board.black){
                this.#selectedBlackDead ++;
            }else if(this.#game.board.virtualBoard[virtualPosition[0]][virtualPosition[1]]=== this.#game.board.white){
                this.#selectedWhiteDead ++;
            }
        }
    }

    /**
     * this method estimate the terrority of each players
     * the logic is, if a space's surrounding only have one type of stone, the space belong to that type of stone
     */
    estimate(){
        document.getElementById("confirmButton").hidden = true;
        //used to store the territory of each colour
        this.#whiteTerritory = new Set();
        this.#blackTerritory = new Set();
        let originalColour = false;
        for(let row = 1; row<Board.LINE+1; row++){
            for(let column=1; column<Board.LINE+1; column++){
                //if the stone is labeld by user as dead, treat it as space
                if(this.#userSlectedDead.has(`${column} ${row}`)){
                    //records the colour, so it will be changed back
                    originalColour = this.#game.board.virtualBoard[column][row];
                    this.#game.board.setSpare(column,row);
                }
                //if the position is a spare or it is a dead stone and it is not blongs to any player yet
                if(this.#game.board.virtualBoard[column][row] === this.#game.board.spare && !this.#blackTerritory.has(`${column} ${row}`) && !this.#whiteTerritory.has(`${column} ${row}`)){
                    //the method will return all the result, and it will be stored into this variable
                    const bfsStoneResult = this.#bfsNearByStone(column,row);
                    //if there are nearby stone
                    //[0] is a true or false statement
                    if(bfsStoneResult[0]){
                        //[2] is a set that stores the terrorities
                        const iterator = bfsStoneResult[2].values();
                        //if the method determine those territory belongs to black
                        //[1] stores the type (black or white)
                        if(bfsStoneResult[1] ===this.#game.board.black){
                            for(let i=0; i<bfsStoneResult[2].size; i++){
                                this.#blackTerritory.add(iterator.next().value);
                            }
                        }else{
                            //if it belongs to white
                            for(let i=0; i<bfsStoneResult[2].size; i++){
                                this.#whiteTerritory.add(iterator.next().value);
                            }
                        }
                    }
                }
                //change the selected back
                if(originalColour === this.#game.board.black){
                    this.#game.board.setBlack(column,row);
                    originalColour = false;
                }else if(originalColour === this.#game.board.white){
                    this.#game.board.setWhite(column,row);
                    originalColour = false;
                }
            }
        }
        //show the estimate for 10s
        setTimeout(()=>this.initalOrEndEstimate(), 10000);
        this.#estimateResultAvailable = true;
        //according to go's rule, eating other stone is count as 1 territoy
        const blackTotal = this.blackTerritory.size + this.#game.stone.whiteDeadStone + this.#selectedWhiteDead;
        //6.5 is the komi
        const whiteTotal = this.whiteTerritory.size + this.#game.stone.blackDeadStone + + this.#selectedBlackDead + 6.5;
        const difference = blackTotal - whiteTotal;
        if(difference>0){
            document.getElementById("paragraph").innerText = `Estiamte Result: Black + ${difference}`;
        }else if(difference<0){
            document.getElementById("paragraph").innerText = `Estiamte Result: White + ${difference * -1}`;
        }
        //due to the 6.5 komi, there are won't be any possibility to draw
       
    }

    /**
     * check if the territory is controlled by the nearby stone
     * @param {number} column the column of the beginning space
     * @param {number} row the row of the beginning space
     * @return {array} an array that shows true or false about if there are stone that can controls
     * the territory, if there are stone controlled, the array will contain the amount of the territory
     */
    #bfsNearByStone(column, row){
        const virtualBoard = this.#game.board.virtualBoard;
        const queue = new Queue();
        queue.enqueue([column,row]);
        const visited = new Set();
        //the number 3 is based on my experience on playing go, usually a stone have the power to affect or control around 3 lines
        //it may be arbitrary, but I not have the skill to train an AI to determine the values of each move
        while(queue.length && visited.size < 3){
            const visiting = queue.dequeue();
            const currentColumn = visiting[0];
            const currentRow = visiting[1];
        
            //check if the position is out of the board or already visited
            if(visited.has(`${currentColumn} ${currentRow}`) || virtualBoard[currentColumn][currentRow] === false){
                continue;
            }

            //if there are both black and white around
            //no one has the control over the terrority
            if(this.#game.board.ifSurroundingExistsForEstimate(currentColumn,currentRow,this.#game.board.black) && this.#game.board.ifSurroundingExistsForEstimate(currentColumn,currentRow,this.#game.board.white)){
                //false means this territory does not belongs to anyone
                return [false];
            }

            visited.add(`${currentColumn} ${currentRow}`);
            queue.enqueue([currentColumn + 1,currentRow]);
            queue.enqueue([currentColumn - 1,currentRow]);
            queue.enqueue([currentColumn,currentRow+1]);
            queue.enqueue([currentColumn,currentRow-1]);
            
            //if there are only blacks in the surrounding 
            //those territories belongs to the black
            if(this.#game.board.ifSurroundingExistsForEstimate(currentColumn,currentRow,this.#game.board.black)){
                return [true,this.#game.board.black, visited];
            } 

            //if there are only whites in the surrounding 
            //those territories belongs to the white
            if(this.#game.board.ifSurroundingExistsForEstimate(currentColumn,currentRow,this.#game.board.white)){
                return [true, this.#game.board.white, visited];
            } 
            
        }
        //no stone found near by
        //those territory does not belongs to anyone
        return [false];
    }



    /**
     * this method draws square to indicate the territory belongs to whom
     * @param {number} x the x coordinate of the column
     * @param {number} y the y of coordinate the row
     * @param {number} type indicates if the terrioty is black or whtie
     */
    drawTerritorySymbol(x,y,type){
        const dimension = 15;
        if(type === this.#game.board.black){
            this.#game.canvas.context.fillStyle = "black";
        }else{
            this.#game.canvas.context.fillStyle = "white";
        }
        
        this.#game.canvas.context.fillRect(
            x - dimension/2,
            y -dimension/2,
            dimension,
            dimension
        )
        //change the colour back
        this.#game.canvas.context.fillStyle = "black";
    }
}