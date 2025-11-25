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

function send_query(text, formData, replacements={}){
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
            let container = document.getElementById("container_overlay");
            container.innerHTML = text;
            Object.keys(replacements).forEach((item) => {
                let temp = container.querySelector("." + item);
                let content = replacements[item];
                if (content[2] == "text"){
                    temp.insertAdjacentText(content[0], content[1]);
                }else{
                    let element = document.createElement(content[2]);
                    element.appendChild(document.createTextNode(content[1]));
                    temp.insertAdjacentElement(content[0], element);
                }
            })
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

function generate_fine(){
    open_overlayed_window();
    if (estado === "pendiente" || estado === "expirado"){
        document.getElementById("container_overlay").innerHTML = `<h1>Advertencia</h1>
            <p>Esto marcará el préstamo como <b>devuelto</b>.</p>
            <p>¿Desea continuar?</p>
            <button onclick='open_fine_maker()'>Continuar</button>
            <button onclick='close_window()'>Cerrar</button>`;
    }else{
        open_fine_maker();
    }
}

function open_fine_maker(){
    let container = document.getElementById("container_overlay");
    container.className = "container_overlay_black";
    container.innerHTML = `<h1 style="display: inline-block;">Multa</h1>
        <div class="vertical_spacing">
            <p style="margin: 0"><b class="temp_b1"></b></p>
            <p style="margin: 0" class="temp_p1"><b>Nombre: </b></p>
        </div>
        <div class="vertical_spacing">
            <p style="margin: 0" class="temp_p2"><b>Folio: </b></p>
            <p style="margin: 0" class="temp_p3"><b>Título: </b></p>
        </div>
        <form id="multa_form" method="POST">
            <p style="display: inline">Sanción: </p>
            <div style="display: inline-block; width: 60%;">
                <select id="sancion" placeholder="Sanción..." required>
                    <option value="">Selecciona una opción...</option>
                    <option value="Servicio social">Servicio social obligatorio</option>
                    <option value="Pago en forma económica">Pago en forma económica</option>
                    <option value="Acordado por el jefe o secretario">Acuerdado por el jefe o secretario</option>
                    <option value="Sin sanción, ha sido justificado">Sin sanción por justificación</option>
                </select>
            </div>
            <p>Razón:</p>
            <textarea rows="4" style="resize: none; width: 74%;" id="razon" maxlength="255" placeholder="Razón..." required></textarea>
            <button type="text" onclick="return perform_fine()">Multar</button>
            <button type="text" onclick="return close_window()">Cancelar</button>
        </form>`;
    let temp = container.querySelector(".temp_b1");
    temp.insertAdjacentText("afterbegin", "No. de " + ((estudiante) ? "control" : "tarjeta") + ": ");
    temp.insertAdjacentText("afterend", ((estudiante) ? datos["NoControl"] : datos["NoTarjeta"]));
    temp = container.querySelector(".temp_p1");
    temp.appendChild(document.createTextNode(datos["Nombre"]));
    temp = container.querySelector(".temp_p2");
    temp.appendChild(document.createTextNode(datos["Folio"]));
    temp = container.querySelector(".temp_p3");
    temp.appendChild(document.createTextNode(datos["Titulo"]));
    document.getElementById("multa_form").onsubmit = form_prevent;
    sancion_combobox = $('#sancion').selectize({
        sortField: 'text',
        normalize: true,
        onChange: function (value){
            let text_area = document.getElementById("razon");
            if (value === "Servicio social" && text_area.value === ""){
                diff = Math.max(Math.ceil((today - limite) / (1000 * 3600 * 24)), 0);
                text_area.value = "Por retraso de entrega del ejemplar de " + diff + " días, consistiendo en " + 4*diff + " horas de servicio social.";
            }
        }
    })[0].selectize;
}

function perform_fine(){
    sancion = sancion_combobox.getValue();
    razon = document.getElementById("razon").value;

    if (sancion === "" || razon === ""){
        return true;
    }

    today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);

    if (sancion === "Sin sanción, ha sido justificado"){
        deuda = 1;
    }else{
        deuda = 0;
    }

    if (estado == "pendiente" || estado == "expirado"){
        update = true;
    }else{
        update = false;
    }

    var dict = {
        "id": urlParams.get("id"),
        "sancion": sancion,
        "razon": razon,
        "fecha": today.toISOString().split('T')[0],
        "deuda": deuda,
        "update": update,
        "domicilio": datos["ADomicilio"]
    }

    var formData = new FormData();
    formData.append("type", "multa");
    formData.append("data", JSON.stringify(dict));

    var replacements = {
        "temp_b1": ["afterbegin", sancion, "text"],
        "temp_b2": ["afterbegin", razon, "text"]
    }

    if (deuda){
        replacements["temp_p"] = ["afterend", "La multa siendo justificada esta automaticamente ya saldada y no representa problema alguno en cuanto al préstamo y al alumno.", "p"];
    }

    send_query("<h1>Multa efectuada</h1><p class='temp_p'>La multa se realizo correctamente bajo la sanción: <b class='temp_b1'></b> y la razón:</p><p><b class='temp_b2'></b></p><button onclick='close_reload()'>Cerrar</button>", formData, replacements);
}

