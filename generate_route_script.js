const chTableBody = document.getElementById("ch-table-body");

var binsFillLevelList = []

function loadCheckListTable() {
    fetch("http://localhost:4546/ts_data/dashboard")
        .then((res) => res.json())
        .then((data) => {

            chTableBody.innerHTML = "";
            for (const bin of data) {
                binName = bin.name;
                fillLevel = bin.lastfill;
                binId = bin._id

                binsFillLevelList.push({
                    id: binId,
                    fl: fillLevel
                })

                chTableBody.innerHTML += `
                <tr data-id="${binId}">
                    <td>${binName}</td>
                    <td>${fillLevel}</td>
                    <td><input type="checkbox" style="width:30px; height:30px; border:solid"/></td>
                </tr>
                `
            }
        })
}

loadCheckListTable()

//load the truck checklist table

const chTable2Body = document.getElementById("ch-table2-body");

function loadCheckListTable2() {
    fetch("http://localhost:4548/")
        .then((res) => res.json())
        .then((data) => {

            chTable2Body.innerHTML = "";
            for (const truck of data) {
                truckName = truck.Name
                truckCapacity = truck.Capacity
                truckRegNumber = truck.RegistrationNumber
                truckCost = truck.CostPerUnitDistance
                truckParkLocation = truck.ParkingName
                truckId = truck._id

                chTable2Body.innerHTML += `
                <tr data-id="${truckId}">
                    <td>${truckRegNumber}</td>
                    <td>${truckName}</td>
                    <td>${truckCapacity}</td>
                    <td>${truckCost}</td>
                    <td>${truckParkLocation}</td>
                    <td><input type="checkbox" style="width:30px; height:30px; border:solid"/></td>
                </tr>
                `
            }
        })
}

loadCheckListTable2()


