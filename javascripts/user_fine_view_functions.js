function update_page_data(){
    if (datos["DeudaSaldada"] == 1){
        document.getElementById("content_div").style = "background-color: #B5FFB5;";
        document.getElementById("icon1").src = "../images/GreenCheck.png";
        document.getElementById("icon2").src = "../images/GreenCheck.png";
    }else{
        document.getElementById("content_div").style = "background-color: white;";
        document.getElementById("icon1").src = "../images/RedCross.png";
        document.getElementById("icon2").src = "../images/RedCross.png";
    }

    document.getElementById("book_leftside").innerHTML = `<h2>Datos del usuario</h2>
        <p data><b>` + ((estudiante) ? "ESTUDIANTE" : "DOCENTE") + `</b></p>
        <p data><b>No. de ` + ((estudiante) ? "control" : "tarjeta") + `: </b>` + ((estudiante) ? datos["NoControl"] : datos["NoTarjeta"]) + `</p>
        <p data style="margin-bottom: 0; -webkit-line-clamp: 2; line-clamp: 2;"><b>Nombre: </b>` + datos["Nombre"] + `</p>
        <p data><b>` + ((estudiante) ? "Carrera" : "Departamento") + `: </b>` + ((estudiante) ? datos["Carrera"] : datos["Departamento"]) + `</p>
        <p data><b>Genero: </b>` + ((datos["Genero"] === "M") ? "Masculino" : "Femenino") + `</p>`;
    document.getElementById("book_rightside").innerHTML = `<h2>Datos del libro</h2>
        <p data><b>Folio: </b>` + datos["Folio"] + `</p>
        <p data style="-webkit-line-clamp: 2; line-clamp: 2;"><b>Titulo: </b>` + datos["Titulo"] + `</p>
        <p data style='opacity: 0;'>a</p>
        <p data><b>Fecha prestado: </b>` + format_date(prestado) + `</p>
        <p data><b>Fecha devuelto: </b>` + format_date(devuelto) + `</p>`;
    document.getElementById("book_leftside2").innerHTML = `<p data style="margin-bottom: 0"><b>Sanción: </b>` + datos["Sancion"] + `</p>`;
    document.getElementById("book_rightside2").innerHTML = `<p data style="margin-bottom: 0"><b>Fecha de la multa: </b>` + format_date(multa) + `</p>`;

    let razonElement = document.getElementById("razon");
    razonElement.textContent = "";

    let boldText = document.createElement("b");
    boldText.textContent = "Razon: ";
    
    razonElement.appendChild(boldText);
    razonElement.appendChild(document.createTextNode(datos["Razon"]));
    
    if (datos["DeudaSaldada"] == 1){
        document.getElementById("buttons").innerHTML = `<button onclick="history.back()">Volver</button>
            <p data style="display: inline; color: #007F0E; margin: 0 max(1.5vw, 5.5px);">[MULTA SALDADA]</p>
            <p data style="color: #007F0E; margin: 0 max(1.5vw, 5.5px);">Procure seguir el reglamento del Centro de Información</p>`;
    }else{
        document.getElementById("buttons").innerHTML = `<button onclick="history.back()">Volver</button>
            <p data style="color: red; margin: 0 max(1.5vw, 5.5px);">Consule con el Centro de Información si crees que es un error</p>`;
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

    formData.append("type", "vista multa");
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
        estudiante = (datos["NoControl"] !== null);
        prestado = new Date(datos["FechaEntregado"] + "T00:00:00");
        devuelto = new Date(datos["FechaDevuelto"] + "T00:00:00");
        multa = new Date(datos["FechaMulta"] + "T00:00:00");

        update_page_data();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    urlParams = new URLSearchParams(window.location.search);

    get_page_data();
});