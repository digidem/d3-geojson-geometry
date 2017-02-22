var tape = require('tape')
var d3Geo = require('d3-geo')
var geoJSONContext = require('./').geoJSONContext

function testPath (object) {
  var context = geoJSONContext()

  d3Geo.geoPath()
      .context(context)(object)

  return context.result()
}

tape('geoPath(Point) renders a point', function (test) {
  var testPoint = {
    type: 'Point',
    coordinates: [-63, 18]
  }
  test.deepEqual(testPath(testPoint), testPoint)
  test.end()
})

tape('geoPath(LineString) renders a line string', function (test) {
  var testLine = {
    type: 'LineString',
    coordinates: [[-63, 18], [-62, 18], [-62, 17]]
  }
  test.deepEqual(testPath(testLine), testLine)
  test.end()
})

tape('geoPath(Polygon) renders a polygon', function (test) {
  var testPolygon = {
    type: 'Polygon',
    coordinates: [[[-63, 18], [-62, 18], [-62, 17], [-63, 18]]]
  }
  test.deepEqual(testPath(testPolygon), testPolygon)
  test.end()
})

tape('geoPath(GeometryCollection) renders a geometry collection', function (test) {
  var testGC = {
    type: 'GeometryCollection',
    geometries: [{
      type: 'Polygon',
      coordinates: [[[-63, 18], [-62, 18], [-62, 17], [-63, 18]]]
    }, {
      type: 'LineString',
      coordinates: [[-63, 18], [-62, 18], [-62, 17]]
    }]
  }
  test.deepEqual(testPath(testGC), testGC)
  test.end()
})

tape('geoPath(FeatureCollection) renders a GeometryCollection', function (test) {
  var testFC = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[-63, 18], [-62, 18], [-62, 17]]
      }
    }, {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-63, 18]
      }
    }]
  }
  test.deepEqual(testPath(testFC), {
    type: 'GeometryCollection',
    geometries: testFC.features.map(function (f) { return f.geometry })
  })
  test.end()
})

tape('geoPath(FeatureCollection) renders a MultiLineString', function (test) {
  var testFC = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[-63, 18], [-62, 18], [-62, 17]]
      }
    }, {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[-60, 12], [-61, 13], [-63, 15]]
      }
    }]
  }
  test.deepEqual(testPath(testFC), {
    type: 'MultiLineString',
    coordinates: testFC.features.map(function (f) { return f.geometry.coordinates })
  })
  test.end()
})

tape('geoPath(FeatureCollection) renders a MultiPolygon', function (test) {
  var testFC = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[-63, 18], [-62, 18], [-62, 17], [-63, 18]]]
      }
    }, {
      type: 'Polygon',
      geometry: {
        type: 'Polygon',
        coordinates: [[[-60, 12], [-61, 13], [-63, 15], [-60, 12]]]
      }
    }]
  }
  test.deepEqual(testPath(testFC), {
    type: 'MultiPolygon',
    coordinates: testFC.features.map(function (f) { return f.geometry.coordinates })
  })
  test.end()
})

tape('geoPath(FeatureCollection) renders a MultiPoint', function (test) {
  var testFC = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-63, 18]
      }
    }, {
      type: 'Polygon',
      geometry: {
        type: 'Point',
        coordinates: [-60, 12]
      }
    }]
  }
  test.deepEqual(testPath(testFC), {
    type: 'MultiPoint',
    coordinates: testFC.features.map(function (f) { return f.geometry.coordinates })
  })
  test.end()
})

tape('Bezier curve', function (t) {
  var context = geoJSONContext()
  context.moveTo(-63, 18)
  context.bezierCurveTo(-62, 17, -61, 14, -60, 12)
  var expected = {
    type: 'LineString',
    coordinates: [
      [ -63, 18 ],
      [ -62.25, 16.921875 ],
      [ -60.75, 13.640625 ],
      [ -60, 12 ]
    ]
  }
  t.deepEqual(context.result(), expected)
  t.end()
})

tape('Bezier curve with scale', function (t) {
  var context = geoJSONContext(10)
  context.moveTo(-63, 18)
  context.bezierCurveTo(-62, 17, -61, 14, -60, 12)
  var expected = {
    type: 'LineString',
    coordinates: [
      [ -63, 18 ],
      [ -62.8125, 17.789794921875 ],
      [ -62.4375, 17.246337890625 ],
      [ -61.875, 16.189453125 ],
      [ -60.75, 13.640625 ],
      [ -60, 12 ]
    ]
  }
  t.deepEqual(context.result(), expected)
  t.end()
})