function confirm_return(){
    open_overlayed_window()
    document.getElementById("container_overlay").innerHTML = `<h1>Confirmar acción</h1>
        <p>Esta por marcar el préstamo como devuelto en tiempo y forma sin ningun problema.</p>
        <p>¿Desea continuar?</p>
        <button onclick="efectuar_return()">Confirmar</button>
        <button onclick="close_window()">Cancelar</button>`;
}

function efectuar_return(){
    fecha = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);

    var formData = new FormData();
    formData.append("type", "prestamo devuelto");
    formData.append("fecha", fecha.toISOString().split("T")[0]);
    formData.append("id", urlParams.get("id"));
    formData.append("domicilio", datos["ADomicilio"]);

    send_query("<h1>Préstamo devuelto</h1><p>El préstamo a sido marcado como devuelto con éxito.</p><button onclick='close_reload()'>Cerrar</button>", formData);
}

function close_reload(){
    close_window();
    get_page_data();
}

function update_page_data(){
    let estilo = "";
    if (estado === "pendiente"){
        estilo = "background-color: #ffd800; border-color: #c4a300;";
    }else if (estado === "expirado" || estado === "multado"){
        estilo = "background-color: #FF9000; border-color: #C46B00;";
    }else if (estado === "devuelto" || estado === "saldado"){
        estilo = "background-color: #B7FF00; border-color: #90C400;";
    }
    document.getElementById("content_div").style = estilo;
    let book_leftside = document.getElementById("book_leftside");
    book_leftside.innerHTML = `<h2>Datos de usuario</h2>
        <p data><b class="temp_b"></b></p>
        <p data class="temp_p" style="margin-bottom: 0; -webkit-line-clamp: 2; line-clamp: 2;"><b>Nombre: </b></p>
        <p data style="margin-bottom: 0;"><b class="temp_b2"></b></p>`;
    let book_rightside = document.getElementById("book_rightside");
    book_rightside.innerHTML = `<h2>Datos de libro</h2>
        <p data class="temp_p1"><b>Folio: </b></p>
        <p data class="temp_p2" style="-webkit-line-clamp: 2; line-clamp: 2;"><b>Título: </b></p>
        <p data class="temp_p3" style="margin-bottom: 0;"><b>Estado físico: </b></p>`;
    let last_part = document.getElementById("last_part");
    last_part.innerHTML = `<div id="book_leftside2" class="book_leftside">
            <p data class="temp_p1"><b>Fecha entregado: </b></p>
        </div>
        <div id="book_rightside2" class="book_rightside">
            <p data class="temp_p2"><b>Fecha limite: </b></p>
        </div>`;
    let temp = book_leftside.querySelector(".temp_b");
    temp.insertAdjacentText("afterbegin", "No. de " + ((estudiante) ? "control" : "tarjeta") + ": ");
    temp.insertAdjacentText("afterend", ((estudiante) ? datos["NoControl"] : datos["NoTarjeta"]));
    book_leftside.querySelector(".temp_p").appendChild(document.createTextNode(datos["Nombre"]));
    temp = book_leftside.querySelector(".temp_b2");
    temp.insertAdjacentText("afterbegin", ((estudiante) ? "Carrera" : "Departamento") + ": ");
    temp.insertAdjacentText("afterend", ((estudiante) ? datos["Carrera"] : datos["Departamento"]));
    book_rightside.querySelector(".temp_p1").appendChild(document.createTextNode(datos["Folio"]));
    book_rightside.querySelector(".temp_p2").appendChild(document.createTextNode(datos["Titulo"]));
    book_rightside.querySelector(".temp_p3").appendChild(document.createTextNode(datos["EstadoFisico"]));
    last_part.querySelector(".temp_p1").appendChild(document.createTextNode(format_date(entregado)));
    last_part.querySelector(".temp_p2").appendChild(document.createTextNode(((datos["FechaLimite"] === null) ? "No aplica" : format_date(limite))));
    
    if (estado === "expirado"){
        let last = document.getElementById("last_part");
        last.innerHTML += "<p data style='color: #B50000'><b class='temp_b'></b></p>";
        last.querySelector(".temp_b").textContent = ((datos["ADomicilio"] == 0) ? "EN SALA" : "A DOMICILIO") + " - EXPIRADO";
        document.getElementById("confirm").disabled = true;
        document.getElementById("generate").disabled = false;
    }else if (estado === "pendiente"){
        let last = document.getElementById("last_part");
        last.innerHTML += "<p data><b class='temp_b'></b></p>";
        last.querySelector(".temp_b").textContent = ((datos["ADomicilio"] == 0) ? "EN SALA" : "A DOMICILIO");
        document.getElementById("confirm").disabled = false;
        document.getElementById("generate").disabled = false;
    }else{
        let book_leftside2 = document.getElementById("book_leftside2");
        book_leftside2.innerHTML += "<p data class='temp_p'><b>Fecha devuelto: </b></p>";
        let book_rightside2 = document.getElementById("book_rightside2");
        book_rightside2.innerHTML += "<p data class='temp_p'><b class='temp_b'></b></p>";
        document.getElementById("confirm").disabled = true;
        book_leftside2.querySelector(".temp_p").appendChild(document.createTextNode(format_date(devuelto)));
        book_rightside2.querySelector(".temp_p").style = ((estado === "multado") ? "color: #B50000" : "color: #46A506");
        book_rightside2.querySelector(".temp_b").appendChild(document.createTextNode(((datos["ADomicilio"] == 0) ? "EN SALA - " : "A DOMICILIO - ") + ((estado === "multado") ? "MULTADO" : ((estado === "devuelto") ? "ENTREGADO" : "SALDADO"))));
        
        if (estado === "devuelto"){
            document.getElementById("generate").disabled = false;
        }else{
            document.getElementById("generate").disabled = true;
        }
    }
}

