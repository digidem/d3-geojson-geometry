import bezier from 'adaptive-bezier-curve'
import quadratic from 'adaptive-quadratic-curve'

var pi = Math.PI
var tau = 2 * pi
var epsilon = 1e-6
var tauEpsilon = tau - epsilon

var types = {
  0: 'Point',
  1: 'LineString',
  2: 'Polygon'
}

function renderSimpleType (coords, i) {
  return {
    type: types[this._types[i]],
    coordinates: this._types[i] === 0 ? coords[0] : this._types[i] === 1 ? coords : [coords]
  }
}

function getType (types) {
  return types.reduce(function (acc, type) {
    return acc === type ? type : null
  })
}

function GeoJSONContext (scale) {
  this._scale = scale || 1
  this._x0 = this._y0 = // start of current subpath
  this._x1 = this._y1 = null // end of current subpath
  this._ = []
  this._i = null
  this._types = []
}

function geoJSONContext (scale) {
  return new GeoJSONContext(scale)
}

GeoJSONContext.prototype = geoJSONContext.prototype = {
  constructor: GeoJSONContext,
  moveTo: function (x, y) {
    this._i = this._.push([[(this._x0 = this._x1 = +x), (this._y0 = this._y1 = +y)]]) - 1
    this._types[this._i] = 1
  },
  closePath: function () {
    if (this._x1 !== null) {
      this._types[this._i] = 2
      this._[this._i].push([(this._x1 = this._x0), (this._y1 = this._y0)])
    }
  },
  lineTo: function (x, y) {
    this._[this._i].push([(this._x1 = +x), (this._y1 = +y)])
  },
  quadraticCurveTo: function (x1, y1, x, y) {
    var path = quadratic([this._x1, this._y1], [+x1, +y1], [(this._x1 = +x), (this._y1 = +y)], this._scale)
    // The first point on the quadratic path is a dup of the last point in our stack
    // pop() is faster than shift() for large arrays, so instead of path.shift():
    this._[this._i].pop()
    Array.prototype.push.apply(this._[this._i], path)
  },
  bezierCurveTo: function (x1, y1, x2, y2, x, y) {
    var path = bezier([this._x1, this._y1], [+x1, +y1], [+x2, +y2], [(this._x1 = +x), (this._y1 = +y)], this._scale)
    this._[this._i].pop()
    Array.prototype.push.apply(this._[this._i], path)
  },
  rect: function (x, y, w, h) {
    this.types[this._i] = 1
    this._i = this._.push([[(this._x0 = this._x1 = +x), (this._y0 = this._y1 = +y)], [+x + +w, +y], [+x + +w, +y + +h], [+x, +y]])
  },
  arc: function (x, y, r, a0, a1, ccw) {
    // Is this a complete circle after a moveTo? Render as a Point
    if ((ccw ? a0 - a1 : a1 - a0) > tauEpsilon && this._[this._i].length === 1) {
      this._[this._i][0][0] = (this._x0 = this._x1 = +x)
      this._[this._i][0][1] = (this._y0 = this._y1 = +y)
      this._types[this._i] = 0
    }
  },
  result: function () {
    if (this._.length === 0) return null
    if (this._.length === 1) {
      return renderSimpleType.call(this, this._[0], 0)
    }
    switch (getType(this._types)) {
      case 0:
        return {
          type: 'MultiPoint',
          coordinates: this._.map(function (c) { return c[0] })
        }
      case 1:
        return {
          type: 'MultiLineString',
          coordinates: this._
        }
      case 2:
        return {
          type: 'MultiPolygon',
          coordinates: this._.map(function (c) { return [c] })
        }
      default:
        return {
          type: 'GeometryCollection',
          geometries: this._.map(renderSimpleType, this)
        }
    }
  }
}

export default {geoJSONContext: geoJSONContext}
