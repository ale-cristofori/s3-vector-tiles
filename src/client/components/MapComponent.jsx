import React, { useState, useRef, useEffect } from 'react';

import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorTileLayer from 'ol/layer/VectorTile'
import MVT from 'ol/format/MVT'
import OSM from 'ol/source/OSM';
import VectorTileSource from 'ol/source/VectorTile'
import {Fill, Stroke, Circle, Style} from 'ol/style';
import * as olProj from 'ol/proj';

const MapComponent = (props) => {

  // set intial state - used to track references to OpenLayers 
  //  objects for use in hooks, event handlers, etc.
  const [ map, setMap ] = useState()

  // get ref to div element - OpenLayers will render into this div
  const mapRef = useRef()
  
  // initialize map on first render
  useEffect( () => {

    //Tile layer - notice the URL endpoint
    const vectorLayer = new VectorTileLayer ({
        source: new VectorTileSource({
          format: new MVT(),
          url: '/tileserver/?z={z}&x={x}&y={y}.pbf'
        }),
        style: function(feature) {
          return new Style({
            stroke: new Stroke({
              color: 'rgba(30, 30, 30, 0.5)',
              width: 2
            })
          })
        }
      })

    // create map
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: olProj.fromLonLat([13, 45]),
        zoom: 4
      }),
      controls: []
    });

    // save map and vector tile layer references to state
    setMap(initialMap)

    //the second argument here is an empty array, 
    //it means the useEffect code will only run once when
    //the component will mount 
  },[])

  // render component
  return (      
    <div ref={mapRef} className="map"></div>
  );
}

export default MapComponent