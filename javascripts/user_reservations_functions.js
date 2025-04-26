function form_prevent(e){
    e.preventDefault();
}

function search_query(){
    var dict = {
        "IDReservacion": document.getElementById("reservation").value,
        "titulo": document.getElementById("titulo").value,
        "editorial": editorial_combobox.getValue(),
        "clasificacion": clasification_combobox.getValue(),
        "idautores": author_combobox.getValue(),
        "fechareservadoinicio": document.getElementById("FechaReservadoInicio").value,
        "fechaexpiracioninicio": document.getElementById("FechaExpiracionInicio").value,
        "fechareservadofinal": document.getElementById("FechaReservadoFinal").value,
        "fechaexpiracionfinal": document.getElementById("FechaExpiracionFinal").value
    }

    var formData = new FormData();
    formData.append("type", "reservaciones user");
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
        reservaciones_data = JSON.parse(data.data);
        reservaciones_length = Object.keys(reservaciones_data).length;
        reservaciones_max_page = Math.ceil(reservaciones_length/5);
        reservaciones_page = Math.min(1, reservaciones_max_page);
        
        update_search();
    });
    
    return true;
}

function change_page(direction){
    if (reservaciones_page > 1 && direction < 0){
        reservaciones_page--;
    }else if(reservaciones_page < reservaciones_max_page && direction > 0){
        reservaciones_page++;
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
    reservaciones_length = Object.keys(reservaciones_data).length;
    reservaciones_max_page = Math.ceil(reservaciones_length/5);
    reservaciones_page = Math.min(reservaciones_page, reservaciones_max_page);

    text = "";
    if (reservaciones_length > 0){
        for (let i = 5*reservaciones_page - 5; i < Math.min(reservaciones_length, 5*reservaciones_page); i++){
            item = reservaciones_data[i];
            fechaRealizada = new Date(item["FechaRealizada"] + "T00:00:00");
            fechaExpiracion = new Date(item["FechaExpiracion"] + "T23:59:59");
            today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
            estado = "";
            
            if (today > fechaExpiracion){
                estado = 'style="background-color: #FFA8A8;"';
            }

            text += `<div class="search_loan_result" ` + estado + `">
                <div class="search_content">
                    <p><b>Titulo:</b> ` + item["Titulo"] + `<br>
                    <b>ISBN:</b> ` + ((item["ISBN"] === null) ? "No tiene" : item["ISBN"]) + `, <b>Reservado:</b> ` + format_date(fechaRealizada) + `, <b>Expiración:</b> ` + format_date(fechaExpiracion) + `</p>
                </div>
                <div class="view_button"style="justify-content: center;">
                    <button onclick='window.location.href="reservation_view?id=` + item["IDReservacion"] + `"'>Ver</button>
                </div>
            </div>`;
        };
    }
    document.getElementById("result_area").innerHTML = text;
    document.getElementById("pages_available").innerHTML = "Página " + reservaciones_page + " de " + reservaciones_max_page;
}

function clear_data(){
    document.getElementById("reservation").value = "";
    document.getElementById("ISBN").value = "";
    document.getElementById("titulo").value = "";
    editorial_combobox.clear();
    clasification_combobox.clear();
    author_combobox.clear();
    document.getElementById("FechaReservadoInicio").value = "";
    document.getElementById("FechaExpiracionInicio").value = "";
    document.getElementById("FechaReservadoFinal").value = "";
    document.getElementById("FechaExpiracionFinal").value = "";

    return false;
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

    document.getElementById("reservation_form").onsubmit = form_prevent;
    editorial_combobox = $('#editor').selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;
    clasification_combobox = $('#clasification').selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;
    author_combobox = $('#author').selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;
    document.getElementById("FechaReservadoInicio").addEventListener('change', function() {
        document.getElementById("FechaReservadoFinal").min = document.getElementById("FechaReservadoInicio").value;
    });
    document.getElementById("FechaReservadoFinal").addEventListener('change', function() {
        document.getElementById("FechaReservadoInicio").max = document.getElementById("FechaReservadoFinal").value;
    });
    document.getElementById("FechaExpiracionInicio").addEventListener('change', function() {
        document.getElementById("FechaExpiracionFinal").min = document.getElementById("FechaExpiracionInicio").value;
    });
    document.getElementById("FechaExpiracionFinal").addEventListener('change', function() {
        document.getElementById("FechaExpiracionInicio").max = document.getElementById("FechaExpiracionFinal").value;
    });

    search_data_combobox(editorial_combobox, "editorial");
    search_data_combobox(clasification_combobox, "clasificacion");
    search_data_combobox(author_combobox, "autores");
});