"use strict";
class Canvas{
  static WIDTH = 800;
  static HEIGHT = 800;
  #gameScreen;
  #context;
  /**
   * the canvas of the game 
   */
  constructor(){
    //some regualr setting
    this.#gameScreen = document.getElementById("gameScreen");
    this.#context = this.#gameScreen.getContext("2d");
    this.#gameScreen.width = Canvas.WIDTH;
    this.#gameScreen.height = Canvas.HEIGHT;
    this.#context.font = "20px Times New Roman";
    //start the game and pass in this canvas
    new Game(this);
  }  

  get context(){
    return this.#context;
  }

  get gameScreen(){
    return this.#gameScreen;
  }

  /**
   * this method draws different for the game based on the output
   * @param {number} x 
   * @param {number} y 
   * @param {number} colour 
   * @param {number} radius 
   */
  drawCircle(x,y,colour,radius){
    this.#context.fillStyle = colour;
    this.#context.beginPath();
    this.#context.arc(
      x,
      y,
      radius,
      0,
      2 * Math.PI
    )
    this.#context.fill();
    //change the colour back to normal setting
    this.#context.fillStyle = "black";
  }
}

const canvas = new Canvas();
