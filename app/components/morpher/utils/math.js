/**
 * Generate evenly spaced values
 *
 * @export
 * @param {Number} a
 * @param {Number} b
 * @param {Number} n
 * @returns {Array}
 * @example
 *
 * linspace(1, 2, 3)
 * // [1, 1.5, 2]
 */

/* eslint-disable-next-line import/prefer-default-export */
export const linspace = (a, b, narg) => {
  let n = (typeof narg === 'undefined')
    ? Math.max(Math.round(b - a) + 1, 1)
    : narg;

  if (n < 2) {
    return n === 1 ? [a] : [];
  }
  let i; const ret = Array(n);
  n -= 1;
  for (i = n; i >= 0; i -= 1) {
    ret[i] = (i * b + (n - i) * a) / n;
  }
  return ret;
};
