import { Canvas } from "./renderer/canvas.js";
import { Scene } from "./scene/scene.js";

class InputHandler {
  /**
   * 
   * @param {Canvas} canvas The `Canvas` for mouse interaction.
   * @param {Scene} scene The `Scene` for mouse interaction.
   */
  constructor (canvas, scene) {
    /** @type {Scene} */
    this.scene  = scene;
    this.mousePosition = [0, 0];
    
    canvas._canvas.onmousemove = (event) => {
      let rect = canvas._canvas.getBoundingClientRect();
      this.mousePosition = [event.pageX - rect.x, event.pageY - rect.y];
    }

    canvas._canvas.onmousedown = (event) => {
      let rect = canvas._canvas.getBoundingClientRect();
      this.mousePosition = [event.pageX - rect.x, event.pageY - rect.y];
      
      if (event.button == 0) {
        this.onClicked(event);
      }
      if (event.button == 2) {
        this.onRightClicked(event);
      }
    }
  }

  get mouseX() { return this.mousePosition[0]; }
  get mouseY() { return this.mousePosition[1]; }
  
  /**
   * 
   * @param {MouseEvent} event 
   */
  onClicked(event) {
    let mouseWorldPosition = this.scene.canvasToWorldCoords(this.mousePosition);
    this.scene.mobjects.forEach(mobjectRef => {
      let mobject = mobjectRef.obj;
      if (mobject.isInteractive && mobject.pointIsInside(mouseWorldPosition)) {
        mobject.onClicked(event, mouseWorldPosition);
      }
    });
  }

  /**
   * 
   * @param {MouseEvent} event 
   */
  onRightClicked(event) {

  }
}

export { InputHandler }
