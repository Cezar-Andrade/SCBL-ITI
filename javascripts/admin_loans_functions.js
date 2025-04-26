function form_prevent(e){
    e.preventDefault();
}

function close_window(){
    overlay.remove();
    return false;
}

async function search_user_data(){
    numero = document.getElementById("numero");
    folio = document.getElementById("folio");

    numero.required = true;
    folio.required = false;

    if (numero.value === ""){
        return true;
    }

    datos = await get_data_user();

    if (datos["Nombre"] === undefined){
        document.getElementById("nombre").value = "No se encontro...";
        document.getElementById("apeP").value = "";
        document.getElementById("apeM").value = "";
    }else{
        document.getElementById("nombre").value = datos["Nombre"];
        document.getElementById("apeP").value = datos["ApellidoPaterno"];
        document.getElementById("apeM").value = datos["ApellidoMaterno"];
    }
}

async function search_sample_data(){
    numero = document.getElementById("numero");
    folio = document.getElementById("folio");

    numero.required = false;
    folio.required = true;

    if (folio.value === ""){
        return true;
    }

    datos = await get_data_folio();

    if (datos["Titulo"] === undefined){
        document.getElementById("titulo").value = "No se encontro...";
        document.getElementById("isbn").value = "";
        document.getElementById("autores").value = "";
        document.getElementById("disponible").value = "";
    }else{
        document.getElementById("titulo").value = datos["Titulo"];
        document.getElementById("isbn").value = datos["ISBN"];
        document.getElementById("autores").value = datos["Autores"];
        document.getElementById("disponible").value = datos["EstadoDisponible"];
    }
}

async function get_data_user(){
    var formData = new FormData();

    if (document.getElementById("student").checked){
        formData.append("type", "estudiante por ID");
        formData.append("data", JSON.stringify({"nocontrol": document.getElementById("numero").value}));
    }else{
        formData.append("type", "docente por ID");
        formData.append("data", JSON.stringify({"notarjeta": document.getElementById("numero").value}));
    }

    return await fetch("../php/admin_search_queries.php", {
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
        return JSON.parse(data.data);
    });
}

async function get_data_folio(){
    var formData = new FormData();
    formData.append("type", "titulo por ejemplar");
    formData.append("data", JSON.stringify({"folio": document.getElementById("folio").value}));

    return await fetch("../php/admin_search_queries.php", {
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
        return JSON.parse(data.data);
    });
}

async function open_loan_window(){
    numero = document.getElementById("numero");
    folio = document.getElementById("folio");

    numero.required = true;
    folio.required = true;

    if (numero.value === "" || folio.value === ""){
        return true;
    }

    user = await get_data_user();
    sample = await get_data_folio();

    open_overlayed_window();
    if (user["Nombre"] === undefined){
        document.getElementById("container_overlay").innerHTML = `<h1>Usuario inexistente</h1>
            <p>El número de control que se ingreso no corresponde a algun usuario, verifique que lo haya escrito bien y que el usuario tenga ese número de control asignado.</p>
            <button type="cancel" onclick="close_window()">Cerrar</button>`;
    }else if (sample["Titulo"] === undefined){
        document.getElementById("container_overlay").innerHTML = `<h1>Titulo inexistente</h1>
            <p>El folio que se ingreso no corresponde a algun titulo, verifique que lo haya escrito bien y que el titulo tenga ese folio asignado.</p>
            <button type="cancel" onclick="close_window()">Cerrar</button>`;
    }else if (sample["EstadoDisponible"] !== "Disponible"){
        document.getElementById("container_overlay").innerHTML = `<h1>Ejemplar no disponible</h1>
            <p>El folio que se ingreso se encuentra actualmente no disponible, verifique si hay otro ejemplar disponible para el mismo titulo, o cheque en los prestamos o gestión de libros el estado de este folio en especifico.</p>
            <button type="cancel" onclick="close_window()">Cerrar</button>`;
    }else{
        folio = folio.value;
        let container = document.getElementById("container_overlay");
        container.innerHTML = `<h1>Registrar prestamo</h1>
            <p>Esta por asignar el ejemplar:</p>
            <p><b class="folio">Folio: </b><br>
            <b class="titulo">Titulo: </b><br>
            <b class="isbn">ISBN: </b><br>
            <b class="autores">Autores: </b></p>
            <p>Al usuario con los siguientes datos:</p>
            <p><b class="numero"></b><br>
            <b class="nombre">Nombre: </b></p>
            <p>¿Desea continuar?</p>
            <button onclick="realizar_prestamo()">Continuar</button>
            <button onclick="close_window()">Cerrar</button>`;
        let temp = container.querySelector(".folio");
        temp.insertAdjacentText("afterend", folio);
        temp = container.querySelector(".titulo");
        temp.insertAdjacentText("afterend", sample["Titulo"]);
        temp = container.querySelector(".isbn");
        temp.insertAdjacentText("afterend", ((sample["ISBN"] === null) ? "---" : sample["ISBN"]));
        temp = container.querySelector(".autores");
        temp.insertAdjacentText("afterend", sample["Autores"]);
        temp = container.querySelector(".numero");
        temp.insertAdjacentText("afterbegin", "No. de " + ((document.getElementById("student").checked) ? "control" : "tarjeta") + ": ");
        temp.insertAdjacentText("afterend", numero.value);
        temp = container.querySelector(".nombre");
        temp.insertAdjacentText("afterend", user["Nombre"] + " " + user["ApellidoPaterno"] + " " + user["ApellidoMaterno"]);
    }
}

