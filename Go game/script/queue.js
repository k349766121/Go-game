"use strict";
//those code comes form my first assignemnt, this program reused them
class Node {
    /**
     * this class created a linked list
     * @param {obejct} value the current object stored in this node
     * @param {object} ref the next object stored after this node
     */
    constructor(value, ref) {
      //two properties of a node
      this.value = value;
      this.ref = ref;
    }
}

class Queue {
    #length;
    #head;
    #tail;
    /**
     * this class create a queue
     */
    constructor() {
        this.#length = 0;
        this.#head = null;
        this.#tail = null
    }

    get length(){
        return this.#length;
    }

    /**
     * remove the first elements
     * @returns {object} the value that get removed
     */
    
    dequeue() {
        //if there are still elements can be removed
        if (this.#head !== null) {
            //stores the head value so that it can be return 
            const value = this.#head.value;
            //make the second last in become the head
            this.#head = this.#head.ref;
            this.#length--;
            return value;
        }else{
            //if there are no elemnts left in the queue 
            return null;
        }
    }
    
    /**
     * add elements into the queue
     * @param {object} value an fire object that will be used for the spewy tower
     */
    enqueue(value) {
        //create node
        const newNode = new Node(value, null);
        if (this.#head === null) {
            //If there's no head, make it the head and tail
            this.#head = newNode;
            this.#tail = newNode;
        } else{
            //if the queue has head
            //make the tail point to the new node
            this.#tail.ref = newNode;
            //then the new node become the new tail
            this.#tail = newNode;
        }
        this.#length++;
    }

    /**
     * @returns {object} the value that will be dequeue
     */
    peek(){
        return this.#head.value;
    }
}