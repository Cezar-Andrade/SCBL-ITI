function form_prevent(e){
    e.preventDefault();
}

function close_window(){
    overlay.remove();
    return false;
}

function search_query(){
    var dict = {
        "numero": document.getElementById("numero").value,
        "estudiante": document.getElementById("student").checked,
        "folio": document.getElementById("folio").value,
        "sancion": sancion_combobox.getValue(),
        "fechaentregainicio": document.getElementById("FechaEntregaInicio").value,
        "fechamultainicio": document.getElementById("FechaMultaInicio").value,
        "fechadevolucioninicio": document.getElementById("FechaDevolucionInicio").value,
        "fechaentregafinal": document.getElementById("FechaEntregaFinal").value,
        "fechamultafinal": document.getElementById("FechaMultaFinal").value,
        "fechadevolucionfinal": document.getElementById("FechaDevolucionFinal").value
    }

    var formData = new FormData();
    formData.append("type", "multas");
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

    result = document.getElementById("result_area");
    result.innerHTML = "";
    if (prestamos_length > 0){
        for (let i = 5*prestamos_page - 5; i < Math.min(prestamos_length, 5*prestamos_page); i++){
            item = prestamos_data[i];
            fechaMulta = new Date(item["FechaMulta"] + "T00:00:00");
            estado = "";

            if (item["DeudaSaldada"] == 0){
                estado = "background-color: #FFA8A8;";
            }

            let result_div = document.createElement("div");
            result_div.className = "search_loan_result";
            result_div.innerHTML += `<div class="search_content">
                    <p><b class="temp_b1"></b>, <b class="temp_b2">Folio: </b>, <b class="temp_b3">Fecha multa: </b><br>
                    <b class="temp_b4">Nombre: </b>, <b class="temp_b5">Titulo: </b></p>
                </div>
                <div class="view_button"style="justify-content: center;">
                    <button class="button_temp">Ver</button>
                </div>`;
            result_div.style = estado;
            let temp = result_div.querySelector(".temp_b1");
            temp.insertAdjacentText("afterbegin", ((item["NoControl"] === null) ? "No. Tarjeta: " : "No. Control: "));
            temp.insertAdjacentText("afterend", ((item["NoControl"] === null) ? item["NoTarjeta"] : item["NoControl"]));
            temp = result_div.querySelector(".temp_b2");
            temp.removeAttribute("id");
            temp.insertAdjacentText("afterend", item["Folio"]);
            temp = result_div.querySelector(".temp_b3");
            temp.removeAttribute("id");
            temp.insertAdjacentText("afterend", format_date(fechaMulta));
            temp = result_div.querySelector(".temp_b4");
            temp.removeAttribute("id");
            temp.insertAdjacentText("afterend", item["Nombre"]);
            temp = result_div.querySelector(".temp_b5");
            temp.removeAttribute("id");
            temp.insertAdjacentText("afterend", item["Titulo"]);
            temp = result_div.querySelector(".button_temp");
            temp.removeAttribute("id");
            temp.IDPrestamo = item["IDPrestamo"];
            temp.addEventListener("click", function(){
                window.location.href = "fine_view?id=" + this.IDPrestamo;
            });
            result.appendChild(result_div);
        };
    }
    pages = document.getElementById("pages_available");
    pages.innerHTML = "";
    pages.appendChild(document.createTextNode("Página " + prestamos_page + " de " + prestamos_max_page));
}

function clear_data(){
    document.getElementById("numero").value = "";
    document.getElementById("folio").value = "";
    sancion_combobox.clear();
    document.getElementById("FechaEntregaInicio").value = "";
    document.getElementById("FechaMultaInicio").value = "";
    document.getElementById("FechaDevolucionInicio").value = "";
    document.getElementById("FechaEntregaFinal").value = "";
    document.getElementById("FechaMultaFinal").value = "";
    document.getElementById("FechaDevolucionFinal").value = "";

    return false;
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

    document.getElementById("fine_form").onsubmit = form_prevent;
    sancion_combobox = $('#sancion').selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;
    document.getElementById("student").addEventListener('change', function() {
        document.getElementById("book_leftside number_div").innerHTML = `<label for="numero">No. de control: </label>
            <input type="number" style="width: 47%" id="numero" name="numero" placeholder="########...">`;
    });
    document.getElementById("teacher").addEventListener('change', function() {
        document.getElementById("book_leftside number_div").innerHTML = `<label for="numero">No. de tarjeta: </label>
            <input type="number" style="width: 49%;" id="numero" name="numero" placeholder="########...">`;
    });
    document.getElementById("FechaMultaInicio").addEventListener('change', function() {
        document.getElementById("FechaMultaFinal").min = document.getElementById("FechaMultaInicio").value;
    });
    document.getElementById("FechaMultaFinal").addEventListener('change', function() {
        document.getElementById("FechaMultaInicio").max = document.getElementById("FechaMultaFinal").value;
    });
    document.getElementById("FechaEntregaInicio").addEventListener('change', function() {
        document.getElementById("FechaEntregaFinal").min = document.getElementById("FechaEntregaInicio").value;
    });
    document.getElementById("FechaEntregaFinal").addEventListener('change', function() {
        document.getElementById("FechaEntregaInicio").max = document.getElementById("FechaEntregaFinal").value;
    });
    document.getElementById("FechaDevolucionInicio").addEventListener('change', function() {
        document.getElementById("FechaDevolucionFinal").min = document.getElementById("FechaDevolucionInicio").value;
    });
    document.getElementById("FechaDevolucionFinal").addEventListener('change', function() {
        document.getElementById("FechaDevolucionInicio").max = document.getElementById("FechaDevolucionFinal").value;
    });
});