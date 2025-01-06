"use strict";
class Background{
    #game;
    #margin;
    #gap;
    #firstStarPoint;
    /**
     * this class implant the background of the game, it draws the go board
     * @param {object} game an instance of the main game
     */
    constructor(game){
        this.#game = game;
        //the space between each line
        this.#gap = 40;
        this.#margin = (Canvas.WIDTH - ((19-1) * this.#gap))/2;
        this.#firstStarPoint = [this.#gap *3+ this.#margin, this.#gap * 3 + this.#margin];
    }

    get gap(){
        return this.#gap;
    }

    get margin(){
        return this.#margin;
    }

    /**
     * this method is constantly called by the game set interval
     * It draws the actual board of the go game
     */
    update(){
        //this.#game.canvas.context.fillC
        //go has 19 lines
        
        this.#game.canvas.context.drawImage(
            document.getElementById("background"),
            0,
            0,
            Canvas.WIDTH, 
            Canvas.HEIGHT
        );
    
        for(let i=0; i<Board.LINE; i++){
            this.#drawVerticalLines(i*this.#gap + this.#margin);
            this.#drawHorizontalLines(i*this.#gap + this.#margin);
            
        }
        //draw all the star points, there are 9 points on a go board
        //horizontally
        for(let i=0; i<3;i++){
            //veritcally
            for(let j =0; j<3; j++){
                this.#drawStarPoint(i*this.#gap *6+ this.#firstStarPoint[0], j*this.#gap *6+ this.#firstStarPoint[1]);
            }
        }
        
    }

    /**
     * this method draws a vertical line
     * @param {number} x the starting x position of the line
     */
    #drawVerticalLines(x){
        this.#game.canvas.context.lineWidth = 0.5;
        this.#game.canvas.context.beginPath();
        //start at the margin
        this.#game.canvas.context.moveTo(x, this.#margin);
        //end at the height minus the margin
        this.#game.canvas.context.lineTo(x, Canvas.HEIGHT -this.#margin);
        this.#game.canvas.context.stroke();
    }

    /**
     * this method draws a horizontal line
     * @param {number} y the starting y position of the line
     */
    #drawHorizontalLines(y){
        this.#game.canvas.context.lineWidth = 0.5;
        this.#game.canvas.context.beginPath();
        this.#game.canvas.context.moveTo(this.#margin, y);
        this.#game.canvas.context.lineTo(Canvas.WIDTH -this.#margin, y);
        this.#game.canvas.context.stroke();
    }

    /**
     * draws a small black point as the star point
     * @param {number} x the x coordinate of the star point
     * @param {number} y the y coordinate of the star point
     */
    #drawStarPoint(x, y){
        this.#game.canvas.context.globalAlpha = 0.7;
        this.#game.canvas.context.beginPath();
        this.#game.canvas.context.arc(
            x,
            y,
            4,
            0,
            2 * Math.PI
        )
        
        this.#game.canvas.context.fill();
        this.#game.canvas.context.globalAlpha = 1;
    }
}