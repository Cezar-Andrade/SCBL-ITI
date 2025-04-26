function form_prevent(e){
    e.preventDefault();
}

function open_editorial(){
    open_overlayed_window();
    document.getElementById("container_overlay").innerHTML = `<h1>Registrar editorial</h1>
        <form method="POST" id="editorial_form">
            <div class="vertical_spacing">
                <label for="editorial_name">Nombre:</label>
                <input type="text" style="width:70%;" id="editorial_name" name="editorial_name" placeholder="Nombre..." required>
            </div>
            <div class="vertical_spacing">
                <label for="editorial_location">Ubicación de la editorial:</label>
            </div>
            <div class="vertical_spacing">
                <input type="text" autocomplete="country-name" style="width:90%;" id="editorial_location" name="editorial_location" placeholder="Ubicación (Opcional)...">
            </div>
            <div class="horizontal_alignment">
                <button type="submit" onclick="return register_editorial()">Registrar</button>
                <button type="cancel" onclick="return close_window()">Cerrar</button>
            </div>
        </form>`;
    document.getElementById("editorial_form").onsubmit = form_prevent;
}

function open_author(){
    open_overlayed_window();
    document.getElementById("container_overlay").innerHTML = `<h1>Registrar editorial</h1>
        <form method="POST" id="author_form">
            <div class="vertical_spacing">
                <label for="author_name">Nombre:</label>
                <input type="text" autocomplete="given-name" style="width:70%;" id="author_name" name="author_name" placeholder="Nombre..." required>
            </div>
            <div class="vertical_spacing">
                <label for="author_AP">Apellido paterno:</label>
            </div>
            <div class="vertical_spacing">
                <input type="text" autocomplete="family-name" style="width:90%;" id="author_AP" name="author_AP" placeholder="Apellido paterno...">
            </div>
            <div class="vertical_spacing">
                <label for="author_AM">Apellido materno:</label>
            </div>
            <div class="vertical_spacing">
                <input type="text" autocomplete="family-name" style="width:90%;" id="author_AM" name="author_AM" placeholder="Apellido materno...">
            </div>
            <div class="horizontal_alignment">
                <button type="submit" onclick="return register_author()">Registrar</button>
                <button type="cancel" onclick="return close_window()">Cerrar</button>
            </div>
        </form>`;
    document.getElementById("author_form").onsubmit = form_prevent;
}

function open_delete_titles(){
    open_overlayed_window();

    checkboxes = document.getElementsByClassName("title_checkbox");
    checked = [];
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            checked.push(checkboxes[i].value);
        }
    }

    if (checked.length > 0){
        container = document.getElementById("container_overlay");
        container.innerHTML = `<h1>Borrar titulos</h1>
            <p>Esta por borrar los siguientes titulos:</p>`;
        for (let i = 0; i < checked.length; i++){
            item = book_data[checked[i]];

            const spacingDiv = document.createElement("div");
            spacingDiv.className = "vertical_spacing";
            spacingDiv.innerHTML = "<p><b class='bold_temp'></b></p>"

            let temp = spacingDiv.querySelector(".bold_temp");
            temp.appendChild(document.createTextNode(item["Titulo"] + ", " + item["Clasificacion"] + ", por " + item["Autores"] + "."));

            container.appendChild(spacingDiv);
        }
        container.innerHTML += `<p>¿Desea continuar?</p>
            <button red onclick="delete_titles()">Borrar</button>
            <button onclick="close_window()">Cerrar</button>`;
    }else{
        document.getElementById("container_overlay").innerHTML = `<h1>No ha seleccionado titulos.</h1>
        <p>Selecciona los titulos a borrar marcandolos en la casilla a la derecha de los titulos que haya buscado.</p>
        <button onclick="close_window()">Cerrar</button>`;
    }
}

function close_window(){
    overlay.remove();
    return false;
}

function register_editorial(){
    nombre = document.getElementById("editorial_name").value;

    if (nombre === ""){
        return true;
    }

    ubicacion = document.getElementById("editorial_location").value;
    if (ubicacion === ""){
        ubicacion = null;
    }

    var formData = new FormData();
    var dict = {
        "nombre": nombre,
        "ubicacion": ubicacion
    }
    formData.append("type", "editorial");
    formData.append("data", JSON.stringify(dict));

    send_query("<h1>Editorial registrado</h1><p>La editorial se registro con éxito.</p><button type='cancel' onclick='return close_window()'>Cerrar</button>", formData);
}