function realizar_prestamo(){
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

    var dict = {
        "IDUsuario": user["IDUsuario"],
        "Folio": folio,
        "Fecha": fecha,
        "FechaLimite": fechaLimite,
        "estudiante": document.getElementById("student").checked
    }

    var formData = new FormData();
    formData.append("type", "prestamo");
    formData.append("data", JSON.stringify(dict));

    var replacements = {
        "temp_b1": user["Nombre"] + " " + user["ApellidoPaterno"] + " " + user["ApellidoMaterno"],
        "temp_b2": folio,
        "temp_b3": sample["Titulo"],
        "temp_b4": format_date(today2),
        "temp_b5": format_date(today)
    }

    send_query("<h1>Prestamo realizado</h1><p>El usuario: <b class='temp_b1'></b>.</p><p>Se le asigno prestado el ejemplar con folio: <b class='temp_b2'></b> del titulo: <b class='temp_b3'></b>.</p><p>Con fecha de entregado siendo: <b class='temp_b4'></b> para ser devuelto a más tardar la fecha: <b class='temp_b5'></b>.</p><button type='cancel' onclick='return close_window()'>Cerrar</button>", formData, replacements);
}

function search_query(active){
    numero = document.getElementById("numero");
    folio = document.getElementById("folio");

    numero.required = false;
    folio.required = false;

    var dict = {
        "numero": numero.value,
        "estudiante": document.getElementById("student").checked,
        "folio": folio.value,
        "fechaentregainicio": document.getElementById("FechaEntregaInicio").value,
        "fechalimiteinicio": document.getElementById("FechaLimiteInicio").value,
        "fechadevolucioninicio": document.getElementById("FechaDevolucionInicio").value,
        "fechaentregafinal": document.getElementById("FechaEntregaFinal").value,
        "fechalimitefinal": document.getElementById("FechaLimiteFinal").value,
        "fechadevolucionfinal": document.getElementById("FechaDevolucionFinal").value,
        "active": active
    }

    var formData = new FormData();
    formData.append("type", "prestamos");
    formData.append("data", JSON.stringify(dict));

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
        prestamos_data = JSON.parse(data.data);
        prestamos_length = Object.keys(prestamos_data).length;
        prestamos_max_page = Math.ceil(prestamos_length/5);
        prestamos_page = Math.min(1, prestamos_max_page);
        
        update_search();
    });
    
    return true;
}

function change_page(direction){
    if (prestamos_page > 1 && direction < 0){
        prestamos_page--;
    }else if(prestamos_page < prestamos_max_page && direction > 0){
        prestamos_page++;
    }else{
        return;
    }
    
    update_search();
}

function format_date(today){
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
}