var selectedBinIds = []
var selectedTruckIds = []
var selectedTruckNames = []
$(function () {
    $("#get-route-btn").click(function () {
        console.log("next button pressed");

        $("#binstable input[type=checkbox]:checked").each(function () {
            var row = $(this).closest("tr")
            selectedBinIds.push(row.attr("data-id").toString())
        })

        $("#truckstable input[type=checkbox]:checked").each(function () {
            var row = $(this).closest("tr")
            selectedTruckIds.push(row.attr("data-id").toString())
        })

        /*console.log(selectedBinIds);
        console.log(selectedTruckIds);
        console.log(selectedTruckNames);*/

        require([
            "esri/config",
            "esri/Map",
            "esri/views/MapView",
            "esri/Graphic",
            "esri/layers/GraphicsLayer",
            "esri/widgets/ScaleBar",
            "esri/tasks/Geoprocessor",
            "esri/tasks/support/FeatureSet"
        ], function (
            esriConfig,
            Map,
            MapView,
            Graphic,
            GraphicsLayer,
            SclaeBar,
            Geoprocessor,
            FeatureSet
        ) {
            /*console.log("started processing...")*/

            esriConfig.apiKey = "AAPKa9d2f9afc71c4b5cb9ed525a985bbf951x9Ot4hDljM87Tf5HbRUNpCgsenHDpi6PqyTG1aPMsEQLwYbdY2yMtATIDQnDJLq"

            /*const depot = {
                type: "point",
                x: 73.80737324659276,
                y: 18.561168290016695,
            }*/

            const depot = {
                type: "point",
                x: -122.3943,
                y: 37.7967
            }

            const map = new Map({
                basemap: "arcgis-navigation"
            });

            const view = new MapView({
                container: "viewDiv",
                map,
                center: [-122.440545, 37.7625332],
                scale: 50000,
                constraints: {
                    snapToZoom: false
                }
            });

            view.ui.add(new SclaeBar({ view }), "bottom-right");
            view.popup.actions = [];

            Promise.all([view.when(), getfleetRoutes()]).then(([_view, { directions, routes, stops }]) => {
                zoomToResults(directions);
                printRouteSummary(routes);
                showDirections(directions);
                showStops(stops);
                showDepot();
            });

            async function getfleetRoutes() {
                //get bins info
                /*var ordersFeaturesList = [];
                for (const binId of selectedBinIds) {
                    var urlfetch = "http://localhost:4545/" + binId
                    fetch(urlfetch)
                        .then((res) => res.json())
                        .then((data) => {
                            binLat = data.lat;
                            binLong = data.lng;
                            binVolume = data.volume;
                            binName = data.name;
                            console.log(binVolume)
                            console.log(Math.floor(((binsFillLevelList.find(bin => bin.id == binId).fl) * binVolume) / 100))

                            var binGraphic = new Graphic({
                                geometry: {
                                    type: "point",
                                    x: binLong,
                                    y: binLat
                                },
                                attributes: {
                                    DeliveryQuantities: Math.floor(((binsFillLevelList.find(bin => bin.id == binId).fl) * binVolume) / 100),
                                    Name: binName,
                                    ServiceTime: 25,
                                    TimeWindowStart1: 1608051600000,
                                    TimeWindowEnd1: 1608080400000,
                                    MaxViolationTime1: 0
                                }
                            })
                            ordersFeaturesList.push(binGraphic);
                        })
                };*/



                const depots = new FeatureSet({
                    features: [
                        new Graphic({
                            geometry: depot,
                            attributes: {
                                Name: "San Francisco",
                                TimeWindowStart1: 1608048000000,
                                TimeWindowEnd1: 1608080400000
                            }
                        })
                    ]
                })

                var routesFeaturesList = []
                for (const truckId of selectedTruckIds) {
                    urlfetchtrucks = "http://localhost:4548/" + truckId;
                    fetch(urlfetchtrucks)
                        .then((res) => res.json())
                        .then((data) => {
                            truckName = data.Name;
                            truckCapacity = data.Capacity;
                            truckCost = data.CostPerUnitDistance;
                            selectedTruckNames.push(truckName);

                            var truckGraphic = new Graphic({
                                attributes: {
                                    Name: truckName,
                                    StartDepotName: "San Francisco",
                                    EndDepotName: "San Francisco",
                                    StartDepotServiceTime: 60,
                                    EarliestStartTime: 1608048000000,
                                    LatestStartTime: 1608048000000,
                                    Capacities: truckCapacity,
                                    CostPerUnitTime: 0.2,
                                    CostPerUnitDistance: truckCost,
                                    MaxOrderCount: 3,
                                    MaxTotalTime: 480,
                                    MaxTotalTravelTime: 300,
                                    MaxTotalDistance: 100
                                }
                            })

                            routesFeaturesList.push(truckGraphic);
                        })

                }

                //console.log(ordersFeaturesList)
                //console.log(routesFeaturesList)


                const orders = new FeatureSet({
                    features: [
                        new Graphic({
                            geometry: {
                                type: "point",
                                x: -122.51,
                                y: 37.7724
                            },
                            attributes: {
                                DeliveryQuantities: 1706,   //?
                                Name: "Store 1",
                                ServiceTime: 25,
                                TimeWindowStart1: 1608051600000,
                                TimeWindowEnd1: 1608080400000,
                                MaxViolationTime1: 0
                            }
                        }),
                        new Graphic({
                            geometry: {
                                type: "point",
                                x: -122.4889,
                                y: 37.7538
                            },
                            attributes: {
                                DeliveryQuantities: 1533,
                                Name: "Store 2",
                                ServiceTime: 23,
                                TimeWindowStart1: 1608051600000,
                                TimeWindowEnd1: 1608080400000,
                                MaxViolationTime1: 0
                            }
                        }),
                        new Graphic({
                            geometry: {
                                type: "point",
                                x: -122.4649,
                                y: 37.7747
                            },
                            attributes: {
                                DeliveryQuantities: 1580,
                                Name: "Store 3",
                                ServiceTime: 24,
                                TimeWindowStart1: 1608051600000,
                                TimeWindowEnd1: 1608080400000,
                                MaxViolationTime1: 0
                            }
                        }),
                        new Graphic({
                            geometry: {
                                type: "point",
                                x: -122.4739,
                                y: 37.7432
                            },
                            attributes: {
                                DeliveryQuantities: 1289,
                                Name: "Store 4",
                                ServiceTime: 20,
                                TimeWindowStart1: 1608051600000,
                                TimeWindowEnd1: 1608080400000,
                                MaxViolationTime1: 0
                            }
                        }),
                    ]
                });

                /*const depots = new FeatureSet({
                    features: [
                        new Graphic({
                            geometry: depot,
                            attributes: {
                                Name: "San Francisco",
                                TimeWindowStart1: 1608048000000,
                                TimeWindowEnd1: 1608080400000
                            }
                        })
                    ]
                });*/

                /*const routes = new FeatureSet({
                    features: [
                        new Graphic({
                            attributes: {
                                Name: "Truck 1",
                                StartDepotName: "San Francisco",
                                EndDepotName: "San Francisco",
                                StartDepotServiceTime: 60,
                                EarliestStartTime: 1608048000000,
                                LatestStartTime: 1608048000000,
                                Capacities: 15000,
                                CostPerUnitTime: 0.2,
                                CostPerUnitDistance: 1.5,
                                MaxOrderCount: 3,
                                MaxTotalTime: 360,
                                MaxTotalTravelTime: 180,
                                MaxTotalDistance: 100
                            }
                        }),
                        new Graphic({
                            attributes: {
                                Name: "Truck 2",
                                StartDepotName: "San Francisco",
                                EndDepotName: "San Francisco",
                                StartDepotServiceTime: 60,
                                EarliestStartTime: 1608048000000,
                                LatestStartTime: 1608048000000,
                                Capacities: 15000,
                                CostPerUnitTime: 0.2,
                                CostPerUnitDistance: 1.5,
                                MaxOrderCount: 3,
                                MaxTotalTime: 360,
                                MaxTotalTravelTime: 180,
                                MaxTotalDistance: 100
                            }
                        }),
                        new Graphic({
                            attributes: {
                                Name: "Truck 3",
                                StartDepotName: "San Francisco",
                                EndDepotName: "San Francisco",
                                StartDepotServiceTime: 60,
                                EarliestStartTime: 1608048000000,
                                LatestStartTime: 1608048000000,
                                Capacities: 15000,
                                CostPerUnitTime: 0.2,
                                CostPerUnitDistance: 1.5,
                                MaxOrderCount: 3,
                                MaxTotalTime: 360,
                                MaxTotalTravelTime: 180,
                                MaxTotalDistance: 100
                            }
                        })
                    ]
                });*/

                /*const orders = new FeatureSet({
                    features: ordersFeaturesList
                });*/

                //console.log(orders)
                const routes = new FeatureSet({
                    features: routesFeaturesList
                });

                const travel_mode = {
                    attributeParameterValues: [
                        {
                            attributeName: "Use Preferred Truck Routes",
                            parameterName: "Restriction Usage",
                            value: "PREFER_HIGH"
                        },
                        {
                            attributeName: "Avoid Unpaved Roads",
                            parameterName: "Restriction Usage",
                            value: "AVOID_HIGH"
                        },
                        {
                            attributeName: "Avoid Private Roads",
                            parameterName: "Restriction Usage",
                            value: "AVOID_MEDIUM"
                        },
                        {
                            attributeName: "Driving a Truck",
                            parameterName: "Restriction Usage",
                            value: "PROHIBITED"
                        },
                        {
                            attributeName: "Roads Under Construction Prohibited",
                            parameterName: "Restriction Usage",
                            value: "PROHIBITED"
                        },
                        {
                            attributeName: "Avoid Gates",
                            parameterName: "Restriction Usage",
                            value: "AVOID_MEDIUM"
                        },
                        {
                            attributeName: "Avoid Express Lanes",
                            parameterName: "Restriction Usage",
                            value: "PROHIBITED"
                        },
                        {
                            attributeName: "Avoid Carpool Roads",
                            parameterName: "Restriction Usage",
                            value: "PROHIBITED"
                        },
                        {
                            attributeName: "Avoid Truck Restricted Roads",
                            parameterName: "Restriction Usage",
                            value: "AVOID_HIGH"
                        },
                        {
                            attributeName: "TruckTravelTime",
                            parameterName: "Vehicle Maximum Speed (km/h)",
                            value: 0
                        }
                    ],
                    description: "Models basic truck travel by preferrring designated truck routes, and finds solutions that optimize travel time. Routes must obey one-way roads, avoid illegal turns, and so on. When you specify a start time, dynamic travel speeds based on traffic are used where it is available, up to the legal truck speed limit.",
                    distanceAttributeName: "Kilometers",
                    id: "ZzzRtYcPLjXFBKwr",
                    impedanceAttributeName: "TruckTravelTime",
                    name: "Trucking Time",
                    restrictionAttributeNames: [
                        "Avoid Carpool Roads",
                        "Avoid Express Lanes",
                        "Avoid Gates",
                        "Avoid Private Roads",
                        "Avoid Truck Restricted Roads",
                        "Avoid Unpaved Roads",
                        "Driving a Truck",
                        "Roads Under Construction Prohibited",
                        "Use Preferred Truck Routes"
                    ],
                    simplificationTolerance: 10,
                    simplificationToleranceUnits: "esriMeters",
                    timeAttributeName: "TruckTravelTime",
                    type: "TRUCK",
                    useHierarchy: true,
                    uturnAtJunctions: "esriNFSBNoBacktrack"
                };

                const params = {
                    depots,
                    orders,
                    routes,
                    default_date: 16080051600000,
                    directions_language: "en",
                    distance_units: "Miles",
                    populate_directions: true,
                    populate_route_lines: false,
                    time_units: "Minutes",
                    travel_mode
                };

                const url = "https://logistics.arcgis.com/arcgis/rest/services/World/VehicleRoutingProblem/GPServer/SolveVehicleRoutingProblem";

                const geoprocessor = new Geoprocessor({
                    url,
                    outSpatialReference: view.spatialReference
                });

                const options = {
                    statusCallback: (jobInfo) => {
                        const timestamp = new Date().toLocaleTimeString();
                        const message = jobInfo.messages[jobInfo.messages.length - 1];
                        console.log(`${timestamp}: ${message.description}`);
                    }
                };

                console.log("line 485")
                const { jobId } = await geoprocessor.submitJob(params);
                await geoprocessor.waitForJobCompletion(jobId, options);

                console.log("line 489")
                const [directionsResult, routesResult, stopsResult] = await Promise.all([
                    geoprocessor.getResultData(jobId, "out_directions"),
                    geoprocessor.getResultData(jobId, "out_routes"),
                    geoprocessor.getResultData(jobId, "out_stops")
                ]);

                return {
                    directions: directionsResult.value.features,
                    routes: routesResult.value.features,
                    stops: stopsResult.value.features
                };


            }

            function zoomToResults(graphics) {
                const geometries = graphics
                    .map((directions) => directions.geometry)
                    .filter((geometry) => geometry)
                view.goTo(geometries);
            }

            function printRouteSummary(routes) {
                const formatNumber = new Intl.NumberFormat("en-Us", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                });

                for (const route of routes) {
                    const { Name, TotalDistance, TotalTime } = route.attributes;
                    console.log(`
                    Route: ${Name}
                    Travel Distance: ${formatNumber.format(TotalDistance)}miles
                    Drive Time: ${formatNumber.format(TotalTime)} minutes
                    `);
                }
            }

            /*var truckColors = []
            function getTruckColor(name) {
                var color = truckColors.find(truck => truck.Name == truckName).Color;
                if (color != undefined) {
                    console.log("assigned color: ");
                    console.log(color);
                    return color;
                }
                else {
                    var first = Math.floor(Math.random() * 255) + 1;
                    var second = Math.floor(Math.random() * 255) + 1;
                    var third = Math.floor(Math.random() * 255) + 1;
                    color = [first, second, third, 0.75];
                    truckColors.push({
                        Name: truckName,
                        Color: color
                    })
                    console.log("assigned color: ");
                    console.log(color);
                    return color;
                }
            }*/

            function getTruckColor(name) {
                switch (name) {
                    case "Truck 1":
                        return [50, 150, 50, 0.75];
                    case "Truck 2":
                        return [50, 150, 255, 0.75];
                    case "Truck 3":
                        return [180, 69, 255, 0.75];
                }
            }

            function showDirections(directions) {
                const graphics = directions
                    .filter((directions) => directions.geometry)
                    .map((direction) => {
                        const { attributes, geometry } = direction;
                        const { ArrivalTime, RouteName, Text } = attributes;
                        const time = new Date(ArrivalTime).toLocaleTimeString();
                        const color = getTruckColor(RouteName);
                        return new Graphic({
                            attributes,
                            geometry,
                            symbol: {
                                type: "simple-line",
                                color,
                                width: "5px"
                            },
                            popupTemplate: {
                                title: `${RouteName}`,
                                content: `<b>${Text}</b><br>Arrive at: ${time}`
                            }
                        })
                    })
                map.add(new GraphicsLayer({ graphics }))
            }

            function showStops(stops) {
                for (const stop of stops) {
                    const { SnapY, SnapX, RouteName, Sequence } = stop.attributes;
                    stop.set({
                        geometry: {
                            type: "point",
                            latitude: SnapY,
                            longitude: SnapX
                        },
                        symbol: {
                            type: "simple-marker",
                            color: "white",
                            outline: {
                                color: getTruckColor(RouteName),
                                width: 1.5
                            },
                            size: "18px"
                        },
                        popupTemplate: {
                            title: "{Name}",
                            content: `${RouteName}<br>Stop:${parseInt(Sequence) - 1}<br>Delivery Items: 1`
                        }
                    });
                }

                const labels = stops.map((stop) => stop.clone());
                for (const label of labels) {
                    const { RouteName, Sequence } = label.attributes;
                    label.set({
                        symbol: {
                            type: "text",
                            text: Sequence - 1,
                            font: { size: 1, weight: "normal" },
                            yoffset: -3,
                            color: "black"
                        },
                        popupTemplate: null
                    });
                }

                const graphics = stops.concat(labels);

                map.add(new GraphicsLayer({ graphics }));
            }

            function showDepot() {
                const graphics = [
                    new Graphic({
                        geometry: depot,
                        symbol: {
                            type: "simple-marker",
                            style: "square",
                            color: "white",
                            outline: {
                                color: "black",
                                width: 1.5
                            },
                            size: "20px",

                        }
                    }),
                    new Graphic({
                        geometry: depot,
                        symbol: {
                            type: "text",
                            text: "D",
                            font: { size: 10, weight: "normal" },
                            yoffset: -4,
                            color: "black"
                        }
                    })
                ];
                map.add(new GraphicsLayer({ graphics }));
            }
        })

    })
})

//const mapButton = document.getElementById("get-route-btn2");