function register_author(){
    nombre = document.getElementById("author_name").value;
    apeP = document.getElementById("author_AP").value;
    apeM = document.getElementById("author_AM").value;

    if (nombre === ""){
        return true;
    }

    var formData = new FormData();
    formData.append("type", "author");
    formData.append("nombre", nombre);
    formData.append("apeP", apeP);
    formData.append("apeM", apeM);

    send_query("<h1>Autor registrado</h1><p>El autor se registro con éxito.</p><button type='cancel' onclick='return close_window()'>Cerrar</button>", formData);
}

function title_register(){
    titulo = document.getElementById("title");
    clasificacion_req = document.getElementById("clasification-selectized");
    autor_req = document.getElementById("author-selectized");
    idioma_req = document.getElementById("language-selectized");

    titulo.required = true;
    clasificacion_req.required = false;
    autor_req.required = false;
    idioma_req.required = false;

    titulo = titulo.value;
    clasificacion = clasification_combobox.getValue();
    autor = author_combobox.getValue();
    idioma = language_combobox.getValue();

    if (titulo === "" || clasificacion === "" || author.length <= 0 || idioma === ""){
        if (clasificacion === ""){
            clasificacion_req.required = true;
        }
        if (author.length <= 0){
            autor_req.required = true;
        }
        if (idioma === ""){
            idioma_req.required = true;
        }

        return true;
    }

    editorial = editorial_combobox.getValue();
    if (editorial === ""){
        editorial = null;
    }
    edicion = document.getElementById("edition").value;
    if (edicion === ""){
        edicion = null;
    }
    ISBN = document.getElementById("ISBN").value;
    if (ISBN === ""){
        ISBN = null;
    }
    year = document.getElementById("year").value;
    if (year === ""){
        year = null;
    }
    tome = document.getElementById("tome").value;
    if (tome === ""){
        tome = null;
    }
    tome_name = document.getElementById("tome_name").value;
    if (tome_name === ""){
        tome_name = null;
    }
    volume = document.getElementById("volume").value;
    if (volume === ""){
        volume = null;
    }
    volume_name = document.getElementById("volume_name").value;
    if (volume_name === ""){
        volume_name = null;
    }
    state = document.getElementById("state").value;

    var formData = new FormData();
    var dict = {
        "titulo": titulo,
        "editorial": editorial,
        "clasificacion": clasificacion,
        "edicion": edicion,
        "autores": autor,
        "ISBN": ISBN,
        "idioma": idioma,
        "anio": year,
        "tomo": tome,
        "tomo_nombre": tome_name,
        "volumen": volume,
        "volumen_nombre": volume_name
    };
    formData.append("type", "title");
    formData.append("data", JSON.stringify(dict));

    create_samples(state, formData);
}

