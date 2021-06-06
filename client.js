const tableBody = document.getElementById("table-body");

let count = 1;
function loadTable() {
    fetch("http://localhost:4545/")
        .then((res) => res.json())
        .then((data) => {
            tableBody.innerHTML = "";
            count = 1;
            for (const bin of data) {
                binId = bin._id;
                binName = bin.name;
                binHeight = bin.height;
                binLocation = bin.location;
                binVolume = bin.volume;

                tableBody.innerHTML += `
                    <tr data-id="${binId}">
                        <td>${count}</td>
                        <td>${binName}</td>
                        <td>${binLocation}</td>
                        <td>${binHeight}</td>
                        <td>${binVolume}</td>
                        <td>
                            <button id="btn-remove-bin" onclick="deleteBin(this)" style="color:#009879; border:none;"><i class="far fa-minus-square"></i></button>
                            <button id="btn-update-bin" onclick ="updateBin(this)" data-modal-target="#edit-modal" style="color:#009879; border:none;"><i class="fas fa-edit"></i></button>
                        </td>
                    </tr>
                `;
            }
        });
}

loadTable();

function deleteBin(button) {
    //const removeBinButton = document.getElementById("btn-remove-bin");
    const binId = button.parentElement.parentElement.dataset.id;
    let url = "http://localhost:4545/" + binId;
    fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: null
    })
        .then(res => {
            return res.json()
        })
        .then(data => {
            console.log(data)
            loadTable()
        })
}

const closeModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')
const iframe = document.getElementById("hiddenFrame")
function updateBin(button) {
    const modal = document.querySelector(button.dataset.modalTarget)
    const binId = button.parentElement.parentElement.dataset.id;
    const geturl = "http://localhost:4545/" + binId;
    const patchurl = "http://localhost:4545/update/" + binId;
    fetch(geturl)
        .then((res) => res.json())
        .then((data) => {
            if (modal == null) return
            modal.classList.add('activate')
            overlay.classList.add('activate')
            const modalBody = document.querySelector(".modal-body")
            var binName = data.name;
            var binHeight = data.height;
            var binVolume = data.volume;
            console.log(binHeight)
            console.log(binVolume)
            modalBody.innerHTML = `
            <form target="_blank" action="${patchurl}" method="POST">
                <div>
                    <label>Bin Name</label>
                    <input type="text" name="name" id="name" value="${binName}">
                </div>
                <div>
                    <label>Bin Height</label>
                    <input type="text" name="height" id="height" value="${binHeight}">
                </div>
                <div>
                    <label>Bin Volume</label>
                    <input type="text" name="volume" id="volume" value="${binVolume}">
                </div>
                <input onclick="window.location.href='mnge_bins.html';"  type="submit" value="Submit" />
            </form>
            `
        })
}

closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.edit-modal')
        closeModal(modal)
    })
})

function closeModal(modal) {
    if (modal == null) return
    modal.classList.remove('activate')
    overlay.classList.remove('activate')
}



const addBinBtn = document.getElementById("add-bin-btn");
addBinBtn.addEventListener("click", () => {
    const binName = document.getElementById("name").value;
    const binHeight = document.getElementById("height").value;
    const binLocation = document.getElementById("location").value;
    const binVolume = document.getElementById("volume").value;
    const binLatitude = document.getElementById("lat").value;
    const binLongitude = document.getElementById("lng").value;

    const data = {
        name: binName,
        height: binHeight,
        volume: binVolume,
        location: binLocation,
        lat: binLatitude,
        lng: binLongitude,
    };
    console.log(binName);

    fetch("http://localhost:4545/bin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .then((data) => {
            console.log("success:", data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });

    loadTable();
});


