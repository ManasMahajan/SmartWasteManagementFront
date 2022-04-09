require(["esri/config", "esri/Map", "esri/views/MapView", "esri/Graphic", "esri/layers/GraphicsLayer"], function (esriConfig, Map, MapView, Graphic, GraphicsLayer) {
    esriConfig.apiKey = "AAPKa9d2f9afc71c4b5cb9ed525a985bbf951x9Ot4hDljM87Tf5HbRUNpCgsenHDpi6PqyTG1aPMsEQLwYbdY2yMtATIDQnDJLq";

    const map = new Map({
        basemap: "arcgis-navigation"
    })

    const view = new MapView({
        map: map,
        center: [73.863739, 18.530108],
        zoom: 12,
        container: "viewDiv"
    });

    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    fetch("http://localhost:4545/")
        .then((res) => res.json())
        .then((data) => {

            for (const bin of data) {
                latitude = bin.lat;
                longitude = bin.lng;
                binName = bin.name;
                binId = bin._id;

                console.log(latitude)
                console.log(longitude)

                const point = {
                    type: "point",
                    longitude: longitude,
                    latitude: latitude
                }

                const simpleMarkerSymbol = {
                    type: "simple-marker",
                    color: [226, 119, 40],
                    outline: {
                        color: [255, 255, 255],
                        width: 1
                    }
                }

                const popupTemplate = {
                    title: "{Name}",
                    content: "{Description}"
                }
                const attributes = {
                    Name: binName,
                    Description: binId
                }

                const pointGraphic = new Graphic({
                    geometry: point,
                    symbol: simpleMarkerSymbol,
                    attributes: attributes,
                    popupTemplate: popupTemplate
                });
                graphicsLayer.add(pointGraphic);

            }
        })

    /*const point = {
        type: "point",
        longitude: 73.863739,
        latitude: 18.530108
    }
    const simpleMarkerSymbol = {
        type: "simple-marker",
        color: [226, 119, 40],
        outline: {
            color: [255, 255, 255],
            width: 1
        }
    }

    const popupTemplate = {
        title: "{Name}",
        content: "{Description}"
    }
    const attributes = {
        Name: "BinName",
        Description: "This is a bin"
    }

    const pointGraphic = new Graphic({
        geometry: point,
        symbol: simpleMarkerSymbol,
        attributes: attributes,
        popupTemplate: popupTemplate
    });
    graphicsLayer.add(pointGraphic);*/


});