function create_samples(state, formData){
    open_overlayed_window();
    editorial = document.getElementById("editor");
    autores = Array.from(document.getElementById("author").options).filter(option => option.selected).map(option => option.text);
    data = JSON.parse(formData.get("data"));

    folio = "";
    var formData2 = new FormData();
    formData2.append("type", "folio");
    fetch("../php/admin_search_queries.php", {
        method: "POST",
        body: formData2
    })
    .then(response => {
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        } else {
            return response.text().then(text => { throw new Error(text) });
        }
    })
    .then(data2 => {
        folio = JSON.parse(data2.data)[0];
        let container = document.getElementById("container_overlay");
        container.innerHTML = `<h1>Creación de ejemplares</h1>
            <div class="vertical_spacing">
                <label for="book_title">Titulo: </label>
                <input style="width:70%" id="book_title" name="book_title" disabled><br>
            </div>
            <div class="vertical_spacing">
                <label for="book_editorial">Editorial: </label>
                <input style="width:65%" id="book_editorial" name="book_editorial" disabled>
            </div>
            <div class="vertical_spacing">
                <label for="book_autores">Autores: </label>
                <input style="width:66%" id="book_autores" name="book_autores" disabled>
            </div>
            <div class="vertical_spacing">
                <label for="book_ISBN">ISBN: </label>
                <input style="width:72.5%" id="book_ISBN" name="book_ISBN" disabled>
            </div>
            <p>El titulo debe de tener minimo un ejemplar que viene siendo las copias de los libros.</p>
            <form method="POST" id="folio_form">
                <div class="vertical_spacing">
                    <table id="table_folio">
                        <tr>
                            <th style="width:35%">
                                <p style="margin:0"><b>Folio</b></p>
                            </th>
                            <th style="width:50%">
                                <p style="margin:0"><b>Estado fisico</b></p>
                            </th>
                            <th style="width:15%"></th>
                        </tr>
                        <tr>
                            <td>
                                <input type="text" autocomplete="off" style="width:80%" class="folio_temp" required>
                            </td>
                            <td>
                                <select class="book_state" placeholder="Estado físico..." required>
                                    <option value="">Selecciona una opción...</option>
                                    <option value="a">A</option>
                                    <option value="b">B</option>
                                </select>
                            </td>
                            <td>
                                <button type="cancel" red class="cross_button" onclick="return delete_folio(this)"></button>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <button type="cancel" class="plus_button" onclick="return add_folio()"></button>
                            </td>
                        </tr>
                    </table>
                </div>
                <button id="title_button" type="submit">Registrar</button>
                <button type="cancel" onclick="return close_window()">Cerrar</button>
            </form>`;
        let temp = document.getElementById("book_title");
        temp.value = data["titulo"];
        temp = document.getElementById("book_ISBN");
        temp.value = ((data["ISBN"] === null) ? "" : data["ISBN"]);
        temp = document.getElementById("book_editorial");
        temp.value = editorial.options[editorial.selectedIndex].text;
        temp = document.getElementById("book_autores");
        temp.value = autores;
        temp = container.querySelector(".folio_temp");
        temp.value = folio;

        document.getElementById("folio_form").addEventListener("submit", function(e) {
            e.preventDefault();
            register_title(formData);
        });
        new_estado_combobox = $(container.querySelector(".book_state")).selectize({
            sortField: 'text',
            normalize: true
        })[0].selectize;
        const options = estado_combobox.options;
        new_estado_combobox.clear();
        new_estado_combobox.clearOptions();
        Object.keys(options).forEach(key => {
            new_estado_combobox.addOption(options[key]);
        });
        new_estado_combobox.refreshOptions(false);
        new_estado_combobox.setValue(state);
    });
}

function add_folio(){
    const table = document.getElementById("table_folio");
    const row = table.insertRow(table.rows.length - 1);
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);

    var formData = new FormData();
    formData.append("type", "folio");
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
        folio = JSON.parse(data.data)[0];
        cell1.innerHTML = `<input type="text" class="folio_temp" autocomplete="off" style="width:80%" required>`;
        let temp = cell1.querySelector(".folio_temp");
        temp.value = folio;
    });

    cell2.innerHTML = `<select class="book_state" placeholder="Estado físico..." required>
            <option value="">Selecciona una opción...</option>
            <option value="a">A</option>
            <option value="b">B</option>
        </select>`;
    cell3.innerHTML = `<button type="cancel" red class="cross_button" onclick="return delete_folio(this)"></button>`;

    new_estado_combobox = $(cell2.querySelector(".book_state")).selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;
    const options = estado_combobox.options;
    new_estado_combobox.clear();
    new_estado_combobox.clearOptions();
    Object.keys(options).forEach(key => {
        new_estado_combobox.addOption(options[key]);
    });
    new_estado_combobox.refreshOptions(false);

    return false;
}

function delete_folio(button){
    const table = document.getElementById("table_folio");
    if (table.rows.length > 3) {
        const row = button.parentNode.parentNode;
        row.parentNode.removeChild(row);
    }
    
    return false;
}

function open_second_overlayed_window(){
    second_overlay = document.createElement("div");
    second_overlay.setAttribute("id", "second_overlayed_window");
    second_overlay.setAttribute("class", "overlayed_window");
    second_overlay.innerHTML = "<div id='second_container_overlay' class='second_container_overlay'></div>";
    document.body.appendChild(second_overlay);
}

function close_second_window(){
    second_overlay.remove();
    return false;
}

