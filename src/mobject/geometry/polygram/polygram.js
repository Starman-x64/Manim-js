import { Validation } from "../../../utils/validation.js";
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
    super();
    
    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (Validation.isOfClass(this, "Polygram")) {
      this._init(vertexGroups, kwargs);
    }
  }
  _init(vertexGroups, kwargs) {
    /**
     * Temporary property storing the passed vertex groups to be accessed by `this.generatePoints()`.
     * @type {Ndarray[][]}
     */
    this._tmp_vertexGroups = vertexGroups;
    
    super._init(kwargs);
  }
  generatePoints() {
    // loop through each vertex group
    // if this isn't the first group, push "M" into this.curveTypes.
    // push vertexGroup.length - 2 "L"s into this.curveTypes
    // (with n points, there will be n-1 lines between them. We ignore the last point so only consider n-2 lines for now)
    // ~~if the last point is the first point, we will need to append a "Z" to this.curveTypes, otherwise append an "L".~~
    // append the group to this.points, ignoring the last point if it is the same as the first.
    /** @type {Ndarray | null} */
    let pointsMatrix = null;
    /** @type {Ndarray[]} */
    let pointsArray = [];
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
      
      this.curveTypes.push("L");
      // Concatenate all the points into one array including the last point.
      pointsArray = pointsArray.concat(vertexGroup);
      // groupVertexMatrix = nj.stack(vertexGroup);
      
      
      // if (pointsMatrix === null) {
      //   pointsMatrix = groupVertexMatrix.clone();
      // }
      // else {
      //   console.log(pointsMatrix.toString());
      //   console.log(groupVertexMatrix.toString());
      //   pointsMatrix = nj.stack([pointsMatrix, groupVertexMatrix]);
      //   console.log(pointsMatrix.toString());
      // }
    });
    this.points = nj.stack(pointsArray);

    // console.log(this.points.toString());
    // console.log(this.curveTypes);
  }

}

export { Polygram };