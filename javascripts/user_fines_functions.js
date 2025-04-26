function form_prevent(e){
    e.preventDefault();
}

function search_query(){
    var dict = {
        "titulo": document.getElementById("titulo").value,
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
    formData.append("type", "multas user");
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
            fechaMulta = new Date(item["FechaMulta"] + "T00:00:00");
            fechaPrestamo = new Date(item["FechaEntregado"] + "T00:00:00");
            estado = "";

            if (item["DeudaSaldada"] == 0){
                estado = 'style="background-color: #FFA8A8;"';
            }

            text += `<div class="search_loan_result" ` + estado + `>
                <div class="search_content">
                    <p><b>Fecha prestamo:</b> ` + format_date(fechaPrestamo) + `, <b>Titulo:</b> ` + item["Titulo"] + `<br>
                    <b>Fecha multa:</b> ` + format_date(fechaMulta) + `, <b>Folio:</b> ` + item["Folio"] + `, <b>Sanción:</b> ` + item["Sancion"] + `</p>
                </div>
                <div class="view_button"style="justify-content: center;">
                    <button onclick='window.location.href="fine_view?id=` + item["IDPrestamo"] + `"'>Ver</button>
                </div>
            </div>`;
        };
    }
    document.getElementById("result_area").innerHTML = text;
    document.getElementById("pages_available").innerHTML = "Página " + prestamos_page + " de " + prestamos_max_page;
}

function clear_data(){
    document.getElementById("titulo").value = "";
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

document.addEventListener("DOMContentLoaded", () => {
    loan_data = [];

    document.getElementById("fine_form").onsubmit = form_prevent;
    sancion_combobox = $('#sancion').selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;
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