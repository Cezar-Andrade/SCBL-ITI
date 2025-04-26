function form_prevent(e){
    e.preventDefault();
}

function open_overlayed_window(){
    overlay = document.createElement("div");
    overlay.setAttribute("id", "overlayed_window");
    overlay.setAttribute("class", "overlayed_window");
    overlay.innerHTML = "<div id='container_overlay' class='container_overlay'></div>";
    document.body.appendChild(overlay);
}

function close_window(){
    overlay.remove();
    return false;
}

function cancel_reservation(){
    open_overlayed_window();
    document.getElementById("container_overlay").innerHTML = `<h1>Confirmar acción</h1>
        <p>Estas por cancelar la reservación, esta es una acción que no se puede deshacer una vez realizada ya que borrará la reservación.</p>
        <p>Las reservaciones expiradas se eliminan automaticamente despues de 7 días.</p>
        <p>¿Desea continuar?</p>
        <button onclick='drop_reservation()'>Continuar</button>
        <button onclick='close_window()'>Cancelar</button>`;
}

function drop_reservation(){
    var formData = new FormData();
    formData.append("type", "delete reservacion");
    formData.append("id", urlParams.get("id"));

    fetch("../php/user_insert_queries.php", {
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
        if (data.status === "user-not-authenticated"){
            document.getElementById("container_overlay").innerHTML = `<h1>Usuario no autenticado</h1>
                <p>El usuario no ha iniciado sesión, solo el usuario administrador autenticado puede hacer estas operaciones.</p>
                <button type="cancel" onclick="return close_window()">Cerrar</button>`;
        }else if (data.status === "success"){
            document.getElementById("container_overlay").innerHTML = `<h1>Reservación cancelada</h1>
                <p>La reservación fue invalidada y borrada con éxito.</p>
                <button type='cancel' onclick='window.location.href="reservations"'>Salir</button>`;
        }else if (data.status === "error"){
            document.getElementById("container_overlay").innerHTML = `<h1>Error del servidor</h1>
                <p>Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br>
                ` + data.message + `</p>
                <button type="cancel" onclick="return close_window()">Volver</button>`;
        }
    })
    .catch(error => {document.getElementById("container_overlay").innerHTML = `<h1>Error del servidor</h1>
        <p>Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br>
        ` + error + `</p>
        <button type="cancel" onclick="return close_window()">Volver</button>`;
    });
}

function update_page_data(){
    if (expirado){
        document.getElementById("content_div").style = "background-image:url('../images/RedTicket.png');";
        document.getElementById("expiracion").style = "color: red; opacity: 1;";
    }else{
        document.getElementById("content_div").style = "background-image:url('../images/GreenTicket.png');";
        document.getElementById("expiracion").style = "color: red; opacity: 0;";
    }
    document.getElementById("book_leftside").innerHTML = `<h2 style="margin: 1.5vw 0;">Datos del usuario</h2>
        <p data><b>` + ((estudiante) ? "ESTUDIANTE" : "DOCENTE") + `</b></p>
        <p data id="numero" style="margin: 0;"></p>
        <p data style="margin: 0; -webkit-line-clamp: 2; line-clamp: 2;" id="nombre"></p>
        <p data id="carrera" style="margin: 0;"></p>
        <p data style="margin: 0;"><b>Genero: </b>` + ((datos["Genero"] === "M") ? "Masculino" : "Femenino") + `</p>`;
    document.getElementById("book_rightside").innerHTML = `<h2 style="margin: 1.5vw 0;">Datos del libro</h2>
        <p data id="titulo" style="margin: 0;"></p>
        <p data id="autores" style="margin: 0; -webkit-line-clamp: 2; line-clamp: 2;"></p>
        <p data id="isbn" style="margin: 0;"></p>
        <p data style="margin: 0;"><b>Fecha reservación: </b>` + format_date(reservado) + `</p>
        <div id="expiracion_div"><p data style="margin: 0;"><b>Fecha expiración: </b>` + format_date(expiracion) + `</p><div>`;
    document.getElementById("buttons").innerHTML = `<button onclick="cancel_reservation()">Cancelar<br>reservación</button>
        <button onclick="history.back()">Volver</button>`;

    let temp = document.getElementById("id");
    temp.textContent = "";
    let boldText = document.createElement("b");
    boldText.textContent = "ID de reservación: ";
    temp.appendChild(boldText);
    temp.appendChild(document.createTextNode(datos["IDReservacion"]));
    temp = document.getElementById("numero");
    boldText = document.createElement("b");
    boldText.textContent = "No. de " + ((estudiante) ? "control" : "tarjeta") + ": ";
    temp.appendChild(boldText);
    temp.appendChild(document.createTextNode((estudiante) ? datos["NoControl"] : datos["NoTarjeta"]));
    temp = document.getElementById("nombre");
    boldText = document.createElement("b");
    boldText.textContent = "Nombre: ";
    temp.appendChild(boldText);
    temp.appendChild(document.createTextNode(datos["Nombre"]));
    temp = document.getElementById("carrera");
    boldText = document.createElement("b");
    boldText.textContent = (estudiante) ? "Carrera: " : "Departamento: ";
    temp.appendChild(boldText);
    temp.appendChild(document.createTextNode((estudiante) ? datos["Carrera"] : datos["Departamento"]));
    temp = document.getElementById("titulo");
    boldText = document.createElement("b");
    boldText.textContent = "Titulo: ";
    temp.appendChild(boldText);
    temp.appendChild(document.createTextNode(datos["Titulo"]));
    temp = document.getElementById("autores");
    boldText = document.createElement("b");
    boldText.textContent = "Autores: ";
    temp.appendChild(boldText);
    temp.appendChild(document.createTextNode(datos["Autores"]));
    temp = document.getElementById("isbn");
    boldText = document.createElement("b");
    boldText.textContent = "ISBN: ";
    temp.appendChild(boldText);
    temp.appendChild(document.createTextNode((datos["ISBN"] === null) ? "---" : datos["ISBN"]));
}

function format_date(today){
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
}

function get_page_data(){
    var formData = new FormData();

    formData.append("type", "vista reservacion");
    formData.append("IDReservacion", urlParams.get("id"));
    
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
        reservado = new Date(datos["FechaRealizada"] + "T00:00:00");
        expiracion = new Date(datos["FechaExpiracion"] + "T23:59:59");
        expirado = (today > expiracion);
        estudiante = (datos["NoControl"] !== null);

        update_page_data();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    urlParams = new URLSearchParams(window.location.search);

    get_page_data();
});