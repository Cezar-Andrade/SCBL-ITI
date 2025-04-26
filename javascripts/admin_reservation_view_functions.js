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
        }else if (data.status === "insufficient-books"){
            document.getElementById("container_overlay").innerHTML = `<h1>Ejemplares insuficientes</h1>
                <p>No hay suficientes ejemplares disponibles para esta reservación en el sistema.</p>
                <p>Cree más ejemplares para cubrir la reservación o cancele las reservaciones de los usuarios y vuelva a intentarlo.</p>
                <button red type="cancel" onclick="return close_window()">Cerrar</button>`;
        }else if (data.status === "user-cant"){
            document.getElementById("container_overlay").innerHTML = `<h1>Prestamos insuficientes</h1>
                <p>El usuario que realizo la reservación, no tiene prestamos disponibles para llevarse el libro ya que ya se llevo otros 3 libros, solicite que devuelva algún libro que se haya llevado o si ya lo hizo, busquelo y resuelvalo.</p>
                <button type="cancel" onclick="return close_window()">Cerrar</button>`;
        }else if (data.status === "success"){
            let container = document.getElementById("container_overlay");
            container.innerHTML = text;
            Object.keys(replacements).forEach((item) => {
                let temp = container.querySelector("." + item);
                temp.appendChild(document.createTextNode(replacements[item]));
            });
        }else if (data.status === "error"){
            let container = document.getElementById("container_overlay")
            container.innerHTML = `<h1>Error del servidor</h1>
                <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button type="cancel" onclick="return close_window()">Volver</button>`;
            let temp = container.querySelector(".temp_p");
            temp.appendChild(document.createTextNode(data.message));
        }
    });
}

function change_expiracion(){
    let container = document.getElementById("expiracion_div");
    container.innerHTML = "<p data style='margin: 0;'><b>Fecha expiración: </b><input id='fecha' type='date' style='width=\"80%\";'></p>";
    let temp = document.getElementById("fecha");
    temp.min = datos["FechaRealizada"];
    temp.value = datos["FechaExpiracion"];
    document.getElementById("buttons").innerHTML = `<button onclick="update_expiracion()">Guardar</button>
        <button onclick="update_page_data()">Cancelar</button>`;
}

function update_expiracion(){
    open_overlayed_window();
    document.getElementById("container_overlay").innerHTML = `<h1>Confirmar acción</h1>
        <p>Esta por actualizar la fecha de expiración de esta reservación.</p>
        <p>¿Desea continuar?</p>
        <button onclick='commit_expiracion()'>Continuar</button>
        <button onclick='close_window()'>Cerrar</button>`;
}

function commit_expiracion(){
    today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);

    var formData = new FormData();
    formData.append("type", "update expiracion");
    formData.append("IDReservacion", urlParams.get("id"));
    formData.append("fecha", document.getElementById("fecha").value);
    formData.append("fechaActual", today.toISOString().split("T")[0]);

    var exp = new Date(document.getElementById("fecha").value + "T00:00:00");

    var replacements = {
        "temp_b": format_date(exp)
    }

    send_query("<h1>Expiración actualizada</h1><p>La fecha de expiracion fue cambiada por: <b class='temp_b'></b></p><button onclick='close_reload()'>Cerrar</button>", formData, replacements);
}

function close_reload(){
    close_window();
    get_page_data();
}

function confirmar_reservation(folio=""){
    if (folio === ""){
        open_overlayed_window();
    }
    document.getElementById("container_overlay").innerHTML = `<h1>Procesando...</h1>
        <p>Por favor espere...</p>`;

    var formData = new FormData();
    formData.append("type", "folios");
    formData.append("IDTitulo", datos["IDTitulo"]);
    
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
        datos2 = JSON.parse(data.data);

        if (datos2.length <= 0){
            document.getElementById("container_overlay").innerHTML = `<h1>Titulo no disponible</h1>
                <p>Los ejemplares de este titulo se encuentran prestados y no hay ninguno más disponible por el momento, esto suele suceder cuando la reservación expira, recuerde respetar las fechas de las reservaciones del ejemplar en tiempo y forma.</p>
                <button onclick='close_window()'>Cerrar</button>`;
            return;
        }else{
            document.getElementById("container_overlay").innerHTML = `<h1>Asignar folio</h1>
                <p>Se esta por dar como validado la reservación del libro titulado como:</p>
                <p id="titulo_validar"></p>
                <p>Seleccione el folio correspondiente al ejemplar que se le prestará al usuario.</p>
                <form id="form_folios" method="POST">
                    <div>
                        <p style="display: inline-block">Folio: </p>
                        <div style="display: inline-block; width: 40%" placeholder="########...">
                            <select id="folios" required></select>
                        </div>
                    </div>
                    <button onclick='confirmar_folio()'>Asignar</button>
                    <button onclick='close_window()'>Cancelar</button>
                </form>`;
        }
        
        document.getElementById("form_folios").onsubmit = form_prevent;

        temp = document.getElementById("titulo_validar");
        boldText = document.createElement("b");
        boldText.textContent = datos["Titulo"];
        temp.appendChild(boldText);

        folio_combobox = $("#folios").selectize({
            sortField: 'text',
            normalize: true
        })[0].selectize;
        
        for (var i = 0; i < datos2.length; i++){
            var f = datos2[i][0];
            folio_combobox.addOption({"value": f, "text": f});
        };
        folio_combobox.refreshOptions(false);
        if (folio !== ""){
            folio_combobox.setValue(folio);
        }
    });
}

