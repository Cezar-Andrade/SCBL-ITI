function form_prevent(e){
    e.preventDefault();
}

function close_window(){
    overlay.remove();
    return false;
}

function search_query(){
    var dict = {
        "IDReservacion": document.getElementById("reservation").value,
        "numero": document.getElementById("numero").value,
        "estudiante": document.getElementById("student").checked,
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
    formData.append("type", "reservaciones");
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

    let result = document.getElementById("result_area");
    result.innerHTML = "";
    if (reservaciones_length > 0){
        for (let i = 5*reservaciones_page - 5; i < Math.min(reservaciones_length, 5*reservaciones_page); i++){
            item = reservaciones_data[i];
            fechaRealizada = new Date(item["FechaRealizada"] + "T00:00:00");
            fechaExpiracion = new Date(item["FechaExpiracion"] + "T23:59:59");
            today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
            estado = "";
            
            if (today > fechaExpiracion){
                estado = "background-color: #FFA8A8";
            }

            let result_div = document.createElement("div");
            result_div.className = "search_loan_result";
            result_div.style = estado;
            result_div.innerHTML = `<div class="search_content">
                    <p><b class="temp_b1"></b>, <b class="temp_b3">Reservado: </b>, <b class="temp_b2">ISBN: </b><br>
                    <b class="temp_b4">Nombre: </b>, <b class="temp_b5">Titulo: </b></p>
                </div>
                <div class="view_button"style="justify-content: center;">
                    <button class="temp_button">Ver</button>
                </div>`;
            let temp = result_div.querySelector(".temp_b1");
            temp.textContent = ((item["NoControl"] === null) ? "No. Tarjeta: " : "No. Control: ");
            temp.insertAdjacentText("afterend", ((item["NoControl"] === null) ? item["NoTarjeta"] : item["NoControl"]));
            temp = result_div.querySelector(".temp_b2");
            temp.insertAdjacentText("afterend", ((item["ISBN"] === null) ? "No tiene" : item["ISBN"]));
            temp = result_div.querySelector(".temp_b3");
            temp.insertAdjacentText("afterend", format_date(fechaRealizada));
            temp = result_div.querySelector(".temp_b4");
            temp.insertAdjacentText("afterend", item["Nombre"]);
            temp = result_div.querySelector(".temp_b5");
            temp.insertAdjacentText("afterend", item["Titulo"]);
            temp = result_div.querySelector(".temp_button");
            temp.IDReservacion = item["IDReservacion"];
            temp.addEventListener("click", function (){
                window.location.href = "reservation_view?id=" + this.IDReservacion;
            });
            result.appendChild(result_div);
        };
    }
    let pages = document.getElementById("pages_available");
    pages.textContent = "Página " + reservaciones_page + " de " + reservaciones_max_page;
}

function clear_data(){
    document.getElementById("reservation").value = "";
    document.getElementById("numero").value = "";
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
    .catch(error => {
        let container = document.getElementById("content_div");
        container.innerHTML = "<h1 style='font-size: 34px;'>Error del Servidor</h1><p class='temp_p'>Parece que sucedio un error del lado del servidor, la siguiente información se recabo al respecto, favor de comunicarlo al Centro de Información:<br></p>";
        let temp = container.querySelector(".temp_p");
        temp.appendChild(document.createTextNode(error));
    });
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
    document.getElementById("student").addEventListener('change', function() {
        document.getElementById("number_div").innerHTML = `<label for="numero">No. de control: </label>
            <input type="number" style="width: 47%" id="numero" name="numero" placeholder="########...">`;
    });
    document.getElementById("teacher").addEventListener('change', function() {
        document.getElementById("number_div").innerHTML = `<label for="numero">No. de tarjeta: </label>
            <input type="number" style="width: 49%;" id="numero" name="numero" placeholder="########...">`;
    });
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