function update_search(){
    prestamos_length = Object.keys(prestamos_data).length;
    prestamos_max_page = Math.ceil(prestamos_length/5);
    prestamos_page = Math.min(prestamos_page, prestamos_max_page);

    let result = document.getElementById("result_area");
    result.innerHTML = "";
    if (prestamos_length > 0){
        for (let i = 5*prestamos_page - 5; i < Math.min(prestamos_length, 5*prestamos_page); i++){
            item = prestamos_data[i];
            fechaEntregado = new Date(item["FechaEntregado"] + "T00:00:00");
            fechaLimite = new Date(item["FechaLimite"] + "T23:59:59");
            fechaMulta = new Date(item["FechaMulta"] + "T00:00:00");
            today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
            estado = "";

            if (item["FechaMulta"] !== null){
                if (item["DeudaSaldada"] == 0){
                    estado = 'background-color:rgb(255, 100, 100)';
                }else{
                    estado = 'background-color:rgb(82, 194, 35)';
                }
            }else if (item["FechaLimite"] !== null){
                if (item["FechaDevuelto"] !== null){
                    fechaDevolucion = new Date(item["FechaDevuelto"] + "T00:00:00");
                    if (fechaDevolucion > fechaLimite){
                        estado = 'background-color: #FFA8A8';
                    }else{
                        estado = 'background-color: #ABFF87';
                    }
                }else if (today > fechaLimite){
                    estado = 'background-color: #FFA8A8';
                }
            }
            
            let result_div = document.createElement("div");
            result_div.className = "search_loan_result";
            result_div.style = estado;
            result_div.innerHTML = `<div class="search_content">
                    <p><b class="temp_b1">Entregado: </b>, <b class="temp_b2">Folio: </b>, <b class="temp_b3">Titulo: </b><br>
                    <b class="temp_b4">Limite: </b>, <b class="temp_b5"></b>, <b class="temp_b6">Nombre: </b></p>
                </div>
                <div class="view_button"style="justify-content: center;">
                    <button class="temp_button">Ver</button>
                </div>`;
            let temp = result_div.querySelector(".temp_b1");
            temp.insertAdjacentText("afterend", format_date(fechaEntregado));
            temp = result_div.querySelector(".temp_b2");
            temp.insertAdjacentText("afterend", item["Folio"]);
            temp = result_div.querySelector(".temp_b3");
            temp.insertAdjacentText("afterend", item["Titulo"]);
            temp = result_div.querySelector(".temp_b4");
            temp.insertAdjacentText("afterend", ((item["FechaLimite"] === null) ? "No aplica" : format_date(fechaLimite)));
            temp = result_div.querySelector(".temp_b5");
            temp.insertAdjacentText("afterbegin", ((item["NoControl"] === null) ? "No. Tarjeta: " : "No. Control: "));
            temp.insertAdjacentText("afterend", ((item["NoControl"] === null) ? item["NoTarjeta"] : item["NoControl"]));
            temp = result_div.querySelector(".temp_b6");
            temp.insertAdjacentText("afterend", item["Nombre"]);
            temp = result_div.querySelector(".temp_button");
            temp.IDPrestamo = item["IDPrestamo"];
            temp.addEventListener("click", function (){
                window.location.href = "loan_view?id=" + this.IDPrestamo;
            });
            result.appendChild(result_div);
        };
    }
    let pages = document.getElementById("pages_available");
    pages.innerHTML = "";
    pages.appendChild(document.createTextNode("Página " + prestamos_page + " de " + prestamos_max_page));
}

