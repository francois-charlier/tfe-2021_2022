function onLoad() {
    const widgets = document.querySelectorAll(".data_widget");

    const onpenModal = function(i) {
        let modal = document.getElementById(i);
        let btn_modal = document.getElementsByClassName(i);
        modal.classList.add("show");
        document.documentElement.style.overflow = 'hidden';
        modal.children[0].innerHTML += '<h1>' + btn_modal[0].innerHTML +'</h1>'
        modal.children[0].innerHTML += "<p>Sur le Graphique ci-dessous vous retrouvez les relevés des 7 derniers jours.</p>"
        
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
}