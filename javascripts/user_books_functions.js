function form_prevent(e){
    e.preventDefault();
}

function close_window(){
    overlay.remove();
    return false;
}

function search_query(){
    titulo = document.getElementById("title");
    clasificacion_req = document.getElementById("clasification-selectized");
    autor_req = document.getElementById("author-selectized");
    idioma_req = document.getElementById("language-selectized");

    titulo.required = false;
    clasificacion_req.required = false;
    autor_req.required = false;
    idioma_req.required = false;
    
    var dict = {
        "editorial": editorial_combobox.getValue(),
        "lugar": document.getElementById("place").value,
        "titulo": titulo.value,
        "ISBN": document.getElementById("ISBN").value,
        "codigo": clasification_combobox.getValue(),
        "anio": document.getElementById("year").value,
        "idioma": language_combobox.getValue(),
        "edicion": document.getElementById("edition").value,
        "folio": document.getElementById("folio").value,
        "estado": null,
        "notomo": document.getElementById("tome").value,
        "nombretomo": document.getElementById("tome_name").value,
        "novolumen": document.getElementById("volume").value,
        "nombrevolumen": document.getElementById("volume_name").value,
        "idautores": author_combobox.getValue()
    };

    if (dict["ISBN"] === ""){
        dict["ISBN"] = null;
    }

    if (dict["editorial"] === ""){
        dict["editorial"] = null;
    }

    if (dict["anio"] === ""){
        dict["anio"] = null;
    }

    if (dict["edicion"] === ""){
        dict["edicion"] = null;
    }

    if (dict["notomo"] === ""){
        dict["notomo"] = null;
    }else{
        dict["notomo"] = parseInt(dict["notomo"]);
    }
    
    if (dict["novolumen"] === ""){
        dict["novolumen"] = null;
    }else{
        dict["novolumen"] = parseInt(dict["novolumen"]);
    }

    var formData = new FormData();
    formData.append("type", "titulo");
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
        book_data = JSON.parse(data.data);
        book_length = Object.keys(book_data).length;
        book_max_page = Math.ceil(book_length/5);
        book_page = Math.min(1, book_max_page);
        
        update_search();
    });
    
    return true;
}

function change_page(direction){
    if (book_page > 1 && direction < 0){
        book_page--;
    }else if(book_page < book_max_page && direction > 0){
        book_page++;
    }else{
        return;
    }
    
    update_search();
}

function update_search(){
    book_length = Object.keys(book_data).length;
    book_max_page = Math.ceil(book_length/5);
    book_page = Math.min(book_page, book_max_page);
    
    text = "";
    if (book_length > 0){
        for (let i = 5*book_page - 5; i < Math.min(book_length, 5*book_page); i++){
            item = book_data[i];
            color = "";

            if (item["YaReservado"] > 0){
                color = "style='background-color: #ABFF87;'";
            }else if (item["Ejemplares"] == item["Prestados"] + item["Reservados"]){
                color = "style='background-color: #FFA8A8;'";
            }else if (item["Prestados"] > 0 || item["Reservados"] > 0){
                color = "style='background-color: rgb(226, 227, 131);'";
            }

            text += `<div class="search_loan_result" ` + color + `>
                <div class="search_content">
                    <p><b>Clasificacion:</b> ` + item["Clasificacion"] + `, <b>Titulo:</b> ` + item["Titulo"] + `<br>
                    <b>Autores:</b> ` + item["Autores"] + `</p>
                </div>
                <div class="view_button" style="justify-content: center;">
                    <button onclick='window.location.href="book_view?id=` + item["IDTitulo"] + `"'>Ver</button>
                </div>
            </div>`;
        }
    }
    document.getElementById("result_area").innerHTML = text;
    document.getElementById("pages_available").innerHTML = "Página " + book_page + " de " + book_max_page;
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
        open_overlayed_window();
        document.getElementById("content_div").innerHTML = "<h1 style='font-size: 34px;'>Error del Servidor</h1><p>Parece que sucedio un error del lado del servidor, la siguiente información se recabo al respecto, favor de comunicarlo al Centro de Información:<br>" + error + "</p>";
    });
}

function clear_data(){
    document.getElementById("title").value = "";
    editorial_combobox.clear();
    document.getElementById("place").value = "";
    clasification_combobox.clear();
    document.getElementById("edition").value = "";
    author_combobox.clear();
    document.getElementById("folio").value = "";
    document.getElementById("ISBN").value = "";
    language_combobox.clear();
    document.getElementById("year").value = "";
    document.getElementById("tome").value = "";
    document.getElementById("tome_name").value = "";
    document.getElementById("volume").value = "";
    document.getElementById("volume_name").value = "";
}

document.addEventListener("DOMContentLoaded", () => {
    book_length = 0;
    book_page = 0;

    document.getElementById("title_form").onsubmit = form_prevent;

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
    language_combobox = $('#language').selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;

    search_data_combobox(editorial_combobox, "editorial");
    search_data_combobox(clasification_combobox, "clasificacion");
    search_data_combobox(author_combobox, "autores");
});