# Google Maps Dummy Project

### To Run project

```bash
npm  i -g json-server
```

- Open project folder in Terminal and run the following command
```bash
json-server --watch data/data.json
```
- Open project folder in a seprate Terminal and run the following command
```bash
npm start
```

### Tasks

- This project is to check how the dealer will signup and give their Dealership Location by drawing polygon around it.
- Once Signed up you have to reload as there is no redux or routing done here.
- Now signup with the same Name and password you gave while signing up.

- Now the dealer can mark their car inside the polygon and not outside the polygon.

## Environment Variables

To run this peoject you have to put your Google API key in ```App.js``` file


`googleMapsApiKey` = Google API_KEY





## Some important Functions
- Function to get the center point of a polygon
- It takes an array of polygon coordinates(```[{lat,lng},...]```) an returns a center point as the center. 
```js 
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
```
---

- This Function return a ```true or false``` based on if the point(lat,lng) are inside the polygon or not.
- This takes arguments `point` (a point {lat,lng}) and `vs` (an array of coords [{lat,lng},...])
```js
function inside(point, vs) {            
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
```
---

- This Function returns a `polygon coords array` that you can pass to a `<Polygon />` in maps.
- It takes a `lat`, `lng`, `height`and `width` as arguments.
```js
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

        //You can add this part also as this will create a new polygon for you that you can use somewhere in google maps
        //but here we are not returning anything only seting the addCar state above based on array of cords 
        /* var rect = new window.google.maps.Polygon({
                 paths: corners,
                 strokeColor: color,
                 strokeOpacity: 0.9,
                 strokeWeight: 1,
                 fillColor: color,
                 fillOpacity: 0.3,
                 map: map
        });*/
}
``` 

## For learning or Help refer to this link
[YouTube Video](https://www.youtube.com/watch?v=2po9_CIRW7I)


## License

[MIT](https://choosealicense.com/licenses/mit/)

