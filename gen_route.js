/*document.getElementById("send-mails-button").addEventListener("click", function () {
    var temParams = {
        to_email: "manasmahajan1510@gmail.com",
        from_name: "Manas Mahajan",
        to_name: "The Dark Lord",
        message: "Hi",
        my_html: "<p>Hi</p>"
    }

    emailjs.send('service_r70zzpj', 'template_ethsnbh', temParams)
        .then((res) => {
            console.log("success", res.status);
        })
})*/



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

//get all drivers
var drivers = []
function getDrivers() {
    fetch("http://localhost:4549/")
        .then((res) => res.json())
        .then((data) => {
            for (const driver of data) {
                //console.log(driver)
                drivers.push(driver)
            }
        })
};

getDrivers()
//console.log(drivers)

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

                var htmlString = ``;
                for (const driver of drivers) {
                    const demailid = driver.emailId;
                    const dname = driver.name;
                    const did = driver._id;
                    var dhtmlString = `<option value="${demailid}">${dname}</option>`
                    htmlString += dhtmlString;
                }

                chTable2Body.innerHTML += `
                <tr data-id="${truckId}">
                    <td>${truckRegNumber}</td>
                    <td>${truckName}</td>
                    <td>${truckCapacity}</td>
                    <td>${truckCost}</td>
                    <td>${truckParkLocation}</td>
                    <td id="drop-down">
                    <select class="select-driver">` + htmlString + `</select>
                    </td>
                    <td><input type="checkbox" style="width:30px; height:30px; border:solid"/></td>
                </tr>
                `
            }
        })
}

loadCheckListTable2()

/*function createDropDownLists() {
    var lists = document.getElementsByClassName("select-driver");
    console.log(lists)
    for (const list of lists) {
        list.innerHTML = `
        <option value="shentu">Shentu</option>
        `
    }
}
createDropDownLists()
*/

//document.getElementById("send-email-button").addEventListener("click", function () { alert("Routes sent via email!!") })

var selectedBinIds = []
var selectedTruckIds = []
var selectedTruckNames = []
var selectedDrivers = []

function compare_stops(a, b) {
    if (a.StopNumber < b.StopNumber) {
        return -1;
    } else if (a.StopNumber > b.StopNumber) {
        return 1;
    } else {
        return 0;
    }
}

document.getElementById("send-mails-button").addEventListener("click", function () {
    for (const driver of selectedDrivers) {
        driver.stops.sort(compare_stops);
        var html_message = `
        <h1>Truck Number:${driver.truckRegNo}</h1>
        <table>
            <thead>
                <tr>
                    <th>Stop Number</th>
                    <th>Stop Name</th>
                    <th>Expected Arrival Time</th>
                    <th>Garbage Volume</th>
                </tr>
            </thead>
            <tbody>
        `
        for (const stop of driver.stops) {
            html_message += `
            <tr>
                <td>${stop.StopNumber}</td>
                <td>${stop.Name}</td>
                <td>${stop.ExpectedArrivalTime}</td
                <td>${stop.GarbageVolume}</td>
            </tr>`
        }
        html_message += `</tbody></table>`

        var temParams = {
            to_email: driver.driverMail,
            from_name: "Admin",
            to_name: driver.driverName,
            message: "Today's Assignment. ",
            my_html: html_message
        }

        emailjs.send('service_r70zzpj', 'template_ethsnbh', temParams)
            .then((res) => {
                console.log("success", res.status);
            })


    }
})


