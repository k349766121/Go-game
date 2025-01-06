"use strict";
class Game{
    #fps = 24;
    #timeInterval = 1000 / this.#fps;
    #canvas;
    #estimating;
    #background;
    #board;
    #controller;
    #interval;
    #stone
    #rule;
    /**
     * the main game, it calls all the updates from different class and draw eveerything
     * @param {object} canvas an instance of the canvas
     */
    constructor(canvas){
        this.#canvas = canvas;
        this.#stone = new Stone(this);
        this.#estimating = new Estimating(this);
        this.#controller = new Controller(this);
        this.#rule = new Rule(this);
        this.#board = new Board(this);
        this.#background = new Background(this);
        this.#runGame();
    }

    get canvas(){
        return this.#canvas;
    }

    get estimating(){
        return this.#estimating;
    }

    get background(){
        return this.#background;
    }

    get board(){
        return this.#board;
    }

    get stone(){
        return this.#stone;
    }

    get controller(){
        return this.#controller;
    }

    get rule(){
        return this.#rule
    }

    /**
     * this method draws everything continuously
     */
    #runGame(){
        this.#interval = setInterval(() => {
            this.#background.update();
            this.#board.update();
            if(!this.#estimating.estimateState){
                this.#stone.update();
            }
        },this.#timeInterval);
    }
}
