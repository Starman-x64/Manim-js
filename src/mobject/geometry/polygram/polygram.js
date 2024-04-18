import { VMobject } from "../../types/vectorizedMobject.js";

/**
 * A generalised `Polygon` allowing for disconnected sets of edges.
 */
class Polygram extends VMobject {
  /**
   * @inheritdoc
   * @param {Ndarray[][]} vertexGroups The groups of vertices making up the `Polygram`. The first vertex in each group is repeated to close the loop. Each point must be 3-dimensional: `[x,y,z]`.
   */
  constructor(vertexGroups, kwargs) {
    super(kwargs);
    
    /**
     * Temporary property storing the passed vertex groups to be accessed by `this.generatePoints()`.
     * @type {Ndarray[][]}
     */
    this._tmp_vertexGroups = vertexGroups;
    
    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (this.constructor.name == "Polygram") {
      this.initMobject();
    }
  }
  generatePoints() {
    // loop through each vertex group
    // if this isn't the first group, push "M" into this.curveTypes.
    // push vertexGroup.length - 2 "L"s into this.curveTypes
    // (with n points, there will be n-1 lines between them. We ignore the last point so only consider n-2 lines for now)
    // if the last point is the first point, we will need to append a "Z" to this.curveTypes, otherwise append an "L".
    // append the group to this.points, ignoring the last point if it is the same as the first.
    /** @type {Ndarray | null} */
    let pointsMatrix = null;
    this._tmp_vertexGroups.forEach((vertexGroup, index) => {
      if (index != 0) {
        this.curveTypes.push("M");
      }
      this.curveTypes = this.curveTypes.concat(Array(vertexGroup.length - 2).fill("L"));
      /** @type {Ndarray} */
      let firstVertex = vertexGroup[0];
      /** @type {Ndarray} */
      let lastVertex = vertexGroup[vertexGroup.length-1];
      /** @type {Ndarray} */
      let groupVertexMatrix = nj.array(firstVertex);
      
      if (firstVertex.flatten().selection.data.toString() == lastVertex.flatten().selection.data.toString()) {
        this.curveTypes.push("Z");
        // Concatenate all the points into one array except for the last point (as it is the first repeated).
        groupVertexMatrix = vertexGroup.reduce((a, x, i) => i != 0 && i != vertexGroup.length - 1 ? nj.concatenate(a, x) : a, firstVertex);
      }
      else {
        this.curveTypes.push("L");
        // Concatenate all the points into one array including the last point.
        groupVertexMatrix = vertexGroup.reduce((a, x, i) => i != 0 ? nj.concatenate(a, x) : a, firstVertex);
      }
      
      if (pointsMatrix === null) {
        pointsMatrix = groupVertexMatrix.clone();
      }
      else {
        pointsMatrix = nj.concatenate(pointsMatrix, groupVertexMatrix);
      }
    });
    
    this.points = pointsMatrix.clone();

    // console.log(this.points.toString());
    // console.log(this.curveTypes);
  }

}

export { Polygram };