$(function () {
    /*$(".select-driver").html(`
    <option value="shentu">Shentu</option>
    `);

    for (const driver of drivers) {
        var oldHtml = $(".select-drivers").html();
        var newHtml = oldHtml + `<option value=${driver._id}>${driver.name}</option>`
        $(".select-drivers").html(newHtml)
    }
*/

    $("#get-route-btn").click(function () {
        //console.log("next button pressed");

        $("#binstable input[type=checkbox]:checked").each(function () {
            var row = $(this).closest("tr")
            selectedBinIds.push(row.attr("data-id").toString())
        })

        $("#truckstable input[type=checkbox]:checked").each(function () {
            var row = $(this).closest("tr")
            var selectedDriverName = row.find("#drop-down").find("select").find("option").filter(":selected").text()
            var selectedDriverMail = row.find("#drop-down").find("select").find("option").filter(":selected").val()
            //console.log(selectedDriverMail)
            selectedTruckIds.push(row.attr("data-id").toString())
            var newTruckDriver = {
                truckId: row.attr("data-id").toString(),
                driverMail: selectedDriverMail,
                stops: [],
                driverName: selectedDriverName
            }
            selectedDrivers.push(newTruckDriver)
        })





        /*console.log(selectedBinIds);
        console.log(selectedTruckIds);
        console.log(selectedTruckNames);*/

        var selectedBins = []
        for (const binId of selectedBinIds) {
            var urlfetch = "http://localhost:4545/" + binId
            fetch(urlfetch)
                .then((res) => res.json())
                .then((data) => {
                    binLat = data.lat;
                    binLong = data.lng;
                    binVolume = data.volume;
                    binName = data.name;
                    fill = binsFillLevelList.find(bin => bin.id == binId).fl


                    var newBin = {
                        blat: data.lat,
                        blong: data.lng,
                        bvolume: data.volume,
                        bname: data.name,
                        bfillLevel: fill
                    }
                    selectedBins.push(newBin)
                })
        }

        var selectedTrucks = []
        var parkingLocations = []
        for (const truckId of selectedTruckIds) {
            urlfetchtrucks = "http://localhost:4548/" + truckId;
            fetch(urlfetchtrucks)
                .then((res) => res.json())
                .then((data) => {
                    truckName = data.Name;
                    truckCapacity = data.Capacity;
                    truckCost = data.CostPerUnitDistance;
                    selectedTruckNames.push(truckName);


                    var newTruck = {
                        tname: data.Name,
                        tcapacity: data.Capacity,
                        tcost: data.Cost,
                        tparkname: data.ParkingName
                    }
                    selectedTrucks.push(newTruck)

                    var newParkingLocation = {
                        lat: data.ParkingLatitude,
                        long: data.ParkingLongitude,
                        name: data.ParkingName
                    }
                    parkingLocations.push(newParkingLocation);

                    //put truck name in selectedDrivers
                    obj = selectedDrivers.find((o, i) => {
                        if (o.truckId == truckId) {
                            selectedDrivers[i]['truckName'] = truckName;
                            selectedDrivers[i]['truckRegNo'] = data.RegistrationNumber;
                            return true;
                        }
                    })

                })
        }

        //console.log(selectedDrivers)


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
            ScaleBar,
            Geoprocessor,
            FeatureSet
        ) {
            /*console.log("started processing...")*/

            esriConfig.apiKey = "AAPKa9d2f9afc71c4b5cb9ed525a985bbf951x9Ot4hDljM87Tf5HbRUNpCgsenHDpi6PqyTG1aPMsEQLwYbdY2yMtATIDQnDJLq"

            const depotCollect = {
                type: "point",
                x: 73.80737324659276,
                y: 18.561168290016695,
            }

            /*const depot = {
                type: "point",
                x: -122.3943,
                y: 37.7967
            }*/

            const map = new Map({
                basemap: "arcgis-navigation"
            });

            const view = new MapView({
                container: "viewDiv",
                map,
                center: [73.80737324659276, 18.561168290016695],
                scale: 50000,
                constraints: {
                    snapToZoom: false
                }
            });

            view.ui.add(new ScaleBar({ view }), "bottom-right");
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
                var ordersFeaturesList = [];
                for (const bin of selectedBins) {
                    var binGraphic = new Graphic({
                        geometry: {
                            type: "point",
                            x: bin.blong,
                            y: bin.blat
                        },
                        attributes: {
                            DeliveryQuantities: Math.floor(((bin.bfillLevel) * bin.bvolume) / 100),
                            Name: bin.bname,
                            ServiceTime: 25,
                            TimeWindowStart1: 1608051600000,
                            TimeWindowEnd1: 1608080400000,
                            MaxViolationTime1: 0
                        }
                    })
                    ordersFeaturesList.push(binGraphic);
                };



                /*const depots = new FeatureSet({
                    features: [
                        new Graphic({
                            geometry: depot,
                            attributes: {
                                Name: "Apple Unicorn Store",
                                TimeWindowStart1: 1608048000000,
                                TimeWindowEnd1: 1608080400000
                            }
                        })
                    ]
                })*/

                var depotsFeaturesList = []
                for (const loc of parkingLocations) {
                    var newDepot = new Graphic({
                        geometry: {
                            type: "point",
                            x: loc.long,
                            y: loc.lat,
                        },
                        attributes: {
                            Name: loc.name,
                            TimeWindowStart1: 1608048000000,
                            TimeWindowEnd1: 1608080400000
                        }
                    })
                    depotsFeaturesList.push(newDepot);
                }
                var dumpingGround = new Graphic({
                    geometry: depotCollect,
                    attributes: {
                        Name: "Apple Unicorn Store",
                        TimeWindowStart1: 1608048000000,
                        TimeWindowEnd1: 1608080400000
                    }
                })
                depotsFeaturesList.push(dumpingGround);

                var routesFeaturesList = []
                for (const truck of selectedTrucks) {
                    var truckGraphic = new Graphic({
                        attributes: {
                            Name: truck.tname,
                            StartDepotName: truck.tparkname,
                            EndDepotName: "Apple Unicorn Store",
                            StartDepotServiceTime: 60,
                            EarliestStartTime: 1608048000000,
                            LatestStartTime: 1608048000000,
                            Capacities: truck.tcapacity,
                            CostPerUnitTime: 0.2,
                            CostPerUnitDistance: truck.tcost,
                            MaxOrderCount: 3,
                            MaxTotalTime: 480,
                            MaxTotalTravelTime: 300,
                            MaxTotalDistance: 100
                        }
                    })
                    routesFeaturesList.push(truckGraphic);
                }

                //console.log(ordersFeaturesList)
                //console.log(routesFeaturesList)


                /*const orders = new FeatureSet({
                    features: [
                        new Graphic({
                            geometry: {
                                type: "point",
                                x: 73.80947,
                                y: 18.5604
                            },
                            attributes: {
                                DeliveryQuantities: 1706,   //?
                                Name: "Parihar Chowk Bin",
                                ServiceTime: 25,
                                TimeWindowStart1: 1608051600000,
                                TimeWindowEnd1: 1608080400000,
                                MaxViolationTime1: 0
                            }
                        }),
                        new Graphic({
                            geometry: {
                                type: "point",
                                x: 73.80732,
                                y: 18.56259
                            },
                            attributes: {
                                DeliveryQuantities: 1533,
                                Name: "Shashwat Hospital Bin",
                                ServiceTime: 23,
                                TimeWindowStart1: 1608051600000,
                                TimeWindowEnd1: 1608080400000,
                                MaxViolationTime1: 0
                            }
                        }),
                        new Graphic({
                            geometry: {
                                type: "point",
                                x: 73.80706,
                                y: 18.55454
                            },
                            attributes: {
                                DeliveryQuantities: 1580,
                                Name: "Sanewadi Bin",
                                ServiceTime: 24,
                                TimeWindowStart1: 1608051600000,
                                TimeWindowEnd1: 1608080400000,
                                MaxViolationTime1: 0
                            }
                        }),
                        new Graphic({
                            geometry: {
                                type: "point",
                                x: 73.80861,
                                y: 18.55812
                            },
                            attributes: {
                                DeliveryQuantities: 1289,
                                Name: "Saraswat Bank Bin",
                                ServiceTime: 20,
                                TimeWindowStart1: 1608051600000,
                                TimeWindowEnd1: 1608080400000,
                                MaxViolationTime1: 0
                            }
                        }),
                        new Graphic({
                            geometry: {
                                type: "point",
                                x: 73.81118,
                                y: 18.54477
                            },
                            attributes: {
                                DeliveryQuantities: 1289,
                                Name: "NCL Colony Bin",
                                ServiceTime: 20,
                                TimeWindowStart1: 1608051600000,
                                TimeWindowEnd1: 1608080400000,
                                MaxViolationTime1: 0
                            }
                        }),
                        new Graphic({
                            geometry: {
                                type: "point",
                                x: 73.79977,
                                y: 18.55291
                            },
                            attributes: {
                                DeliveryQuantities: 1289,
                                Name: "Varsha Park Bin",
                                ServiceTime: 20,
                                TimeWindowStart1: 1608051600000,
                                TimeWindowEnd1: 1608080400000,
                                MaxViolationTime1: 0
                            }
                        }),
                        new Graphic({
                            geometry: {
                                type: "point",
                                x: 73.79839,
                                y: 18.54664
                            },
                            attributes: {
                                DeliveryQuantities: 1289,
                                Name: "Someshwar Temple",
                                ServiceTime: 20,
                                TimeWindowStart1: 1608051600000,
                                TimeWindowEnd1: 1608080400000,
                                MaxViolationTime1: 0
                            }
                        }),
                        new Graphic({
                            geometry: {
                                type: "point",
                                x: 73.79384,
                                y: 18.55739
                            },
                            attributes: {
                                DeliveryQuantities: 1289,
                                Name: "IDBI Bank Bin",
                                ServiceTime: 20,
                                TimeWindowStart1: 1608051600000,
                                TimeWindowEnd1: 1608080400000,
                                MaxViolationTime1: 0
                            }
                        }),
                        new Graphic({
                            geometry: {
                                type: "point",
                                x: 73.78363,
                                y: 18.5643
                            },
                            attributes: {
                                DeliveryQuantities: 1289,
                                Name: "Balewadi Phata Bin",
                                ServiceTime: 20,
                                TimeWindowStart1: 1608051600000,
                                TimeWindowEnd1: 1608080400000,
                                MaxViolationTime1: 0
                            }
                        }),
                    ]
                });*/

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
                                StartDepotName: "Apple Unicorn Store",
                                EndDepotName: "Apple Unicorn Store",
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
                                StartDepotName: "Apple Unicorn Store",
                                EndDepotName: "Apple Unicorn Store",
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
                                StartDepotName: "Apple Unicorn Store",
                                EndDepotName: "Apple Unicorn Store",
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

                const orders = new FeatureSet({
                    features: ordersFeaturesList
                });

                //console.log(orders)
                const routes = new FeatureSet({
                    features: routesFeaturesList
                });

                const depots = new FeatureSet({
                    features: depotsFeaturesList
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

                //console.log(params)

                const url = "https://logistics.arcgis.com/arcgis/rest/services/World/VehicleRoutingProblem/GPServer/SolveVehicleRoutingProblem";

                const geoprocessor = new Geoprocessor({
                    url,
                    outSpatialReference: view.spatialReference
                });

                const options = {
                    statusCallback: (jobInfo) => {
                        const timestamp = new Date().toLocaleTimeString();
                        const message = jobInfo.messages[jobInfo.messages.length - 1];
                        console.log(`${timestamp}: ${message.toString()}`);
                    }
                };

                //console.log("line 485")
                const { jobId } = await geoprocessor.submitJob(params);
                await geoprocessor.waitForJobCompletion(jobId, options);

                //console.log("line 489")
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

                var sumTable = document.getElementById("summary-table-div")
                sumTable.style.display = "block";

                for (const route of routes) {
                    const { Name, TotalDistance, TotalTime } = route.attributes;
                    console.log(`
                    Route: ${Name}
                    Travel Distance: ${formatNumber.format(TotalDistance)}miles
                    Drive Time: ${formatNumber.format(TotalTime)} minutes
                    `);
                    var summaryTable = document.getElementById("routeSummary");
                    var summaryString = `
                    <tr>
                        <td>${Name}</td>
                        <td>${TotalDistance}</td>
                        <td>${TotalTime}</td>
                    </tr>
                    `;
                    summaryTable.innerHTML += summaryString;
                }
            }

            var truckColors = []
            function getTruckColor(name) {
                var truck = truckColors.find(truck => truck.Name == name);
                if (truck != undefined) {
                    //console.log("not undefined");
                    //console.log(truck.Color);
                    return truck.Color;
                }
                else {
                    //console.log("undefined. assigning color...")
                    var first = Math.floor(Math.random() * 255) + 1;
                    var second = Math.floor(Math.random() * 255) + 1;
                    var third = Math.floor(Math.random() * 255) + 1;
                    color = [first, second, third, 0.75];
                    truckColors.push({
                        Name: name,
                        Color: color
                    })
                    //console.log("assigned color: ");
                    //console.log(color);
                    return color;
                }
            }

            /*function getTruckColor(name) {
                switch (name) {
                    case "Truck 1":
                        return [50, 150, 50, 0.75];
                    case "Truck 2":
                        return [50, 150, 255, 0.75];
                    case "Truck 3":
                        return [180, 69, 255, 0.75];
                }
            }*/

            function showDirections(directions) {
                //console.log(directions)
                const graphics = directions
                    .filter((directions) => directions.geometry)
                    .map((direction) => {
                        //console.log(typeof direction)
                        //console.log(direction)
                        const { attributes, geometry } = direction;
                        const { ArrivalTime, RouteName, Text } = attributes;
                        //console.log(RouteName)
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
                //console.log(stops)
                for (const stop of stops) {
                    const { SnapY, SnapX, RouteName, Sequence, Name, ArriveTime, DeliveryQuantities } = stop.attributes;

                    //put this stop in selectedDrivers
                    var newStop = {
                        Name: Name,
                        StopNumber: parseInt(Sequence) - 1,
                        ExpectedArrivalTime: ArriveTime,
                        GarbageVolume: DeliveryQuantities
                    }

                    obj = selectedDrivers.find((o, i) => {
                        if (o.truckName == RouteName) {
                            selectedDrivers[i]['stops'].push(newStop);
                        }
                    })
                    //////////////////////////////////
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
                            content: `${RouteName}<br>Stop:${parseInt(Sequence) - 1}<br>Bins to service: 1`
                        }
                    });
                }

                console.log(selectedDrivers);

                const labels = stops.map((stop) => stop.clone());
                for (const label of labels) {
                    const { RouteName, Sequence } = label.attributes;
                    label.set({
                        symbol: {
                            type: "text",
                            text: Sequence - 1,
                            font: { size: 9, weight: "normal" },
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
                        geometry: depotCollect,
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
                        geometry: depotCollect,
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

                var graphics2 = [];
                for (loc of parkingLocations) {
                    var newGraphic = new Graphic({
                        geometry: {
                            type: "point",
                            x: loc.long,
                            y: loc.lat
                        },
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
                    })
                    var newGraphic2 = new Graphic({
                        geometry: {
                            type: "point",
                            x: loc.long,
                            y: loc.lat
                        },
                        symbol: {
                            type: "text",
                            text: "P",
                            font: { size: 10, weight: "normal" },
                            yoffset: -4,
                            color: "black"
                        }
                    })
                    graphics2.push(newGraphic)
                    graphics2.push(newGraphic2)
                }
                map.add(new GraphicsLayer({ graphics2 }));
            }
        })

    })
})



//const mapButton = document.getElementById("get-route-btn2");

