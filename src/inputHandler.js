import { Canvas } from "./renderer/canvas.js";

class InputHandler {
  /**
   * 
   * @param {Canvas} canvas The canvas for mouse interaction.
   */
  constructor (canvas) {
    this.mousePosition = [0, 0];
    
    canvas._canvas.onmousemove = (event) => {
      let rect = canvas._canvas.getBoundingClientRect();
      this.mousePosition = [event.pageX - rect.x, event.pageY - rect.y];
    }

    canvas._canvas.onmousedown = (event) => {
      this.mouseButton = event.button;
      console.log(this.mouseButton);
    }
  }

  get mouseX() { return this.mousePosition[0]; }
  get mouseY() { return this.mousePosition[1]; }
}

export { InputHandler }
