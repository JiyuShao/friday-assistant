import cloneDeep from 'lodash-es/cloneDeep';
import mergeWith from 'lodash-es/mergeWith';

/**
 * 深合并克隆，如果是 undefined 和 Array，会覆盖
 * @param object
 * @param sources
 * @returns
 */
export const mergeCloneDeep = (object, sources) => {
  return mergeWith(
    cloneDeep(object),
    cloneDeep(sources),
    (objValue, srcValue, key, obj) => {
      if (typeof srcValue === 'undefined') {
        obj[key] = srcValue;
      } else if (Array.isArray(objValue)) {
        return srcValue;
      }
      return undefined;
    }
  );
};