function register_title(formData){
    const table = document.getElementById("table_folio");
    const datos = [];
    const folios = [];

    for (let i = 1; i < table.rows.length - 1; i++) {
        const row = table.rows[i];
        const folio = row.cells[0].querySelector("input").value;
        const state = row.cells[1].querySelector("select").value;

        if (folio === "" || state === ""){
            return;
        }

        for (var j = 0; j < folios.length; j++){
            if (folio == folios[j]){
                open_second_overlayed_window();
                document.getElementById("second_container_overlay").innerHTML = `<h1>Folios repetidos</h1>
                    <p>En los nuevos folios que desea registrar para este titulo hay repetición, los folios no pueden repetirse entre ellos, asegurese además tambien de que estos folios no esten ya registrados en el sistema.</p>
                    <button red onclick='close_second_window()'>Cerrar</button>`;

                return;
            }
        }

        folios.push(folio);
        datos.push([folio, state]);
    }

    var dict = JSON.parse(formData.get("data"));
    dict["folios_estados"] = datos;
    formData.set("data", JSON.stringify(dict));

    var replacements = {
        "temp_b1": dict["titulo"],
        "temp_b2": folios
    }
    
    send_query("<h1>Titulo registrado</h1><p>El titulo:</p><p><b class='temp_b1'></b></p><p>Se registro con éxito con los siguientes folios:</p><p><b class='temp_b2'></b>.</p><button type='cancel' onclick='return close_window()'>Cerrar</button>", formData, replacements);
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

    today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    
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
        "estado": estado_combobox.getValue(),
        "notomo": document.getElementById("tome").value,
        "nombretomo": document.getElementById("tome_name").value,
        "novolumen": document.getElementById("volume").value,
        "nombrevolumen": document.getElementById("volume_name").value,
        "idautores": author_combobox.getValue(),
        "fecha": today.toISOString().split("T")[0]
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
    
    result = document.getElementById("result_area");
    result.innerHTML = "";
    if (book_length > 0){
        for (let i = 5*book_page - 5; i < Math.min(book_length, 5*book_page); i++){
            item = book_data[i];
            color = "";

            if (item["Ejemplares"] <= item["Prestados"] + item["Reservados"]){
                color = "background-color: #FFA8A8;";
            }else if (item["Prestados"] > 0 || item["Reservados"] > 0){
                color = "background-color: rgb(226, 227, 131);";
            }

            let result_div = document.createElement("div");
            result_div.className = "search_book_result";
            result_div.innerHTML += `<div class="search_content">
                    <p><b>Clasificacion: </b><b class="temp_b1">Titulo: </b><br>
                    <b class="temp_b2">Autores: </b></p>
                </div>
                <div class="view_button" style="justify-content: center;">
                    <button class="button_temp">Ver</button>
                </div>
                <div class="mark_box">
                    <input type='checkbox' class='title_checkbox'>
                </div>`;
            result_div.style = color;
            let temp = result_div.querySelector(".temp_b1");
            temp.insertAdjacentText("beforebegin", item["Clasificacion"] + ", ");
            temp.insertAdjacentText("afterend", item["Titulo"]);
            temp = result_div.querySelector(".temp_b2");
            temp.insertAdjacentText("afterend", item["Autores"]);
            temp = result_div.querySelector(".button_temp");
            temp.IDTitulo = item["IDTitulo"];
            temp.addEventListener("click", function(){
                window.location.href = "book_view?id=" + this.IDTitulo;
            });
            temp = result_div.querySelector(".title_checkbox");
            temp.value = i;
            result.appendChild(result_div);
        };
    }
    pages = document.getElementById("pages_available");
    pages.innerHTML = "";
    pages.appendChild(document.createTextNode("Página " + book_page + " de " + book_max_page));
}

