/*global
 d3
 */

// helper functions for manipulating draw order of svg elements.
// from https://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3

d3.selection.prototype.moveToBack = function () {
  return this.each(function () {
    var firstChild = this.parentNode.firstChild;
    if (firstChild) {
      this.parentNode.insertBefore(this, firstChild);
    }
  });
};

d3.selection.prototype.moveToFront = function () {
  return this.each(function () {
    this.parentNode.appendChild(this);
  });
};

d3.selection.prototype.union = function (that) {
  if (that instanceof d3.selection) {
    var newselection = d3.select(null); //ensure the correct prototype
    newselection.splice(0, 1);            //empty the selection
    [].push.apply(newselection, this);   //push in this selection, without loosing the prototype
    [].push.apply(newselection, that);   //push in that selection, without loosing the prototype
    return newselection;
  } else {
    throw new Error("Can only union with another d3 selection");
  }
};

/*eslint-disable */
var UtilsD3;
UtilsD3 = (function () {
  'use strict';

  return {
    getAccumulatedTranslate: getAccumulatedTranslate,
    getAncestor: getAncestor,
    getTransform: getTransform
  };

  function getAccumulatedTranslate(element, numSteps) {
    var transform = d3.transform(d3.select(getAncestor(element, numSteps)).attr("transform"));
    for (var i = numSteps - 1; i >= 0; --i) {
      var currentTransform = d3.transform(d3.select(getAncestor(element, i)).attr("transform"));
      transform.translate[0] += currentTransform.translate[0];
      transform.translate[1] += currentTransform.translate[1];
    }
    return transform;
  }

  function getAncestor(element, numSteps) {
    var ancestor = element;
    for (var i = 0; i < numSteps; ++i) {
      ancestor = ancestor.parentElement;
    }
    return ancestor;
  }

  function getTransform(element) {
    return d3.transform(d3.select(element).attr("transform"));
  }

})();
export {UtilsD3};
/*eslint-enable */