function clear_data(){
    document.getElementById("numero").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("apeP").value = "";
    document.getElementById("apeM").value = "";
    document.getElementById("folio").value = "";
    document.getElementById("titulo").value = "";
    document.getElementById("isbn").value = "";
    document.getElementById("autores").value = "";
    document.getElementById("disponible").value = "";
    document.getElementById("FechaEntregaInicio").value = "";
    document.getElementById("FechaLimiteInicio").value = "";
    document.getElementById("FechaDevolucionInicio").value = "";
    document.getElementById("FechaEntregaFinal").value = "";
    document.getElementById("FechaLimiteFinal").value = "";
    document.getElementById("FechaDevolucionFinal").value = "";

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
        }else if (data.status === "user-cant"){
            document.getElementById("container_overlay").innerHTML = `<h1>Prestamos insuficientes</h1>
                <p>El usuario que ingreso, no tiene prestamos disponibles para llevarse el libro ya que ya se llevo otros 3 libros, solicite que devuelva algún libro que se haya llevado o si ya lo hizo, busquelo y resuelvalo.</p>
                <button type="cancel" onclick="return close_window()">Cerrar</button>`;
        }else if (data.status === "book-ran-out"){
            document.getElementById("container_overlay").innerHTML = `<h1>Titulo no disponible</h1>
                <p>No hay ejemplares disponibles para prestar este titulo.</p>
                <p>Si crees que es un error, verifique el titulo en cuestión para gestionar los ejemplares que se encuentran registrados en el sistema y verifique que se hayan marcado como devuelto los prestamos adecuadamente.</p>
                <button type="cancel" onclick="return close_window()">Cerrar</button>`;
        }else if (data.status === "book-unavailable"){
            document.getElementById("container_overlay").innerHTML = `<h1>Titulo reservado</h1>
                <p>El titulo solicitado esta en estado de reservado, por lo cual el préstamo no puede ser efectuado.</p>
                <p>Revise las reservaciones hechas y de ser necesario, cancelé las reservaciones como sea necesario para permitir la disponibilidad de este título.</p>
                <button type="cancel" onclick="return close_window()">Cerrar</button>`;
        }else if (data.status === "duplicate-entry"){
            document.getElementById("container_overlay").innerHTML = `<h1>Entrada duplicada</h1>
                <p>El dato que intentaste registrar ya se encuentra registrado, si por alguna razón no lo puede visualizar intente refrescar la página.</p>
                <button type="cancel" onclick="return close_window()">Cerrar</button>`;
        }else if (data.status === "success"){
            let container = document.getElementById("container_overlay");
            container.innerHTML = text;
            Object.keys(replacements).forEach((item) => {
                let temp = container.querySelector("." + item);
                temp.appendChild(document.createTextNode(replacements[item]));
            });
        }else if (data.status === "error"){
            let container = document.getElementById("container_overlay");
            container.innerHTML = `<h1>Error del servidor</h1>
                <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
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

function open_overlayed_window(){
    overlay = document.createElement("div");
    overlay.setAttribute("id", "overlayed_window");
    overlay.setAttribute("class", "overlayed_window");
    overlay.innerHTML = "<div id='container_overlay' class='container_overlay'></div>";
    document.body.appendChild(overlay);
}

document.addEventListener("DOMContentLoaded", () => {
    loan_data = [];

    document.getElementById("loan_form").onsubmit = form_prevent;
    document.getElementById("student").addEventListener('change', function() {
        document.getElementById("number_div").innerHTML = `<label for="numero">No. de control: </label>
            <input type="number" style="width: 44%;" id="numero" name="numero" placeholder="########...">`;
    });
    document.getElementById("teacher").addEventListener('change', function() {
        document.getElementById("number_div").innerHTML = `<label for="numero">No. de tarjeta: </label>
            <input type="number" style="width: 46%;" id="numero" name="numero" placeholder="########...">`;
    });
    document.getElementById("FechaEntregaInicio").addEventListener('change', function() {
        document.getElementById("FechaEntregaFinal").min = document.getElementById("FechaEntregaInicio").value;
    });
    document.getElementById("FechaEntregaFinal").addEventListener('change', function() {
        document.getElementById("FechaEntregaInicio").max = document.getElementById("FechaEntregaFinal").value;
    });
    document.getElementById("FechaLimiteInicio").addEventListener('change', function() {
        document.getElementById("FechaLimiteFinal").min = document.getElementById("FechaLimiteInicio").value;
    });
    document.getElementById("FechaLimiteFinal").addEventListener('change', function() {
        document.getElementById("FechaLimiteInicio").max = document.getElementById("FechaLimiteFinal").value;
    });
    document.getElementById("FechaDevolucionInicio").addEventListener('change', function() {
        document.getElementById("FechaDevolucionFinal").min = document.getElementById("FechaDevolucionInicio").value;
    });
    document.getElementById("FechaDevolucionFinal").addEventListener('change', function() {
        document.getElementById("FechaDevolucionInicio").max = document.getElementById("FechaDevolucionFinal").value;
    });
});