function confirmar_folio(){
    folio = folio_combobox.getValue();

    if (folio === ""){
        return true;
    }

    document.getElementById("container_overlay").innerHTML = `<h1>Confirmar acción</h1>
        <p>Esta por asignar el folio: <b>` + folio + `</b> a esta reservación en especifico.</p>
        <p><b>Esta acción no se podra deshacer una vez realizado ya que la reservación será eliminada y se tratará como un prestamo normal.</b></p>
        <p>¿Desea continuar?</p>
        <button onclick="asignar_folio('` + folio + `')">Confirmar</button>
        <button onclick="confirmar_reservation('` + folio + `')">Cancelar</button>`;
}

function asignar_folio(folio){
    today2 = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    fecha = today2.toISOString().split('T')[0];
    today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    today.setDate(today.getDate() + 2);
    if (today.getDay() == 0){
        today.setDate(today.getDate() + 1);
    }else if (today.getDay() == 6){
        today.setDate(today.getDate() + 2);
    }
    fechaLimite = today.toISOString().split('T')[0];

    var dict ={
        "IDReservacion": urlParams.get("id"),
        "IDUsuario": datos["IDUsuario"],
        "Folio": folio,
        "Fecha": fecha,
        "FechaLimite": fechaLimite
    }

    var formData = new FormData();
    formData.append("type", "reservacion prestado");
    formData.append("data", JSON.stringify(dict));

    var replacements = {
        "temp_b1": folio,
        "temp_b2": format_date(today2),
        "temp_b3": format_date(today)
    }

    send_query("<h1>Folio asignado</h1><p>El folio <b class='temp_b1'></b> fue asignado correctamente al prestamo adecuado a la reservación con fecha de entrega siendo <b class='temp_b2'></b> y fecha limite de devolución siendo <b class='temp_b3'></b>.</p><button onclick='window.location.href=\"reservations\"'>Cerrar</button>", formData, replacements);
}

function cancel_reservation(){
    open_overlayed_window();
    document.getElementById("container_overlay").innerHTML = `<h1>Confirmar acción</h1>
        <p>Estas por cancelar la reservación hecha por el usuario, una acción que no se puede deshacer una vez realizada ya que borrará la reservación.</p>
        <p>Se recomienda no hacer esto mientras la reservación este aun vigente, las reservaciones expiradas se eliminan automaticamente despues de 7 días.</p>
        <p>¿Desea continuar?</p>
        <button onclick='drop_reservation()'>Continuar</button>
        <button onclick='close_window()'>Cancelar</button>`;
}

function drop_reservation(){
    var formData = new FormData();
    formData.append("type", "reservation");
    formData.append("id", urlParams.get("id"));

    fetch("../php/admin_delete_queries.php", {
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
            document.getElementById("container_overlay").innerHTML = `<h1>Reservación cancelada</h1>
                <p>La reservación fue invalidada y borrada con éxito.</p>
                <button type='cancel' onclick='window.location.href="reservations"'>Salir</button>`;
        }else if (data.status === "error"){
            let container = document.getElementById("container_overlay");
            container.innerHTML = `<h1>Error del servidor</h1>
                <p>Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button type="cancel" onclick="return close_window()">Volver</button>`;
            let temp = container.querySelector(".temp_p");
            temp.appendChild(document.createTextNode(data.message));
        }
    })
    .catch(error => {
        let container = document.getElementById("container_overlay");
        container.innerHTML = `<h1>Error del servidor</h1>
            <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
            <button type="cancel" onclick="return close_window()">Volver</button>`;
        let temp = container.querySelector(".temp_p");
        temp.appendChild(document.createTextNode(error));
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
        <p data><b id="tipo_usuario"></b></p>
        <p data id="numero" style="margin: 0;"></p>
        <p data style="margin: 0; -webkit-line-clamp: 2; line-clamp: 2;" id="nombre"></p>
        <p data id="carrera" style="margin: 0;"></p>
        <p data id="genero" style="margin: 0;"><b>Genero: </b></p>`;
    document.getElementById("book_rightside").innerHTML = `<h2 style="margin: 1.5vw 0;">Datos del libro</h2>
        <p data id="titulo" style="margin: 0;"></p>
        <p data id="autores" style="margin: 0; -webkit-line-clamp: 2; line-clamp: 2;"></p>
        <p data id="isbn" style="margin: 0;"></p>
        <p data id="reservado" style="margin: 0;"><b>Fecha reservación: </b></p>
        <div id="expiracion_div"><p data id="expiracion" style="margin: 0;"><b>Fecha expiración: </b></p><div>`;
    document.getElementById("buttons").innerHTML = `<button style="margin: 0 0.5vw; padding: 0 1vw;" onclick="change_expiracion()">Cambiar fecha<br>de expiración</button>
        <button style="margin: 0 0.5vw; padding: 0 1vw;" onclick="confirmar_reservation()">Confirmar<br>reservación</button>
        <button style="margin: 0 0.5vw; padding: 0 1vw;" onclick="cancel_reservation()">Cancelar<br>reservación</button>
        <button style="margin: 0 0.5vw; padding: 0 1vw;" onclick="history.back()">Volver</button>`;

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
    temp = document.getElementById("tipo_usuario");
    temp.textContent = ((estudiante) ? "ESTUDIANTE" : "DOCENTE");
    temp = document.getElementById("genero");
    temp.appendChild(document.createTextNode((datos["Genero"] === "M") ? "Masculino" : "Femenino"));
    temp = document.getElementById("reservado");
    temp.appendChild(document.createTextNode(format_date(reservado)));
    temp = document.getElementById("expiracion");
    temp.appendChild(document.createTextNode(format_date(expiracion)));
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