function form_prevent(e){
    e.preventDefault();
}

function close_window(){
    overlay.remove();
    return false;
}

function search_query(active){
    var dict = {
        "folio": document.getElementById("folio").value,
        "titulo": document.getElementById("titulo").value,
        "editorial": editorial_combobox.getValue(),
        "clasificacion": clasification_combobox.getValue(),
        "isbn": document.getElementById("ISBN").value,
        "fechaentregainicio": document.getElementById("FechaEntregaInicio").value,
        "fechalimiteinicio": document.getElementById("FechaLimiteInicio").value,
        "fechadevolucioninicio": document.getElementById("FechaDevolucionInicio").value,
        "fechaentregafinal": document.getElementById("FechaEntregaFinal").value,
        "fechalimitefinal": document.getElementById("FechaLimiteFinal").value,
        "fechadevolucionfinal": document.getElementById("FechaDevolucionFinal").value,
        "active": active
    }

    var formData = new FormData();
    formData.append("type", "prestamos user");
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

    text = "";
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
                    estado = 'style="background-color:rgb(255, 100, 100);"';
                }else{
                    estado = 'style="background-color:rgb(82, 194, 35);"';
                }
            }else if (item["FechaLimite"] !== null){
                if (item["FechaDevuelto"] !== null){
                    fechaDevolucion = new Date(item["FechaDevuelto"] + "T00:00:00");
                    if (fechaDevolucion > fechaLimite){
                        estado = 'style="background-color: #FFA8A8;"';
                    }else{
                        estado = 'style="background-color: #ABFF87;"';
                    }
                }else if (today > fechaLimite){
                    estado = 'style="background-color: #FFA8A8;"';
                }
            }
            
            text += `<div class="search_loan_result" ` + estado + `>
                <div class="search_content">
                    <p><b>Entregado:</b> ` + format_date(fechaEntregado) + `, <b>Titulo:</b> ` + item["Titulo"] + `<br>
                    <b>Limite:</b> ` + ((item["FechaLimite"] === null) ? "No aplica" : format_date(fechaLimite)) + `, <b>Folio:</b> ` + item["Folio"] + `</p>
                </div>
                <div class="view_button"style="justify-content: center;">
                    <button onclick='window.location.href="loan_view?id=` + item["IDPrestamo"] + `"'>Ver</button>
                </div>
            </div>`;
        };
    }
    document.getElementById("result_area").innerHTML = text;
    document.getElementById("pages_available").innerHTML = "Página " + prestamos_page + " de " + prestamos_max_page;
}

function clear_data(){
    document.getElementById("folio").value = "";
    document.getElementById("titulo").value = "";
    editorial_combobox.clear();
    clasification_combobox.clear();
    document.getElementById("ISBN").value = "";
    document.getElementById("FechaEntregaInicio").value = "";
    document.getElementById("FechaLimiteInicio").value = "";
    document.getElementById("FechaDevolucionInicio").value = "";
    document.getElementById("FechaEntregaFinal").value = "";
    document.getElementById("FechaLimiteFinal").value = "";
    document.getElementById("FechaDevolucionFinal").value = "";

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
        }else if (data.status === "user-cant"){
            document.getElementById("container_overlay").innerHTML = `<h1>Prestamos insuficientes</h1>
                <p>El usuario que ingreso, no tiene prestamos disponibles para llevarse el libro ya que ya se llevo otros 3 libros, solicite que devuelva algún libro que se haya llevado o si ya lo hizo, busquelo y resuelvalo.</p>
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
            document.getElementById("container_overlay").innerHTML = text + "<button type='cancel' onclick='return close_window()'>Cerrar</button>";
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

function open_overlayed_window(){
    overlay = document.createElement("div");
    overlay.setAttribute("id", "overlayed_window");
    overlay.setAttribute("class", "overlayed_window");
    overlay.innerHTML = "<div id='container_overlay' class='container_overlay'></div>";
    document.body.appendChild(overlay);
}

function search_data_combobox(combobox, type_search){
    var formData = new FormData();
    formData.append("type", type_search);

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
        if (data.status === "user-not-admin" || data.status === "user-not-authenticated"){
            window.location.href = "../index";
        }else if (data.status === "success"){
            combobox.clear();
            combobox.clearOptions();
            switch (type_search){
                case "editorial":
                    JSON.parse(data.data).forEach((item) => {
                        combobox.addOption({"value": item["IDEditorial"], "text": item["Nombre"]});
                    });
                break;
                case "autores":
                    JSON.parse(data.data).forEach((item) => {
                        combobox.addOption({"value": item["IDAutor"], "text": item["Nombre"] + " " + item["ApellidoPaterno"] + " " + item["ApellidoMaterno"]});
                    });
                break;
                case "clasificacion":
                    JSON.parse(data.data).forEach((item) => {
                        combobox.addOption({"value": item["CodigoClasificacion"], "text": item["CodigoClasificacion"] + " - " + item["Nombre"]});
                    });
                break;
            }
            combobox.refreshOptions(false);
        }
    })
    .catch(error => {document.getElementById("content_div").innerHTML = "<h1 style='font-size: 34px;'>Error del Servidor</h1><p>Parece que sucedio un error del lado del servidor, la siguiente información se recabo al respecto, favor de comunicarlo al Centro de Información:<br>" + error + "</p>";});
}

document.addEventListener("DOMContentLoaded", () => {
    loan_data = [];

    document.getElementById("loan_form").onsubmit = form_prevent;
    editorial_combobox = $('#editor').selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;
    clasification_combobox = $('#clasification').selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;
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

    search_data_combobox(editorial_combobox, "editorial");
    search_data_combobox(clasification_combobox, "clasificacion");
});