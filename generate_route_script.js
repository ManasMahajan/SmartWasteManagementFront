const chTableBody = document.getElementById("ch-table-body");

function loadCheckListTable() {
    fetch("http://localhost:4546/ts_data/dashboard")
        .then((res) => res.json())
        .then((data) => {
            console.log(data)
            console.log("hi")

            chTableBody.innerHTML = "";
            for (const bin of data) {
                binName = bin.name;
                fillLevel = bin.lastfill;
                console.log(fillLevel)

                chTableBody.innerHTML += `
                <tr>
                    <td>${binName}</td>
                    <td>${fillLevel}</td>
                    <td><input type="checkbox" style="width:30px; height:30px; border:solid"/></td>
                </tr>
                `
            }
        })
}

loadCheckListTable()