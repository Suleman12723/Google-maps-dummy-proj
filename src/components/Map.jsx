import {useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
    GoogleMap,
    Marker,
    DirectionsRenderer,
    Circle,
    Polygon,
    MarkerClusterer,
    computeOffset,
    
    
    

} from '@react-google-maps/api';
import axios from 'axios';

const DB_URL = 'http://localhost:3000/dealers';




function get_polygon_centroid(pts) {
    var first = pts[0], last = pts[pts.length-1];
    if (first.lat != last.lat || first.lng != last.lng) pts.push(first);
    var twicearea=0,
    x=0, y=0,
    nPts = pts.length,
    p1, p2, f;
    for ( var i=0, j=nPts-1 ; i<nPts ; j=i++ ) {
       p1 = pts[i]; p2 = pts[j];
       f = (p1.lng - first.lng) * (p2.lat - first.lat) - (p2.lng - first.lng) * (p1.lat - first.lat);
       twicearea += f;
       x += (p1.lat + p2.lat - 2 * first.lat) * f;
       y += (p1.lng + p2.lng - 2 * first.lng) * f;
    }
    f = twicearea * 3;
    return { lat:x/f + first.lat, lng:y/f + first.lng };
 }



const Map = ({data}) => {
    const [addCar, setaddCar] = useState([]);
    const [delalersLocation, setDealersLocation] = useState(null);
    const [markers, setMarkers] = useState([]);   //all markers (CARS) locations
    const [polygonCords, setPolygonCords] = useState([]);
    const options = useMemo(()=>({ //<MapOptions>
        // disableDefaultUI: true,
        clickableIcons: false
    }),[])
    const [addCars, setAddCars] = useState([]);
    const mapRef = useRef(); //mapRef: <GoogleMap>
    const [flag, setFlag] = useState(false);
    
    useEffect(() => {

        setDealersLocation(()=>get_polygon_centroid(data.StorePolygons)); 
        data.cars && setMarkers(data.cars);
        setPolygonCords(data.StorePolygons);

    },[])

    const onLoad = useCallback(map => (mapRef.current = map),[]);

    
    function inside(point, vs) {            //FUNCTION FOR DETECTING ALOCATION IS INSIDE OR OUTSIDE A POLYGON
                                            // Takes 2 params -point(The one you want to check)  -vs(Array of coords of polygon) 
        // ray-casting algorithm based on
        // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
        
        var x = point.lat, y = point.lng;
        
        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i].lat, yi = vs[i].lng;
            var xj = vs[j].lat, yj = vs[j].lng;
            
            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        
        return inside;
    };
    const handleMarker = (e)=>{        
        let brand = prompt("Please enter your car's brand", "BMW");
        if(brand){
            setMarkers([...markers,{carId:Math.random(),Brand:brand,location:{lat:e.latLng.lat(),lng:e.latLng.lng()}}])
            drawRect(e.latLng.lat(),e.latLng.lng(),5,10)
            console.log(inside({lat:e.latLng.lat(),lng:e.latLng.lng()},polygonCords));
        }
    }



var NORTH = 0;
var WEST  = -90;
var SOUTH = 180;
var EAST  = 90;

function drawRect(lat, lng, width, height) {            //drawRect if you want to make a polygon based on width and height taking a point(coordinate) as center

        var center = new window.google.maps.LatLng(lat, lng);

        var north = window.google.maps.geometry.spherical.computeOffset(center, height / 2, NORTH); 
        var south = window.google.maps.geometry.spherical.computeOffset(center, height / 2, SOUTH); 

        var northEast = window.google.maps.geometry.spherical.computeOffset(north, width / 2, EAST); 
        var northWest = window.google.maps.geometry.spherical.computeOffset(north, width / 2, WEST); 

        var southEast = window.google.maps.geometry.spherical.computeOffset(south, width / 2, EAST); 
        var southWest = window.google.maps.geometry.spherical.computeOffset(south, width / 2, WEST); 

        var corners = [ northEast, northWest, southWest, southEast ];
        setaddCar([...addCar,{center:{lat,lng},corners:corners}]);
        // var rect = new window.google.maps.Polygon({
        //         paths: corners,
        //         strokeColor: color,
        //         strokeOpacity: 0.9,
        //         strokeWeight: 1,
        //         fillColor: color,
        //         fillOpacity: 0.3,
        //         map: map
        // });
        return ;
}

const handleSubmitCars = async (e)=>{
    data.cars = markers;
    const data1 = await axios.put(`${DB_URL}/${data.id}`,data);
    if(data1){
        alert('Cars sucessfully added!');
    }
    else{
        alert('Some Error Occured!');
    }
}

const handleRemoval = (e)=>{
    const location = {lat:e.latLng.lat(),lng:e.latLng.lng()};
    let res1 = markers.map(m=> JSON.stringify(m.location)).indexOf(JSON.stringify(location))
    if(res1!==-1){
        let array = markers;
        array.splice(res1,1);
        setMarkers(array);
    }
    let res2 = addCar.map(c => JSON.stringify(c.center)).indexOf(JSON.stringify(location));
    if(res2!==-1){
        let array = addCar;
        array.splice(res2,1);
        setAddCars(array);
    }
    setFlag(!flag)

}


  return (
    <>
    <div>
        <button onClick={handleSubmitCars}>Submit Cars</button>
    </div>
    <div className="map">
        {delalersLocation && 
            <GoogleMap
            zoom={10} 
            center={delalersLocation}
            mapContainerStyle={{width:'100vw',height:'70vh'}}
            options={options}
            onLoad={onLoad}
           
            >
                {/* {directions && <DirectionsRenderer directions={directions} options={{
                    polylineOptions:{
                        zIndex:50,
                        strokeColor:'#19762',
                        strokeWeight:5,
                    }
                }} />} */}
                <>
                    <Marker position={delalersLocation}/>
                    
                <MarkerClusterer>
                    {clusterer =>markers.map((marker) => 
                    <Marker 
                    key={marker.location.lat+marker.location.lng} 
                    position={marker.location}
                    label={marker.Brand}
                    clusterer={clusterer} 
                    onClick={handleRemoval}
                    draggable={true}
                    onLoad={onLoad}
                    
                    />) }
                </MarkerClusterer>

                

                {
                    addCar.map(car=>
                        <Polygon paths={car.corners} 
                        
                        options={{
                            strokeColor: "#FF0000",
                            // strokeOpacity: 0.8,
                            // strokeWeight: 2,
                            // fillColor: "#FF0000",
                            fillOpacity: 0 
                        }}
                        onClick={(e)=>handleMarker(e)}
                        />)
                    }
                
                    <Polygon paths={polygonCords} 
                
                    options={{
                        strokeColor: "#FF0000",
                        // strokeOpacity: 0.8,
                        // strokeWeight: 2,
                        // fillColor: "#FF0000",
                        fillOpacity: 0
                    
                        
                    }}
                    onDblClick={(e)=>handleMarker(e)}
                    />

                </>

             
            </GoogleMap>
        }
        </div>
        </>
  )
}

export default Map