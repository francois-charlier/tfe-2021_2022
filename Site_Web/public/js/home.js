function onLoad() {

    const onpenModal = function(i, e) {
        let modal = document.getElementById(i);
        let btn_modal = document.getElementsByClassName(i);
        modal.classList.add("show");
        document.documentElement.style.overflow = 'hidden';
        modal.children[0].innerHTML += '<h1>' + btn_modal[0].innerHTML +'</h1>'
        modal.children[0].innerHTML += '<div class="graph"><canvas id="test-'+ i +'" width="100" height="100"></canvas></div>';

        axios.get('/api/data/'+e)
            .then(function (response) {
                console.log(response);
                let donnees = response.data.donnee[0]
                let date = response.data.donnee[1]
                const ctx = document.getElementById("test-" + i);
                const myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: date,
                        datasets: [{
                            label: btn_modal[0].innerHTML,
                            data: donnees,
                            pointBackgroundColor: [
                                'rgba(255, 99, 132, 1)',
                            ],
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                            ],
                            tension: 0.3,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                    }
                });
            })
            .catch(function (error) {
                console.log(error);
            });

        modal.children[0].children[0].addEventListener("click", function() {
            modal.classList.remove("show");
            document.documentElement.style.overflow = 'auto';
            modal.children[0].innerHTML = '<ion-icon name="close-circle-outline"></ion-icon>'
        })
    }
    
    const dataConrespond = {
        "temperature": ["temp", "Température"],
        "pression": ["press", "Pression Atmosphérique"],
        "humidite": ["hum", "Humidité"],
        "interrupteur": ["switch", "Interrupteur"],
        "luminosite": ["lum", "Luminosité"],
        "distance": ["dist", "Distance"],
        "humidite_sol": ["eau", "Besoin d'Eau"]
    }

    const socket = io();

    socket.on("data-send", function(data) {
        let arr1 = document.querySelectorAll(".data_widget")
        let arr2 = [];
        arr1.forEach(i => {
            arr2.push(i.id);
        })

        let difference = arr2.filter(x => !Object.keys(data).includes(x));
        difference.forEach(e => {
            document.getElementById(e).parentNode.removeChild(document.getElementById(e))
            document.getElementById(dataConrespond[e][0]).parentNode.removeChild(document.getElementById(dataConrespond[e][0]))
        })

        console.log(difference);

        Object.keys(data).forEach(i => {
            if(i == "date"){
                const date = document.getElementById("date");
                date.innerText = data.date
            }
            else if(document.getElementById(dataConrespond[i][0])){
                document.getElementById((dataConrespond[i][0] + "-data")).innerHTML = data[i];
            }
            else{
                document.getElementById("modal-container").innerHTML += 
                    `
                    <div id="` + dataConrespond[i][0] +`" class="modals-layout">
                        <div class="modal">
                            <ion-icon name="close-circle-outline"></ion-icon>
                        </div>
                    </div>
                    `;
                document.getElementById("container").innerHTML +=
                    `
                    <div class="data_widget" id="` + i + `">
                        <p class="` + dataConrespond[i][0] + `">` + dataConrespond[i][1] + `</p>
                        <p id="` + dataConrespond[i][0] + `-data" class="sensor-data">` + data[i] + `</p>
                    </div>
                    `;
            }
        })

        const besoinEau = document.getElementById("eau-data");
        if (data.humidite_sol == "1" && besoinEau != undefined) { besoinEau.innerHTML = "Oui"; besoinEau.style.color = "#70e000"; }
        else if (besoinEau != undefined) { besoinEau.innerHTML = "Non"; besoinEau.style.color = "#ff0a54"; }
        const interrupteur = document.getElementById("switch-data");
        if (data.interrupteur == "1" && interrupteur != undefined) { interrupteur.innerHTML = "On"; interrupteur.style.color = "#70e000"; }
        else if (interrupteur != undefined) { interrupteur.innerHTML = "Off"; interrupteur.style.color = "#ff0a54"; }

        const widgets = document.querySelectorAll(".data_widget");

        if (widgets.length != 0){
            widgets.forEach(i => {
                i.addEventListener("click", function (e) {
                    e.preventDefault();
                    console.log(i.children[0].className)
                    onpenModal(i.children[0].className, i.children[0].className)
                })
            })
        }
    })
}

function logout() {
    const socket = io()
    socket.emit("data-send", "GGGG")
    axios.get('/logout')
        .then(function (response) {
            if (response.data == 'succes') {
                window.location.replace("/")
            }
        })
        .catch(function (error) {
            console.log(error);
        })
}