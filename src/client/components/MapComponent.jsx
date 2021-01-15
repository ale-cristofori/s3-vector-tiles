import React, { useState, useRef, useEffect } from 'react';

import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorTileLayer from 'ol/layer/VectorTile'
import MVT from 'ol/format/MVT'
import OSM from 'ol/source/OSM';
import VectorTileSource from 'ol/source/VectorTile'
import {Fill, Stroke, Circle, Style} from 'ol/style';
import Select from 'ol/interaction/Select';
import Overlay from 'ol/Overlay';
import * as olProj from 'ol/proj';

const MapComponent = (props) => {

  // set intial state - used to track references to OpenLayers 
  //  objects for use in hooks, event handlers, etc.
  const [ map, setMap ] = useState(null)
  const [vectorLayer, setVectorLayer] = useState(null)

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
            }),
            fill: new Fill({
              color: 'rgba(15, 85, 1, 0.4)',
            }),
          })
        }
      })

    setVectorLayer(vectorLayer);

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
        center: olProj.fromLonLat([13, 42]),
        zoom: 6
      }),
      controls: []
    });

    // save map and vector tile layer references to state
    setMap(initialMap)

    //the second argument here is an empty array, 
    //it means the useEffect code will only run once when
    //the component will mount 
  },[])

  useEffect(() => {
    const singleSelectClick = new Select()
    if(map) {
      map.on('click', (e) => {
        const features = map.getFeaturesAtPixel(e.pixel);
        if(features.length > 0) {
          const properties = features[0].getProperties();
          alert(
            `distreto: ${properties['distretto']} \ncompartimento: ${properties['compartimento']} \nprefisso: ${properties['prefisso']}`
          )
        }
      })
    }
  } ,[map])

  // render component
  return (      
    <div ref={mapRef} className="map"></div>
  );
}

export default MapComponent