import { isNil, isNaN, isEmpty } from 'lodash';

/**
 * Utility function that takes an array of functions, each of which takes an id as their
 * only parameter and return a value (e.g. xFromId, yFromId, radiusFromId, etc), and validates
 * the input
 * @param id
 * @param functionArray - array of functions that take id and return a scalar value
 * @return [boolean indicating valid arguments, the return values of all functions]
 */
export function validateArguments(id, functionArray) {
  let isValid = true;
  const returnValues = functionArray.map((idFunction) => {
    const res = idFunction(id);
    isValid = isValid ? (!isNil(res) && !isNaN(res)) : isValid;
    return res;
  });
  return [isValid, returnValues];
}

/**
 * Validates the path's d attribute, and IF the path is empty or the invalid
 * flag is set to true, removes the nodeSelection
 * @param nodeSelection - a d3 selection to remove if dAttribute is an empty string
 * @param dAttribute {string} - the actual d attribute of this path node
 * @param isValid {boolean} - if true, removes the node
 * @return {boolean} - true if the nodeSelection is valid, false if invalid and the nodeSelection was removed
 */
export function removeNodeIfPathIsInvalid(nodeSelection, dAttribute, isValid) {
  if (
    !isValid
    || isEmpty(dAttribute)
    || dAttribute.includes('undefined')
  ) {
    nodeSelection.node().remove();
    return false;
  }
  return true;
}
