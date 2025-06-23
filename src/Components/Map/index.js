import React, {useEffect, useState, useRef } from "react";
import { Map, NavigationControl, Marker, Popup, Source, Layer } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css';
import styled from "styled-components";
import markers from './markers';
import { gpx } from '@tmcw/togeojson';
import { DOMParser } from 'xmldom';


const MapContainer = styled.div`
    padding: 50px;
    background:rgba(8, 47, 54, 0.68);
`;

const MapSplitContainer = styled.div`
    display: flex;
    margin: 0 auto;
    gap: 10px;
`

const MapDescDiv = styled.div`
    width: 100%;
    height: 1500px;
    background: #f8f8f8;
    margin: 10px auto;
    text-align: center;
    padding: 50px;
`;

const MapDiv = styled.div`
    flex: 3;
    text-align: center;
    width: 99%;
    //max-width: 1000px;
    aspect-ratio: 4/3;
    max-height: 600px;
    margin: 0 auto;
    border: 2px solid black;
    box-sizing: border-box;
    position: relative;

`;

const MarkerList = styled.div`
    flex: 1;
    max-height: 600px;
    overflow-y: auto;
    background: #fff;
    border: 2px solid black;
    box-sizing: border-box;
    padding: 10px;
`;

const MarkerItem = styled.div`
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid #ddd;

    &:hover {
        background: #f0f0f0;
    }

    &:last-child {
        border-bottom: none;
    }
`;

const MarkerItemText = styled.p`
    margin: 0;
    font-size: 16px;
    color: #333;
`;

const PopupContent = styled.div`
    padding: 1px;
    font-size: 16px;
    color: #333;
    background: white;
`;

const MapHeader = styled.h1`
    font-size: 30px;
`

const MapText = styled.p`
    font-size: 20px;
    max-width: 90%;
    margin: 0 auto;
    padding: 50px;
`;

const MapImage = styled.img`
    max-width: 600px; 
    width: 100%; 
    height: auto; 
    margin: 0 auto; 
    border-radius: 4px; 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); 
`;

const Legend = styled.div`
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    z-index: 1; /* Above map controls */
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    &:last-child {
        margin-bottom: 0;
    }
`;

const ColorSwatch = styled.div`
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 8px;
    border: 2px solid #000000;
`;

const LegendLabel = styled.span`
    font-size: 14px;
    color: #333;
`;


const MyMap = () => {
    
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [routeGeoJSON, setRouteGeoJSON] = useState(null);
    const mapRef = useRef(null);
    const descRef = useRef(null);

    useEffect(() => {

        if (!selectedMarker) {
            setRouteGeoJSON(null);
            return;
        }

        // Get GPX file for the selected marker
        fetch(selectedMarker.gpxUrl)
            .then((response) => {
                if (!response.ok) throw new Error('Failed to load GPX file');
                return response.text();
            })
            .then((gpxText) => {
                const gpxRoute = new DOMParser().parseFromString(gpxText, 'text/xml');
                const geojson = gpx(gpxRoute);
                setRouteGeoJSON(geojson);

                // Fit map to route bounds
                if (mapRef.current && geojson.features.length > 0) {
                    const coordinates = geojson.features[0].geometry.coordinates;
                    const bounds = coordinates.reduce(
                        (bounds, coord) => bounds.extend(coord),
                        new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
                    );
                    mapRef.current.fitBounds(bounds, { padding: 120 });
                }
            })
            .catch((error) => {
                console.error('Error loading GPX:', error);
                setRouteGeoJSON(null); // Clear route on error
            });    
    }, [selectedMarker]);

    const handleMarkerClick = (e, marker) => {
        e.originalEvent?.stopPropagation();
        setSelectedMarker(marker);
        if (descRef.current) {
            const offset = 130;
            const topPos = descRef.current.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: topPos, behavior: 'smooth' });
        }
    };

    const legendItems = [
        { color: '#008000', category: 'Simple' },
        { color: '#FFFF00', category: 'Moderate' },
        { color: '#FF0000', category: 'Complex' }
    ];

    return (
        <MapContainer>

            <MapSplitContainer>

                <MapDiv ref={descRef}>

                    <Map mapLib={maplibregl} 
                        initialViewState={{
                        longitude: -116.07128069092865,
                        latitude: 51.210373839605104,
                        zoom: 14
                        }}
                        style={{width: "100%", height: "100%"}}
                        mapStyle="https://api.maptiler.com/maps/satellite/style.json?key=KSz6qiEeR6obRJtuqnhn"
                        onClick = {() => setSelectedMarker(null)}
                        ref = {mapRef}
                    >
                        <NavigationControl position="top-left" />

                        {routeGeoJSON && (
                            <>
                                <Source id="route" type="geojson" data={routeGeoJSON}>
                                    <Layer
                                        id="route-layer"
                                        type="line"
                                        source="route"
                                        layout={{
                                            'line-join': 'round',
                                            'line-cap': 'round'
                                        }}
                                        paint={{
                                            'line-color': '#007cbf',
                                            'line-width': 4
                                        }}
                                    />
                                </Source>
                            </>
                        )}

                        {markers.map((marker) => (
                            <Marker
                                key={marker.id}
                                longitude={marker.longitude}
                                latitude={marker.latitude}
                                onClick={(e) => handleMarkerClick(e, marker)}
                            >
                                <svg
                                    height="25"
                                    width="25"
                                    viewBox="-12 -12 24 24"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <circle
                                        cx="0"
                                        cy="0"
                                        r="10"
                                        fill={marker.color}
                                        stroke="#000000"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </Marker>
                        ))}

                        {selectedMarker && (
                            <Popup
                                longitude={selectedMarker.longitude}
                                latitude={selectedMarker.latitude}
                                offset={[0,20]}
                                closeButton={false}
                                closeOnClick={false}
                                anchor="top"
                            >
                                <PopupContent>
                                    {selectedMarker.name}
                                </PopupContent>
                            </Popup>
                        )}

                    </Map>

                    <Legend>
                        {legendItems.map(({ color, category }) => (
                            <LegendItem key={color}>
                                <ColorSwatch style={{ backgroundColor: color }} />
                                <LegendLabel>{category}</LegendLabel>
                            </LegendItem>
                        ))}
                    </Legend>

                </MapDiv>

                <MarkerList>
                    {markers.map((marker) => (
                        <MarkerItem
                            key = {marker.id}
                            onClick={(e) => handleMarkerClick(e, marker)}
                        >
                            <MarkerItemText>{marker.name}</MarkerItemText>
                        </MarkerItem>
                    ))}
                </MarkerList>

            </MapSplitContainer>

            <MapDescDiv>
                <MapHeader>
                    {selectedMarker ? selectedMarker.name : "Select a marker to view some information about it"}
                </MapHeader>
                <MapText>
                    {selectedMarker ? selectedMarker.desc : "Select a marker to view its name"}
                </MapText>

                {selectedMarker && (
                    <MapImage
                        src={selectedMarker.imageUrl}
                        alt={selectedMarker.name}
                    />
                )}
            </MapDescDiv>
        </MapContainer>

    );

};


export default MyMap;