selectedBinIds = ["60a9eeeff75ec83394c0d504", "60a9ef3ef75ec83394c0d505", "60a9ef6ff75ec83394c0d506", "60a9efa2f75ec83394c0d507"]

var ordersFeaturesList = [];
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
};

console.log(ordersFeaturesList)