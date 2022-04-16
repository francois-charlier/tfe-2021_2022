function onLoad() {
    const widgets = document.querySelectorAll(".data_widget");

    const onpenModal = function(i) {
        let modal = document.getElementById(i);
        let btn_modal = document.getElementsByClassName(i);
        modal.classList.add("show");
        document.documentElement.style.overflow = 'hidden';
        modal.children[0].innerHTML += '<h1>' + btn_modal[0].innerHTML +'</h1>'
        modal.children[0].innerHTML += '<div class="graph"><canvas id="test-'+ i +'" width="100" height="100"></canvas></div>';

        const ctx = document.getElementById("test-"+i);
        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'],
                datasets: [{
                    label: btn_modal[0].innerHTML,
                    data: [12, 19, 23, 15, 32, 3, -10],
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

        modal.children[0].children[0].addEventListener("click", function() {
            modal.classList.remove("show");
            document.documentElement.style.overflow = 'auto';
            modal.children[0].innerHTML = '<ion-icon name="close-circle-outline"></ion-icon>'
        })
    }

    widgets.forEach(i => {
        i.addEventListener("click", function (e) {
            e.preventDefault();
            console.log(i.children[0].className)
            onpenModal(i.children[0].className)
        })
    })
    
    const socket = io();

    socket.on("data-send", function(data) {
        const temperature = document.getElementById("temp-data");
        temperature.innerHTML = data.temperature + " °C";
        const humidite = document.getElementById("hum-data");
        humidite.innerHTML = data.humidity + " %";
        const luminosite = document.getElementById("lum-data");
        luminosite.innerHTML = data.lux + " lux";
        const pression = document.getElementById("press-data");
        pression.innerHTML = data.pression + " hpa";
        const distance = document.getElementById("dist-data");
        distance.innerHTML = data.distance + " cm";
        const besoinEau = document.getElementById("eau-data");
        if (data.hum_sol) { besoinEau.innerHTML = "Oui"; besoinEau.style.color = "#70e000"; }
        else { besoinEau.innerHTML = "Non"; besoinEau.style.color = "#ff0a54"; }
        const interrupteur = document.getElementById("interupt-data");
        if (data.interrupteur) { interrupteur.innerHTML = "On"; interrupteur.style.color = "#70e000"; }
        else { interrupteur.innerHTML = "Off"; interrupteur.style.color = "#ff0a54"; }
        const date = document.getElementById("date");
        date.innerHTML = "<p>" + data.date + "</p>"
    })

}