function confirm_ticket(){
    open_overlayed_window()
    let container = document.getElementById("container_overlay");
    container.innerHTML = `<h1>Confirmar acción</h1>
        <p>Esta por imprimir el ticket de préstamo de este préstamo.</p>
        <p>¿Desea continuar?</p>
        <button onclick="print_ticket()">Confirmar</button>
        <button onclick="close_window()">Cancelar</button>`;
}

async function print_ticket(){
    let container = document.getElementById("container_overlay");
    container.innerHTML = "<h1>Generando ticket...</h1>";

    if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
    }

    try{
        const config = qz.configs.create("Epson");
        
        const datos2 = [
            "\x1B\x40",
            " ___________________________________\n",
            "         Firma de recibido\n\n",
            "  Institituto Tecnologico de Iguala\n",
            "         Ticket de prestamo\n\n",
            "Telefono:\n\n",
            "Datos del usuario:\n",
            ((datos["NoControl"] !== null) ? "No. de Control: " + datos["NoControl"] : "No. de Tarjeta: " + datos["NoTarjeta"]) + "\n",
            "Nombre: " + datos["Nombre"] + "\n",
            ((datos["NoControl"] !== null) ? "Carrera: " + datos["Carrera"] : "Departamento: " + datos["Departamento"]) + "\n\n",
            "Datos del libro:\n",
            "Folio: " + datos["Folio"] + "\n",
            "Titulo: " + datos["Titulo"] + "\n\n",
            "Datos del prestamo:\n",
            "Fecha de prestado: " + datos["FechaEntregado"] + "\n",
            "Fecha de entrega limite: " + datos["FechaLimite"] + "\n\n\n\n\n\n\n\n",
            "\x1D\x56\x00"
        ];

        await qz.print(config, datos2);

        close_window();
    }catch{
        container.innerHTML = `<h1>Problema de impresión</h1>
            <p>La impresora se desconecto, no esta respondiendo o no esta funcionando apropiadamente, arregle el problema e intentelo de nuevo.</p>
            <button type="cancel" onclick="return close_window()">Cerrar</button>`;
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