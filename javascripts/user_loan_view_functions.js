function update_page_data(){
    if (estado === "pendiente"){
        document.getElementById("content_div").style = "background-color: #ffd800; border-color: #c4a300;";
    }else if (estado === "expirado" || estado === "multado"){
        document.getElementById("content_div").style = "background-color: #FF9000; border-color: #C46B00;";
    }else if (estado === "devuelto" || estado === "saldado"){
        document.getElementById("content_div").style = "background-color: #B7FF00; border-color: #90C400;";
    }
    document.getElementById("book_leftside").innerHTML = `<h2>Datos de usuario</h2>
        <p data><b>No. de ` + ((estudiante) ? "control" : "tarjeta") + `: </b>` + ((estudiante) ? datos["NoControl"] : datos["NoTarjeta"]) + `</p>
        <p data style="margin-bottom: 0; -webkit-line-clamp: 2; line-clamp: 2;"><b>Nombre: </b>` + datos["Nombre"] + `</p>`;
    document.getElementById("book_rightside").innerHTML = `<h2>Datos de libro</h2>
        <p data><b>Folio: </b>` + datos["Folio"] + `</p>
        <p data style="-webkit-line-clamp: 2; line-clamp: 2;"><b>Titulo: </b>` + datos["Titulo"] + `</p>
        <p data style="margin-bottom: 0;"><b>Estado físico: </b>` + datos["EstadoFisico"] + `</p>`;
    document.getElementById("last_part").innerHTML = `<div id="book_leftside2" class="book_leftside">
            <p data><b>Fecha entregado: </b>` + format_date(entregado) + `</p>
        </div>
        <div id="book_rightside2" class="book_rightside">
            <p data><b>Fecha limite: </b>` + ((datos["FechaLimite"] === null) ? "No aplica" : format_date(limite)) + `</p>
        </div>`;
    
    if (estado === "expirado"){
        document.getElementById("last_part").innerHTML += "<p data style='color: #B50000'><b>EXPIRADO</b></p>";
    }else if (estado === "pendiente"){
        document.getElementById("last_part").innerHTML += "<p data style='opacity: 0'>a</p>";
    }else{
        document.getElementById("book_leftside2").innerHTML += "<p data><b>Fecha devuelto: </b>" + format_date(devuelto) + "</p>";
        document.getElementById("book_rightside2").innerHTML += "<p data style='color: " + ((estado === "multado") ? "#B50000'><b>MULTADO" : "#46A506'><b>" + ((estado === "devuelto") ? "ENTREGADO" : "SALDADO")) + "</b></p>";

        if (estado === "multado" || estado === "saldado"){
            document.getElementById("buttons").innerHTML += "<button onclick='window.location.href = \"fine_view?id=" + urlParams.get("id") + "\"'>Ver multa</button>";
        }
    }
}

function format_date(today){
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
}

function get_page_data(){
    var formData = new FormData();

    formData.append("type", "vista prestamo");
    formData.append("IDPrestamo", urlParams.get("id"));
    
    fetch("../php/admin_search_queries.php", {
        method: "POST",
        body: formData
    })
    .then(response => {
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        } else {
            return response.text().then(text => { throw new Error(text) });
        }
    })
    .then(data => {
        datos = JSON.parse(data.data);
        today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
        limite = new Date(datos["FechaLimite"] + "T23:59:59");
        devuelto = new Date(datos["FechaDevuelto"] + "T00:00:00");
        entregado = new Date(datos["FechaEntregado"] + "T00:00:00");
        estado = "pendiente";
        estudiante = (datos["NoControl"] !== null);

        if (datos["FechaMulta"] !== null){
            if (datos["DeudaSaldada"] == 1){
                estado = "saldado";
            }else{
                estado = "multado";
            }
        }else if (datos["FechaDevuelto"] === null){
            if (datos["FechaLimite"] !== null && today > limite){
                estado = "expirado";
            }
        }else if (devuelto > limite){
            estado = "expirado";
        }else{
            estado = "devuelto";
        }

        update_page_data();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    urlParams = new URLSearchParams(window.location.search);

    get_page_data();
});