function delete_titles(){
    document.getElementById("container_overlay").innerHTML = `<h1>Procesando...</h1>
        <p>Por favor espere...</p>`;
    
    ids = [];
    for (let i = checked.length - 1; i >= 0; i--) {
        ids.push(book_data[checked[i]]["IDTitulo"]);
    }

    var formData = new FormData();
    formData.append("type", "title");
    formData.append("ids", JSON.stringify(ids));
    
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
            titlesIds = JSON.parse(data.titlesLeft);
            titlesDeletedIds = JSON.parse(data.titlesDeleted);
            container = document.getElementById("container_overlay");
            container.innerHTML = "<h1>Resultado</h1>";
            if (titlesDeletedIds.length > 0){
                container.innerHTML += "<p>Los siguientes titulos fueron eliminados de la base de datos:</p>";
                for (let i = checked.length - 1; i >= 0; i--) {
                    deleted = false;
                    titlesDeletedIds.forEach((item) => {
                        if (!deleted && book_data[checked[i]]["IDTitulo"] === item["IDTitulo"]){
                            book_data.splice(checked[i], 1);
                            let p = document.createElement("p");
                            p.innerHTML = "<b class='temp_b'></b>";
                            let temp = p.querySelector(".temp_b");
                            temp.appendChild(document.createTextNode(item["Titulo"] + ", " + item["Clasificacion"] + ", por " + item["Autores"]));
                            container.appendChild(p);
                            deleted = true;
                        }
                    });
                }
            }
            if (titlesIds.length > 0){
                container.innerHTML += "<p>Los siguientes titulos no pudieron ser elimimnados debido a que han sido prestados y aun no han sido resueltos sus prestamos, resuelvalos en las secciones correspondientes:</p>";
                titlesIds.forEach((item) => {
                    let p = document.createElement("p");
                    p.innerHTML = "<b class='temp_b'></b>";
                    let temp = p.querySelector(".temp_b");
                    temp.appendChild(document.createTextNode(item["Titulo"] + ", " + item["Clasificacion"] + ", por " + item["Autores"]));
                    container.appendChild(p);
                });
            }
            container.innerHTML += "<button type='cancel' onclick='return close_window()'>Cerrar</button>";
            
            update_search();
        }else if (data.status === "error"){
            document.getElementById("container_overlay").innerHTML = `<h1>Error del servidor</h1>
                <p id="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button type="cancel" onclick="return close_window()">Volver</button>`;
            let temp = document.getElementById("temp_p");
            temp.appendChild(document.createTextNode(data.message));
        }
    })
    .catch(error => {document.getElementById("container_overlay").innerHTML = `<h1>Error del servidor</h1>
            <p id="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
            <button type="cancel" onclick="return close_window()">Volver</button>`;
        let temp = document.getElementById("temp_p");
        temp.appendChild(document.createTextNode(error));
    });
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
        }else if (data.status === "folios-repeated"){
            array = JSON.parse(data.message);
            document.getElementById("container_overlay").innerHTML = `<h1>Folios repetidos</h1>
                <p>Los siguientes folios ya se encuentran registrados en el sistema, use otros folios en lugar de los siguientes:</p>
                <p><b id="temp_b"></b></p>
                <button red type="cancel" onclick="return close_window()">Cerrar</button>`;
            let temp = document.getElementById("temp_b");
            temp.appendChild(document.createTextNode(array));
        }else if (data.status === "duplicate-entry"){
            document.getElementById("container_overlay").innerHTML = `<h1>Entrada duplicada</h1>
                <p>El dato que intentaste registrar ya se encuentra registrado, si por alguna razón no lo puede visualizar intente refrescar la página.</p>
                <button type="cancel" onclick="return close_window()">Cerrar</button>`;
        }else if (data.status === "success"){
            let container = document.getElementById("container_overlay")
            container.innerHTML = text;
            Object.keys(replacements).forEach((item) => {
                let temp = container.querySelector("." + item);
                temp.appendChild(document.createTextNode(replacements[item]));
            })
        }else if (data.status === "error"){
            document.getElementById("container_overlay").innerHTML = `<h1>Error del servidor</h1>
                <p id="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button type="cancel" onclick="return close_window()">Volver</button>`;
            let temp = document.getElementById("temp_p");
            temp.appendChild(document.createTextNode(data.message));
        }
    })
    .catch(error => {
        document.getElementById("container_overlay").innerHTML = `<h1>Error del servidor</h1>
            <p id="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
            <button type="cancel" onclick="return close_window()">Volver</button>`;
        let temp = document.getElementById("temp_p");
        temp.appendChild(document.createTextNode(error));
    });
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
        document.getElementById("content_div").innerHTML = "<h1 style='font-size: 34px;'>Error del Servidor</h1><p id='temp_p'>Parece que sucedio un error del lado del servidor, la siguiente información se recabo al respecto, favor de comunicarlo al Centro de Información:<br></p>";
        let temp = document.getElementById("temp_p");
        temp.appendChild(document.createTextNode(error));
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
    estado_combobox.clear();
}

function open_overlayed_window(){
    overlay = document.createElement("div");
    overlay.setAttribute("id", "overlayed_window");
    overlay.setAttribute("class", "overlayed_window");
    overlay.innerHTML = "<div id='container_overlay' class='container_overlay'></div>";
    document.body.appendChild(overlay);
}

document.addEventListener("DOMContentLoaded", () => {
    book_length = 0;
    book_page = 0;

    document.getElementById("register_author").onclick = open_author;
    document.getElementById("register_editor").onclick = open_editorial;
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
    estado_combobox = $('#state').selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;

    search_data_combobox(editorial_combobox, "editorial");
    search_data_combobox(clasification_combobox, "clasificacion");
    search_data_combobox(author_combobox, "autores");
});