import React from 'react';
import MapComponent from './MapComponent';

const title = 'Welcome to Vector Tiles Map';

export default function App () {
    return (
        <div>
            {title}
            <MapComponent />
        </div>
    );
}