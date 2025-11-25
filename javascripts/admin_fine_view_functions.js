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

function send_query(text, formData){
    document.getElementById("container_overlay").innerHTML = `<h1>Procesando...</h1>
        <p>Por favor espere...</p>`;
    
    fetch("../php/admin_insert_queries.php", {
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
        }else if (data.status === "user-not-admin"){
            document.getElementById("container_overlay").innerHTML = `<h1>Usuario no administrador</h1>
                <p>El usuario con el que esta iniciado la sesión no tiene privilegios de administrador, por ende no puede realizar las siguientes acciones.</p>
                <button type="cancel" onclick="return close_window()">Cerrar</button>`;
        }else if (data.status === "success"){
            document.getElementById("container_overlay").innerHTML = text;
        }else if (data.status === "error"){
            let container = document.getElementById("container_overlay");
            container.innerHTML = `<h1>Error del servidor</h1>
                <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button type="cancel" onclick="return close_window()">Volver</button>`;
            let p = container.querySelector(".temp_p");
            p.appendChild(document.createTextNode(data.message));
        }
    });
}

function saldar_multa(){
    open_overlayed_window();
    document.getElementById("container_overlay").innerHTML = `<h1>Confirmar acción</h1>
        <p>Esta por marcar esta multa como saldada, esta acción no se puede deshacer una vez realizada.</p>
        <p>¿Desea continuar?</p>
        <button onclick="perform_saldado()">Confirmar</button>
        <button onclick="close_window()">Cancelar</button>`;
}

function perform_saldado(){
    var formData = new FormData();
    formData.append("type", "saldar multa");
    formData.append("IDPrestamo", urlParams.get("id"));
    
    send_query("<h1>Multa saldada</h1><p>La multa ha sido marcada como saldada.</p><button onclick='close_reload()'>Cerrar</button>", formData);
}

function close_reload(){
    close_window();
    get_page_data();
}

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
        <p data><b id="temp_b1"></b></p>
        <p data id="temp_p1"><b id="temp_b2"></b></p>
        <p data id="temp_p2" style="margin-bottom: 0; -webkit-line-clamp: 2; line-clamp: 2;"><b>Nombre: </b></p>
        <p data id="temp_p3"><b id="temp_b3"></b></p>
        <p data id="temp_p4"><b>Genero: </b></p>`;
    document.getElementById("book_rightside").innerHTML = `<h2>Datos del libro</h2>
        <p data id="temp_p5"><b>Folio: </b></p>
        <p data id="temp_p6" style="-webkit-line-clamp: 2; line-clamp: 2;"><b>Título: </b></p>
        <p data style='opacity: 0;'>a</p>
        <p data id="temp_p7"><b>Fecha prestado: </b></p>
        <p data id="temp_p8"><b>Fecha devuelto: </b></p>`;
    document.getElementById("book_leftside2").innerHTML = `<p data id="temp_p9" style="margin-bottom: 0"><b>Sanción: </b></p>`;
    document.getElementById("book_rightside2").innerHTML = `<p data id="temp_p10" style="margin-bottom: 0"><b>Fecha de la multa: </b></p>`;
    let temp = document.getElementById("temp_b1");
    temp.appendChild(document.createTextNode((estudiante) ? "ESTUDIANTE" : "DOCENTE"));
    temp = document.getElementById("temp_b2");
    temp.appendChild(document.createTextNode("No. de " + ((estudiante) ? "control" : "tarjeta") + ": "));
    temp = document.getElementById("temp_p1");
    temp.appendChild(document.createTextNode((estudiante) ? datos["NoControl"] : datos["NoTarjeta"]));
    temp = document.getElementById("temp_p2");
    temp.appendChild(document.createTextNode(datos["Nombre"]));
    temp = document.getElementById("temp_b3");
    temp.appendChild(document.createTextNode(((estudiante) ? "Carrera" : "Departamento") + ": "));
    temp = document.getElementById("temp_p3");
    temp.appendChild(document.createTextNode((estudiante) ? datos["Carrera"] : datos["Departamento"]));
    temp = document.getElementById("temp_p4");
    temp.appendChild(document.createTextNode((datos["Genero"] === "M") ? "Masculino" : "Femenino"));
    temp = document.getElementById("temp_p5");
    temp.appendChild(document.createTextNode(datos["Folio"]));
    temp = document.getElementById("temp_p6");
    temp.appendChild(document.createTextNode(datos["Titulo"]));
    temp = document.getElementById("temp_p7");
    temp.appendChild(document.createTextNode(format_date(prestado)));
    temp = document.getElementById("temp_p8");
    temp.appendChild(document.createTextNode(format_date(devuelto)));
    temp = document.getElementById("temp_p9");
    temp.appendChild(document.createTextNode(datos["Sancion"]));
    temp = document.getElementById("temp_p10");
    temp.appendChild(document.createTextNode(format_date(multa)));

    let razonElement = document.getElementById("razon");
    razonElement.textContent = "";

    let boldText = document.createElement("b");
    boldText.textContent = "Razon: ";
    
    razonElement.appendChild(boldText);
    razonElement.appendChild(document.createTextNode(datos["Razon"]));
    
    if (datos["DeudaSaldada"] == 1){
        document.getElementById("buttons").innerHTML = `<p data style="display: inline; color: #007F0E; margin: 0 max(1.5vw, 5.5px);">[MULTA SALDADA]</p>
            <button onclick="history.back()">Volver</button>`;
    }else{
        document.getElementById("buttons").innerHTML = `<button id="confirm" onclick="saldar_multa()">Saldar multa</button>
            <button onclick="history.back()">Volver</button>`;
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