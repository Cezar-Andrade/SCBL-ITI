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

function format_date(today){
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
}

function send_query(text, formData){
    document.getElementById("container_overlay").innerHTML = `<h1>Procesando...</h1>
        <p>Por favor espere...</p>`;
    
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
        }else if (data.status === "already-reservated"){
            document.getElementById("container_overlay").innerHTML = `<h1>Ya esta reservado</h1>
                <p>Ya haz realizado una reservación para este título, verifica que aun este vigente para poder recogerlo de lo contrario cancelelo y solicite uno nuevo.</p>
                <button type="cancel" onclick="return close_window()">Cerrar</button>`;
        }else if (data.status === "insufficient-reservations"){
            document.getElementById("container_overlay").innerHTML = `<h1>Insuficientes reservaciones disponibles</h1>
                <p>Tienes 3 reservaciones ya hechas, no puedes asignar otro más hasta que hayas cancelado o recogido uno en especifico.</p>
                <button type="cancel" onclick="return close_window()">Cerrar</button>`;
        }else if (data.status === "book-ran-out"){
            document.getElementById("container_overlay").innerHTML = `<h1>Titulo no disponible</h1>
                <p>No hay ejemplares disponibles para reservar este titulo.</p>
                <p>Si crees que es un error, comuniquelo con el Centro de Información.</p>
                <button type="cancel" onclick="return close_window()">Cerrar</button>`;
        }else if (data.status === "success"){
            document.getElementById("container_overlay").innerHTML = text;
        }else if (data.status === "error"){
            document.getElementById("container_overlay").innerHTML = `<h1>Error del servidor</h1>
                <p>Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br>
                ` + data.message + `</p>
                <button type="cancel" onclick="return close_window()">Volver</button>`;
        }
    });
}

function get_page_data(){
    var formData = new FormData();
    today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    fecha = today.toISOString().split('T')[0];

    formData.append("type", "vista titulo user");
    formData.append("IDTitulo", urlParams.get("id"));
    formData.append("Fecha", fecha);

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

        tomo = "---";
        volumen = "---";
        
        if (datos["NoTomo"] !== null){
            tomo = datos["NoTomo"];
            
            if (datos["Tomo"] !== null){
                tomo += " - " + datos["Tomo"];
            }
        }else if (datos["Tomo"] !== null){
            tomo = datos["Tomo"];
        }

        if (datos["NoVolumen"] !== null){
            volumen = datos["NoVolumen"];
            
            if (datos["Volumen"] !== null){
                volumen += " - " + datos["Volumen"];
            }
        }else if (datos["Volumen"] !== null){
            volumen = datos["Volumen"];
        }

        update_page();
    });
}

function update_page(){
    document.getElementById("book_leftside").innerHTML = `<h1>Datos del titulo</h1>
        <p data><b>Titulo: </b>` + datos["Titulo"] + `</p>
        <p data><b>Editorial: </b>` + (datos["Editorial"] === null ? "---" : datos["Editorial"]) + `</p>
        <p data><b>Lugar publicación: </b>` + (datos["Ubicacion"] === null ? "---" : datos["Ubicacion"]) + `</p>
        <p data><b>Clasificación: </b>` + datos["Clasificacion"] + `</p>
        <p data><b>Edición: </b>` + (datos["Edicion"] === null ? "---" : datos["Edicion"]) + `</p>
        <p data style="-webkit-line-clamp: 2; line-clamp: 2;"><b>Autores: </b>` + datos["Autores"] + `</p>
        <button style="padding-left:1vw; padding-right:1vw; margin: 0 max(1vw, 5.5px)" onclick="reservar_libro()">Reservar</button>`;
    document.getElementById("book_rightside").innerHTML = `<p data style="margin-top: 2.5vw; margin-bottom: max(1.5vw, 9px)"><b>ISBN: </b>` + (datos["ISBN"] === null ? "---" : datos["ISBN"]) + `</p>
        <p data><b>Idioma: </b>` + datos["Idioma"] + `</p>
        <p data><b>Año de publicación: </b>` + (datos["AnioPublicacion"] === null ? "---" : datos["AnioPublicacion"]) + `</p>
        <p data><b>Tomo: </b>` + tomo + `</p>
        <p data><b>Volumen: </b>` + volumen + `</p>
        <p data ` + ((datos["NoFoliosDisponibles"] <= 0) ? "style='color:red;'" : "") + `><b>No. ejemplares disponibles: </b>` + (datos["NoFoliosDisponibles"] - datos["Reservados"]) + `</p>
        <p data style="-webkit-line-clamp: 2; line-clamp: 2;"><b>Folios: </b>` + datos["Folios"] + `</p>
        <button style="padding-left:1vw; padding-right:1vw; margin: 0 max(1vw, 5.5px)" onclick="history.back()">Volver</button>`;
}

function reservar_libro(){
    open_overlayed_window();

    if (datos["NoFoliosDisponibles"] <= 0){
        document.getElementById("container_overlay").innerHTML = `<h1>Titulo no disponible</h1>
            <p>El titulo que intentas reservar no tiene ejemplares disponibles para reservar, intentelo de nuevo más tarde u otro día cuando haya ejemplares disponibles.</p>
            <button onclick='close_window()'>Cancelar</button>`;
    }else{
        today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
        today.setDate(today.getDate() + 1);
        if (today.getDay() == 0){
            today.setDate(today.getDate() + 1);
        }else if (today.getDay() == 6){
            today.setDate(today.getDate() + 2);
        }
        
        document.getElementById("container_overlay").innerHTML = `<h1>Confirmar acción</h1>
            <p>Esta por reservar el título: <b>` + datos["Titulo"] + `</b> para recoger a más tardar el día <b>` + format_date(today) + `</b>, de lo contrario este se invalidará.</p>
            <p>Solicite las reservaciones con responsabilidad, si tiene 3 libros ya prestados bajo su posesión no se le podrá confirmar la reservación y se le cancelará cuando intente recoger el libro, no puedes llevar más de 3 libros distintos.</p>
            <p>¿Desea reservar este titulo?</p>
            <button onclick='confirmar_reservacion()'>Confirmar</button>
            <button onclick='close_window()'>Cancelar</button>`;
    }
}

function confirmar_reservacion(){
    today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    today.setDate(today.getDate() + 1);
    if (today.getDay() == 0){
        today.setDate(today.getDate() + 1);
    }else if (today.getDay() == 6){
        today.setDate(today.getDate() + 2);
    }
    today2 = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    fecha = today.toISOString().split('T')[0];
    fecha2 = today2.toISOString().split('T')[0];

    var dict = {
        "idt": urlParams.get("id"),
        "inicio": fecha2,
        "fin": fecha
    }

    var formData = new FormData();
    formData.append("type", "reservacion");
    formData.append("data", JSON.stringify(dict));

    send_query("<h1>Reservación realizada</h1><p>La reservación ha sido registrada, puede cancelarla si desea en el menú de reservaciones correspondiente.</p><button onclick='close_reload()'>Cerrar</button>", formData);
}

function close_reload(){
    close_window();
    get_page_data();
}

document.addEventListener("DOMContentLoaded", () => {
    urlParams = new URLSearchParams(window.location.search);

    get_page_data();
});