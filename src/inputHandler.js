import { Canvas } from "./renderer/canvas.js";

class InputHandler {
  /**
   * 
   * @param {Canvas} canvas The canvas for mouse interaction.
   */
  constructor (canvas) {
    this.mousePosition = [null, null];
    canvas._canvas.onmousemove = (event) => {
      let rect = canvas._canvas.getBoundingClientRect();
      this.mousePosition = [event.pageX - rect.x, event.pageY - rect.y];
      console.log("mouse location:", event.pageX - rect.x, event.pageY - rect.y);
    }
  }

  get mouseX() { return this.mousePosition[0]; }
  get mouseY() { return this.mousePosition[1]; }
}

export { InputHandler }
