function form_prevent(e){
    e.preventDefault();
}

function open_title(){
    titulo = document.getElementById("title");
    autor_req = document.getElementById("author-selectized");
    idioma_req = document.getElementById("language-selectized");

    titulo.required = false;
    autor_req.required = false;
    idioma_req.required = false;

    open_overlayed_window();
    let container = document.getElementById("container_overlay");
    container.style = "width:65%;"
    container.innerHTML = `<h1>Registrar título</h1>
        <form method="POST" id="title_register_form">
            <div id="book_leftside" class="book_leftside">
                <div class="vertical_spacing">
                    <label for="title">Título: </label>
                    <input type="text" style="width: 73%;" id="title2" name="title" placeholder="Título...">
                </div>
                <div class="vertical_spacing">
                    <label for="editor">Editorial:</label>
                    <div style="display:inline-block; width: 69%;">
                        <select id="editor2" placeholder="Editor...">
                            <option value="">Selecciona una opción...</option>
                            <option value="a">A</option>
                            <option value="b">B</option>
                        </select>
                    </div>
                </div>
                <div class="vertical_spacing">
                    <label for="clasification">Clasificación:</label>
                    <input type="text" style="width: 52%;" id="clasification2" name="clasification" placeholder="Clasificación...">
                </div>
                <div class="vertical_spacing">
                    <label for="edition">Edición: </label>
                    <input type="text" style="width: 69%;" id="edition2" name="edition" placeholder="Edición...">
                </div>
                <div class="vertical_spacing">
                    <label for="author">Autores:</label>
                    <div style="display:inline-block; width: 70.5%;">
                        <select id="author2" placeholder="Autores..." multiple>
                            <option value="a">A</option>
                            <option value="b">B</option>
                        </select>
                    </div>
                </div>
            </div>
            <div id="book_rightside" class="book_rightside">
                <div class="vertical_spacing">
                    <label for="ISBN">ISBN: </label>
                    <input type="text" style="width: 75%;" id="ISBN2" name="ISBN" placeholder="###-###-###...">
                </div>
                <div class="vertical_spacing">
                    <label for="language">Idioma:</label>
                    <div style="display:inline-block; width: 70.5%;">
                        <select id="language2" placeholder="Idioma...">
                            <option value="">Selecciona una opción...</option>
                            <option value="Español">Español</option>
                            <option value="Inglés">Inglés</option>
                        </select>
                    </div>
                </div>
                <div class="vertical_spacing">
                    <label for="year">Año de publicación: </label>
                    <input type="number" style="width: 31%;" min="1" id="year2" name="year" placeholder="####...">
                </div>
                <div class="vertical_spacing">
                    <label for="tome">Tomo: </label>
                    <input type="number" style="width: 15%;" min="1" id="tome2" name="tome" placeholder="##...">
                    <label for="tome_name"> : </label>
                    <input type="text" style="width: 48.5%;" id="tome_name2" name="tome_name" placeholder="Nombre del tomo...">
                </div>
                <div class="vertical_spacing">
                    <label for="volume">Volumen: </label>
                    <input type="number" style="width: 15%;" min="1" id="volume2" name="volume" placeholder="##...">
                    <label for="volume_name"> : </label>
                    <input type="text" style="width: 39.5%;" id="volume_name2" name="volume_name" placeholder="Nombre del volumen...">
                </div>
            </div>
            <div class="horizontal_alignment">
                <button type="submit" onclick="return title_register()">Registrar</button></a>
                <button type="cancel" onclick="return close_window()">Cancelar</button></a>
            </div>
        </form>`;
    document.getElementById("title_register_form").onsubmit = form_prevent;

    editorial_combobox2 = $('#editor2').selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;
    author_combobox2 = $('#author2').selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;
    language_combobox2 = $('#language2').selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;

    search_data_combobox(editorial_combobox2, "editorial", false);
    search_data_combobox(author_combobox2, "autores", false);
}

function open_editorial(){
    titulo = document.getElementById("title");
    autor_req = document.getElementById("author-selectized");
    idioma_req = document.getElementById("language-selectized");

    titulo.required = false;
    autor_req.required = false;
    idioma_req.required = false;

    open_overlayed_window();
    let container = document.getElementById("container_overlay");
    container.style="top:0%";
    container.innerHTML = `<h1>Registrar editorial</h1>
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
            <p>La tabla se actualiza con el campo de arriba para buscar.</p>
            <div class="vertical_spacing result_table" style="background-color: white; width: 100%">
                <table class="table_editorial">
                    <tr>
                        <th style="width: 60%">
                            <p style="margin: 0.1vw 0">Editorial:</p>
                        </th>
                        <th style="width: 30%">
                            <p style="margin: 0.1vw 0">Ubicación:</p>
                        </th>
                        <th style="width: 10%">
                        </th>
                    </tr>
                </table>
            </div>
            <div class="horizontal_alignment" style="bottom:0%">
                <button style="margin: 1vw 0; padding: 0.5vw" type="submit" onclick="return register_editorial()">Registrar</button>
                <button style="margin: 1vw 0; padding: 0.5vw" type="cancel" onclick="return modify_editorial()">Modificar<br>Selección</button>
                <button red style="margin: 1vw 0; padding: 0.5vw" type="cancel" onclick="return delete_editorial()">Borrar<br>Selección</button>
                <button style="margin: 1vw 0; padding: 0.5vw" type="cancel" onclick="return close_window()">Cerrar</button>
            </div>
        </form>`;
    table = container.querySelector(".table_editorial");
    document.getElementById("editorial_form").onsubmit = form_prevent;
    document.getElementById("editorial_name").addEventListener("input", function(){
        update_editorial_search(document.getElementById("editorial_name").value, document.getElementById("editorial_location").value);
    })
    document.getElementById("editorial_location").addEventListener("input", function(){
        update_editorial_search(document.getElementById("editorial_name").value, document.getElementById("editorial_location").value);
    })

    update_editorial_search();
}

function open_author(){
    titulo = document.getElementById("title");
    autor_req = document.getElementById("author-selectized");
    idioma_req = document.getElementById("language-selectized");

    titulo.required = false;
    autor_req.required = false;
    idioma_req.required = false;

    open_overlayed_window();
    let container = document.getElementById("container_overlay");
    container.innerHTML = `<h1>Registrar autor</h1>
        <form method="POST" id="author_form">
            <div class="vertical_spacing">
                <label for="author_name">Nombre:</label>
                <input type="text" autocomplete="given-name" style="width:70%;" id="author_name" name="author_name" placeholder="Nombre...">
            </div>
            <p>La tabla se actualiza con el campo de arriba para buscar.</p>
            <div class="vertical_spacing result_table" style="background-color: white; width: 100%">
                <table class="table_author">
                    <tr>
                        <th style="width: 90%">
                            <p style="margin: 0.1vw 0">Autor:</p>
                        </th>
                        <th style="width: 10%">
                        </th>
                    </tr>
                </table>
            </div>
            <div class="horizontal_alignment" style="margin: 0">
                <button style="margin: 1vw 0; padding: 0.5vw" type="submit" onclick="return register_author()">Registrar</button>
                <button style="margin: 1vw 0; padding: 0.5vw" type="submit" onclick="return modify_author()">Modificar<br>Selección</button>
                <button red style="margin: 1vw 0; padding: 0.5vw" type="submit" onclick="return delete_author()">Borrar<br>Selección</button>
                <button style="margin: 1vw 0; padding: 0.5vw" type="cancel" onclick="return close_window()">Cerrar</button>
            </div>
        </form>`;
    table = container.querySelector(".table_author");
    document.getElementById("author_form").onsubmit = form_prevent;
    document.getElementById("author_name").addEventListener("input", function(){
        update_autores_search(document.getElementById("author_name").value);
    })

    update_autores_search();
}

function update_editorial_search(filter="", filter2=""){
    var formData = new FormData();
    formData.append("type", "editorial_filtrado");
    formData.append("filter", filter);
    formData.append("filter2", filter2);

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
        clear_table();

        editorial_data = JSON.parse(data.data);
        editorial_length = Object.keys(editorial_data).length;
        
        for (var i=0; i<editorial_length; i++){
            item = editorial_data[i];
            row = table.insertRow(table.rows.length);
            row.IDEditorial = item["IDEditorial"];

            cell1 = row.insertCell(0);
            cell2 = row.insertCell(1);
            cell3 = row.insertCell(2);

            cell1.innerHTML = "<p style='margin: 0.1vw 0' class='temp_p1'></p>";
            cell2.innerHTML = "<p style='margin: 0.1vw 0' class='temp_p2'></p>";
            cell3.innerHTML = "<input type='checkbox' class='book_checkbox'>";
            let temp = cell1.querySelector(".temp_p1");
            temp.appendChild(document.createTextNode(item["Nombre"]));
            temp = cell2.querySelector(".temp_p2");
            temp.appendChild(document.createTextNode((item["Ubicacion"] === null) ? "---" : item["Ubicacion"]));
            temp = cell3.querySelector(".book_checkbox");
            temp.number = i;
        }
    });

    search_data_combobox(editorial_combobox, "editorial");
}

function modify_editorial(){
    open_second_overlayed_window();
    let container = document.getElementById("second_container_overlay");

    checkboxes = document.getElementsByClassName("book_checkbox");
    checked = [];
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            checked.push(checkboxes[i].number);
        }
    }

    if (checked.length <= 0){
        container.innerHTML = `<h1>Selecciona editoriales</h1>
            <p>Ningun editorial ha sido seleccionado, seleccione al menos uno para realizar esta operación.</p>
            <button red style="margin: 1vw 0; padding: 0.5vw" type="cancel" onclick="return close_second_window()">Cancelar</button>`;
    }else{
        container.innerHTML = `<h1>Modificar editoriales</h1>
            <form method="POST" id="editorial_edit_form">
                <table class="table_editorial" style="width: 100%">
                    <tr>
                        <th style="width: 70%">
                            <p style="margin: 0.1vw 0">Editorial:</p>
                        </th>
                        <th style="width: 30%">
                            <p style="margin: 0.1vw 0">Ubicación:</p>
                        </th>
                    </tr>
                </table>
                <div class="horizontal_alignment" style="margin: 0">
                    <button yellow style="margin: 1vw 0; padding: 0.5vw" type="submit" onclick="return guardar_editorial()">Guardar Cambios</button>
                    <button red style="margin: 1vw 0; padding: 0.5vw" type="cancel" onclick="return close_second_window()">Cancelar</button>
                </div>
            </form>`;
        document.getElementById("editorial_edit_form").onsubmit = form_prevent;
        table2 = container.querySelector(".table_editorial");
        for (let i = 0; i < checked.length; i++) {
            item = editorial_data[checked[i]];
            row = table2.insertRow(table2.rows.length);
            row.IDEditorial = item["IDEditorial"];

            cell1 = row.insertCell(0);
            cell2 = row.insertCell(1);

            cell1.innerHTML = "<input type='text' style='width: 90%' class='textbox' required>";
            cell2.innerHTML = "<input type='text' style='width: 90%' class='textbox2'>";
            let temp = cell1.querySelector(".textbox")
            temp.value = item["Nombre"];
            temp.placeholder = item["Nombre"];
            temp = cell2.querySelector(".textbox2")
            temp.value = ((item["Ubicacion"] === null) ? "" : item["Ubicacion"]);
            temp.placeholder = ((item["Ubicacion"] === null) ? "" : item["Ubicacion"]);
        }
    }

    return false;
}

function guardar_editorial(){
    ids = [];
    names = [];
    places = [];
    for (let i = 1; i < table2.rows.length; i++) {
        row = table2.rows[i];
        namee = row.querySelector(".textbox").value;
        place = row.querySelector(".textbox2").value;

        if (namee === ""){
            return true;
        }

        ids.push(row.IDEditorial);
        names.push(namee);
        places.push((place === "") ? null : place);
    }
    
    if (confirm("ACTUALIZANDO EDITORIALES\n\nEstas por actualizar los editoriales a continuación.\n¿Desea continuar?")){
        var formData = new FormData();
        formData.append("type", "update editoriales");
        formData.append("ids", JSON.stringify(ids));
        formData.append("names", JSON.stringify(names));
        formData.append("places", JSON.stringify(places));
        
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
                document.getElementById("second_container_overlay").innerHTML = `<h1>Usuario no autenticado</h1>
                    <p>El usuario no ha iniciado sesión, solo el usuario administrador autenticado puede hacer estas operaciones.</p>
                    <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
            }else if (data.status === "user-not-admin"){
                document.getElementById("second_container_overlay").innerHTML = `<h1>Usuario no administrador</h1>
                    <p>El usuario con el que esta iniciado la sesión no tiene privilegios de administrador, por ende no puede realizar las siguientes acciones.</p>
                    <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
            }else if (data.status === "success"){
                document.getElementById("second_container_overlay").innerHTML = `<h1>Editoriales actualizados</h1>
                    <p>Los editoriales seleccionados han sido actualizados.</p>
                    <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
                update_editorial_search(document.getElementById("editorial_name").value, document.getElementById("editorial_location").value);
                search_data_combobox(editorial_combobox, "editorial");
            }else if (data.status === "error"){
                let container = document.getElementById("second_container_overlay");
                container.innerHTML = `<h1>Error del servidor</h1>
                    <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                    <button red type="cancel" onclick="return close_second_window()">Volver</button>`;
                container.querySelector(".temp_p").appendChild(document.createTextNode(data.message));
            }
        })
        .catch(error => {
            let container = document.getElementById("second_container_overlay");
            container.innerHTML = `<h1>Error del servidor</h1>
                <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button red type="cancel" onclick="return close_second_window()">Volver</button>`;
            container.querySelector(".temp_p").appendChild(document.createTextNode(error));
        });
    }
}

function delete_editorial(){
    open_second_overlayed_window();
    let container = document.getElementById("second_container_overlay");

    checkboxes = document.getElementsByClassName("book_checkbox");
    checked = [];
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            checked.push(checkboxes[i].number);
        }
    }

    if (checked.length <= 0){
        container.innerHTML = `<h1>Selecciona editoriales</h1>
            <p>Ningun editorial ha sido seleccionado, seleccione al menos uno para realizar esta operación.</p>
            <button red style="margin: 1vw 0; padding: 0.5vw" type="cancel" onclick="return close_second_window()">Cancelar</button>`;
    }else{
        container.innerHTML = `<h1>Borrar editoriales</h1>
            <p>¿Deseas borrar a los editoriales seleccionados?</p>
            <div class="horizontal_alignment" style="margin: 0">
                <button yellow style="margin: 1vw 0; padding: 0.5vw" type="submit" onclick="return borrar_editorial()">Borrar</button>
                <button red style="margin: 1vw 0; padding: 0.5vw" type="cancel" onclick="return close_second_window()">Cancelar</button>
            </div>`;
    }
    
    return false;
}

function borrar_editorial(){
    ids = [];
    for (let i = 0; i < checked.length; i++) {
        ids.push(table.rows[checked[i] + 1].IDEditorial);
    }

    var formData = new FormData();
    formData.append("type", "editoriales");
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
            document.getElementById("second_container_overlay").innerHTML = `<h1>Usuario no autenticado</h1>
                <p>El usuario no ha iniciado sesión, solo el usuario administrador autenticado puede hacer estas operaciones.</p>
                <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
        }else if (data.status === "user-not-admin"){
            document.getElementById("second_container_overlay").innerHTML = `<h1>Usuario no administrador</h1>
                <p>El usuario con el que esta iniciado la sesión no tiene privilegios de administrador, por ende no puede realizar las siguientes acciones.</p>
                <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
        }else if (data.status === "success"){
            Deleted = JSON.parse(data.autoresDeleted);
            Left = JSON.parse(data.autoresLeft);
            if (Deleted.length > 0){
                document.getElementById("second_container_overlay").innerHTML = `<h1>Editoriales eliminados</h1>
                    <p>Los editoriales seleccionados han sido eliminados.</p>
                    ` + ((Left.length > 0) ? "<p>Algunos editoriales no pueden ser borrados porque el título al que estan vinculados ha sido préstado, resuelva el préstamo.</p>" : "") + `
                    <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
            }else{
                document.getElementById("second_container_overlay").innerHTML = `<h1>Editoriales NO eliminados</h1>
                    <p>Los editoriales seleccionados no han podido ser eliminados porque el título al que estan vinculados ha sido préstado, resuelva el préstamo.</p>
                    <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
            }
            update_editorial_search(document.getElementById("editorial_name").value, document.getElementById("editorial_location").value);
            search_data_combobox(editorial_combobox, "editorial");
        }else if (data.status === "error"){
            let container = document.getElementById("second_container_overlay");
            container.innerHTML = `<h1>Error del servidor</h1>
                <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button red type="cancel" onclick="return close_second_window()">Volver</button>`;
            container.querySelector(".temp_p").appendChild(document.createTextNode(data.message));
        }
    });
}

function update_autores_search(filter=""){
    var formData = new FormData();
    formData.append("type", "autores_filtrado");
    formData.append("filter", filter);

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
        clear_table();

        autores_data = JSON.parse(data.data);
        autores_length = Object.keys(autores_data).length;

        for (var i=0; i<autores_length; i++){
            item = autores_data[i];
            row = table.insertRow(table.rows.length);
            row.IDAutor = item["IDAutor"];

            cell1 = row.insertCell(0);
            cell2 = row.insertCell(1);

            cell1.innerHTML = "<p style='margin: 0.1vw 0' class='temp_p1'></p>";
            cell2.innerHTML = "<input type='checkbox' class='book_checkbox'>";
            let temp = cell1.querySelector(".temp_p1");
            temp.appendChild(document.createTextNode(item["Nombre"]));
            temp = cell2.querySelector(".book_checkbox");
            temp.number = i;
        }
    });
}

function delete_author(){
    open_second_overlayed_window();
    let container = document.getElementById("second_container_overlay");

    checkboxes = document.getElementsByClassName("book_checkbox");
    checked = [];
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            checked.push(checkboxes[i].number);
        }
    }

    if (checked.length <= 0){
        container.innerHTML = `<h1>Selecciona autores</h1>
            <p>Ningun autor ha sido seleccionado, seleccione al menos uno para realizar esta operación.</p>
            <button red style="margin: 1vw 0; padding: 0.5vw" type="cancel" onclick="return close_second_window()">Cancelar</button>`;
    }else{
        container.innerHTML = `<h1>Borrar autores</h1>
            <p>¿Deseas borrar a los autores seleccionados?</p>
            <div class="horizontal_alignment" style="margin: 0">
                <button yellow style="margin: 1vw 0; padding: 0.5vw" type="submit" onclick="return borrar_author()">Borrar</button>
                <button red style="margin: 1vw 0; padding: 0.5vw" type="cancel" onclick="return close_second_window()">Cancelar</button>
            </div>`;
    }
    
    return false;
}

function borrar_author(){
    ids = [];
    for (let i = 0; i < checked.length; i++) {
        ids.push(table.rows[checked[i] + 1].IDAutor);
    }

    var formData = new FormData();
    formData.append("type", "autores");
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
            document.getElementById("second_container_overlay").innerHTML = `<h1>Usuario no autenticado</h1>
                <p>El usuario no ha iniciado sesión, solo el usuario administrador autenticado puede hacer estas operaciones.</p>
                <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
        }else if (data.status === "user-not-admin"){
            document.getElementById("second_container_overlay").innerHTML = `<h1>Usuario no administrador</h1>
                <p>El usuario con el que esta iniciado la sesión no tiene privilegios de administrador, por ende no puede realizar las siguientes acciones.</p>
                <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
        }else if (data.status === "success"){
            Deleted = JSON.parse(data.autoresDeleted);
            Left = JSON.parse(data.autoresLeft);
            if (Deleted.length > 0){
                document.getElementById("second_container_overlay").innerHTML = `<h1>Autores eliminados</h1>
                    <p>Los autores seleccionados han sido eliminados.</p>
                    ` + ((Left.length > 0) ? "<p>Algunos autores no pueden ser borrados porque el título al que estan vinculados ha sido préstado, resuelva el préstamo.</p>" : "") + `
                    <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
            }else{
                document.getElementById("second_container_overlay").innerHTML = `<h1>Autores NO eliminados</h1>
                    <p>Los autores seleccionados no han podido ser eliminados porque el título al que estan vinculados ha sido préstado, resuelva el préstamo.</p>
                    <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
            }
            update_autores_search(document.getElementById("author_name").value);
            search_data_combobox(author_combobox, "autores");
        }else if (data.status === "error"){
            let container = document.getElementById("second_container_overlay");
            container.innerHTML = `<h1>Error del servidor</h1>
                <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button red type="cancel" onclick="return close_second_window()">Volver</button>`;
            container.querySelector(".temp_p").appendChild(document.createTextNode(data.message));
        }
    });
}

function modify_author(){
    open_second_overlayed_window();
    let container = document.getElementById("second_container_overlay");

    checkboxes = document.getElementsByClassName("book_checkbox");
    checked = [];
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            checked.push(checkboxes[i].number);
        }
    }

    if (checked.length <= 0){
        container.innerHTML = `<h1>Selecciona autores</h1>
            <p>Ningun autor ha sido seleccionado, seleccione al menos uno para realizar esta operación.</p>
            <button red style="margin: 1vw 0; padding: 0.5vw" type="cancel" onclick="return close_second_window()">Cancelar</button>`;
    }else{
        container.innerHTML = `<h1>Modificar autores</h1>
            <form method="POST" id="author_edit_form">
                <table class="table_author" style="width: 100%">
                    <tr>
                        <th style="width: 100%">
                            <p style="margin: 0.1vw 0">Autores:</p>
                        </th>
                    </tr>
                </table>
                <div class="horizontal_alignment" style="margin: 0">
                    <button yellow style="margin: 1vw 0; padding: 0.5vw" type="submit" onclick="return guardar_author()">Guardar Cambios</button>
                    <button red style="margin: 1vw 0; padding: 0.5vw" type="cancel" onclick="return close_second_window()">Cancelar</button>
                </div>
            </form>`;
        document.getElementById("author_edit_form").onsubmit = form_prevent;
        table2 = container.querySelector(".table_author");
        for (let i = 0; i < checked.length; i++) {
            item = autores_data[checked[i]];
            row = table2.insertRow(table2.rows.length);
            row.IDAutor = item["IDAutor"];

            cell1 = row.insertCell(0);

            cell1.innerHTML = "<input type='text' style='width: 90%' class='textbox' required>";
            let temp = cell1.querySelector(".textbox")
            temp.value = item["Nombre"];
            temp.placeholder = item["Nombre"];
        }
    }

    return true;
}

function guardar_author(){
    ids = [];
    names = [];
    for (let i = 1; i < table2.rows.length; i++) {
        row = table2.rows[i];
        namee = row.querySelector(".textbox").value;

        if (namee === ""){
            return true;
        }

        ids.push(row.IDAutor);
        names.push(namee);
    }
    
    if (confirm("ACTUALIZANDO AUTORES\n\nEstas por actualizar los autores a continuación.\n¿Desea continuar?")){
        var formData = new FormData();
        formData.append("type", "update autores");
        formData.append("ids", JSON.stringify(ids));
        formData.append("names", JSON.stringify(names));
        
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
                document.getElementById("second_container_overlay").innerHTML = `<h1>Usuario no autenticado</h1>
                    <p>El usuario no ha iniciado sesión, solo el usuario administrador autenticado puede hacer estas operaciones.</p>
                    <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
            }else if (data.status === "user-not-admin"){
                document.getElementById("second_container_overlay").innerHTML = `<h1>Usuario no administrador</h1>
                    <p>El usuario con el que esta iniciado la sesión no tiene privilegios de administrador, por ende no puede realizar las siguientes acciones.</p>
                    <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
            }else if (data.status === "success"){
                document.getElementById("second_container_overlay").innerHTML = `<h1>Autores actualizados</h1>
                    <p>Los autores seleccionados han sido actualizados.</p>
                    <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
                update_autores_search(document.getElementById("author_name").value);
                search_data_combobox(author_combobox, "autores");
            }else if (data.status === "error"){
                let container = document.getElementById("second_container_overlay");
                container.innerHTML = `<h1>Error del servidor</h1>
                    <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                    <button red type="cancel" onclick="return close_second_window()">Volver</button>`;
                container.querySelector(".temp_p").appendChild(document.createTextNode(data.message));
            }
        })
        .catch(error => {
            let container = document.getElementById("second_container_overlay");
            container.innerHTML = `<h1>Error del servidor</h1>
                <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button red type="cancel" onclick="return close_second_window()">Volver</button>`;
            container.querySelector(".temp_p").appendChild(document.createTextNode(error));
        });
    }
}

function clear_table(){
    for (var i=table.rows.length - 1; i>0; i--){
        table.rows[i].parentNode.removeChild(table.rows[i]);
    }
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
        container.innerHTML = `<h1>Borrar títulos</h1>
            <p>Esta por borrar los siguientes títulos:</p>`;
        for (let i = 0; i < checked.length; i++){
            item = book_data[checked[i]];

            const spacingDiv = document.createElement("div");
            spacingDiv.className = "vertical_spacing";
            spacingDiv.innerHTML = "<p><b class='bold_temp'></b></p>"

            let temp = spacingDiv.querySelector(".bold_temp");
            temp.appendChild(document.createTextNode(item["Titulo"] + ", " + ((item["Clasificacion"] === null) ? "---" : item["Clasificacion"]) + ", por " + item["Autores"] + "."));

            container.appendChild(spacingDiv);
        }
        container.innerHTML += `<p>¿Desea continuar?</p>
            <button red onclick="delete_titles()">Borrar</button>
            <button onclick="close_window()">Cerrar</button>`;
    }else{
        document.getElementById("container_overlay").innerHTML = `<h1>No ha seleccionado títulos.</h1>
        <p>Selecciona los títulos a borrar marcandolos en la casilla a la derecha de los títulos que haya buscado.</p>
        <button onclick="close_window()">Cerrar</button>`;
    }
}

function close_window(){
    overlay.remove();
    return false;
}

function close_two_window(){
    close_second_window();
    close_window();
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

    send_query("<h1>Editorial registrado</h1><p>La editorial se registro con éxito.</p><button red type='cancel' onclick='return close_two_window()'>Cerrar</button>", formData);
}

function register_author(){
    nombre = document.getElementById("author_name");
    nombre.required = true;
    if (nombre.value === ""){
        return true;
    }

    var formData = new FormData();
    formData.append("type", "author");
    formData.append("nombre", nombre.value);

    send_query("<h1>Autor registrado</h1><p>El autor se registro con éxito.</p><button red type='cancel' onclick='return close_two_window()'>Cerrar</button>", formData);
}

function title_register(){
    titulo = document.getElementById("title2");
    autor_req = document.getElementById("author2-selectized");
    idioma_req = document.getElementById("language2-selectized");

    titulo.required = true;
    autor_req.required = false;
    idioma_req.required = false;

    titulo = titulo.value;
    autor = author_combobox2.getValue();
    idioma = language_combobox2.getValue();

    if (titulo === "" || autor.length <= 0 || idioma === ""){
        if (autor.length <= 0){
            autor_req.required = true;
        }
        if (idioma === ""){
            idioma_req.required = true;
        }

        return true;
    }

    clasificacion = document.getElementById("clasification2").value;
    if (clasificacion === ""){
        clasificacion = null;
    }
    editorial = editorial_combobox2.getValue();
    if (editorial === ""){
        editorial = null;
    }
    edicion = document.getElementById("edition2").value;
    if (edicion === ""){
        edicion = null;
    }
    ISBN = document.getElementById("ISBN2").value;
    if (ISBN === ""){
        ISBN = null;
    }
    year = document.getElementById("year2").value;
    if (year === ""){
        year = null;
    }
    tome = document.getElementById("tome2").value;
    if (tome === ""){
        tome = null;
    }
    tome_name = document.getElementById("tome_name2").value;
    if (tome_name === ""){
        tome_name = null;
    }
    volume = document.getElementById("volume2").value;
    if (volume === ""){
        volume = null;
    }
    volume_name = document.getElementById("volume_name2").value;
    if (volume_name === ""){
        volume_name = null;
    }

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

    create_samples("Buena condicion", formData);
}

function create_samples(state, formData){
    open_second_overlayed_window();
    editorial = document.getElementById("editor2");
    autores = Array.from(document.getElementById("author2").options).filter(option => option.selected).map(option => option.text);
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
        let container = document.getElementById("second_container_overlay");
        container.style = "width:40%; top:0%;"
        container.innerHTML = `<h1>Creación de ejemplares</h1>
            <div class="vertical_spacing">
                <label for="book_title">Título: </label>
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
            <p>El título debe de tener minimo un ejemplar que viene siendo las copias de los libros.</p>
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
                                <button yellow type="cancel" class="plus_button" onclick="return add_folio()"></button>
                            </td>
                        </tr>
                    </table>
                </div>
                <button yellow id="title_button" type="submit">Registrar</button>
                <button yellow type="cancel" onclick="return close_second_window()">Cerrar</button>
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
    second_overlay = false;

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
                alert("FOLIOS REPETIDOS\n\nEn los nuevos folios que desea registrar para este título hay repetición, los folios no pueden repetirse entre ellos, asegurese además tambien de que estos folios no esten ya registrados en el sistema.");

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
    
    send_query("<h1>Título registrado</h1><p>El título:</p><p><b class='temp_b1'></b></p><p>Se registro con éxito con los siguientes folios:</p><p><b class='temp_b2'></b>.</p><button red type='cancel' onclick='return close_two_window()'>Cerrar</button>", formData, replacements, true);
}

function search_query(){
    titulo = document.getElementById("title");
    clasificacion_req = document.getElementById("clasification");
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
        "codigo": document.getElementById("clasification").value,
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
        book_max_page = Math.ceil(book_length/7);
        book_page = Math.min(1, book_max_page);
        
        update_search();

        window.location.href = "#search_list";
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
    book_max_page = Math.ceil(book_length/7);
    book_page = Math.min(book_page, book_max_page);
    
    result = document.getElementById("result_area");
    result.innerHTML = "";
    if (book_length > 0){
        for (let i = 7*book_page - 7; i < Math.min(book_length, 7*book_page); i++){
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
                    <p><b>Clasificacion: </b><b class="temp_b1">Título: </b><br>
                    <b class="temp_b3">Año: </b><b class="temp_b2">Autores: </b></p>
                </div>
                <div class="view_button" style="justify-content: center;">
                    <button class="button_temp">Ver</button>
                </div>
                <div class="mark_box">
                    <input type='checkbox' class='title_checkbox'>
                </div>`;
            result_div.style = color;
            let temp = result_div.querySelector(".temp_b1");
            temp.insertAdjacentText("beforebegin", ((item["Clasificacion"] === null) ? "---" : item["Clasificacion"]) + ", ");
            temp.insertAdjacentText("afterend", item["Titulo"]);
            temp = result_div.querySelector(".temp_b2");
            temp.insertAdjacentText("afterend", ((item["Autores"] === null) ? "---" : item["Autores"]));
            temp = result_div.querySelector(".temp_b3");
            temp.insertAdjacentText("afterend", ((item["AnioPublicacion"] === null) ? "---" : item["AnioPublicacion"]) + ", ");
            temp = result_div.querySelector(".button_temp");
            temp.IDTitulo = item["IDTitulo"];
            temp.addEventListener("click", function(){
                window.location.href = "book_view?id=" + this.IDTitulo;
            });
            temp = result_div.querySelector(".title_checkbox");
            temp.value = i;
            result.appendChild(result_div);
        };
    }else{
        let result_div = document.createElement("div");
        result_div.className = "search_book_result";
        result_div.innerHTML += `<div class="search_content">
                <p>Sin resultados...</p>
            </div>`;
        result.appendChild(result_div);
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
                container.innerHTML += "<p>Los siguientes títulos fueron eliminados de la base de datos:</p>";
                for (let i = checked.length - 1; i >= 0; i--) {
                    deleted = false;
                    titlesDeletedIds.forEach((item) => {
                        if (!deleted && book_data[checked[i]]["IDTitulo"] === item["IDTitulo"]){
                            book_data.splice(checked[i], 1);
                            let p = document.createElement("p");
                            p.innerHTML = "<b class='temp_b'></b>";
                            let temp = p.querySelector(".temp_b");
                            temp.appendChild(document.createTextNode(item["Titulo"] + ", " + ((item["Clasificacion"] === null) ? "---" : item["Clasificacion"]) + ", por " + item["Autores"]));
                            container.appendChild(p);
                            deleted = true;
                        }
                    });
                }
            }
            if (titlesIds.length > 0){
                container.innerHTML += "<p>Los siguientes títulos NO pudieron ser elimimnados debido a que han sido prestados y aun no han sido resueltos sus prestamos, resuelvalos en las secciones correspondientes:</p>";
                titlesIds.forEach((item) => {
                    let p = document.createElement("p");
                    p.innerHTML = "<b class='temp_b'></b>";
                    let temp = p.querySelector(".temp_b");
                    temp.appendChild(document.createTextNode(item["Titulo"] + ", " + ((item["Clasificacion"] === null) ? "---" : item["Clasificacion"]) + ", por " + item["Autores"]));
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
    if (second_overlay == false){
        open_second_overlayed_window();
    }
    container = document.getElementById("second_container_overlay");
    container.innerHTML = `<h1>Procesando...</h1>
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
            container.innerHTML = `<h1>Usuario no autenticado</h1>
                <p>El usuario no ha iniciado sesión, solo el usuario administrador autenticado puede hacer estas operaciones.</p>
                <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
        }else if (data.status === "user-not-admin"){
            container.innerHTML = `<h1>Usuario no administrador</h1>
                <p>El usuario con el que esta iniciado la sesión no tiene privilegios de administrador, por ende no puede realizar las siguientes acciones.</p>
                <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
        }else if (data.status === "folios-repeated"){
            array = JSON.parse(data.message);
            container.innerHTML = `<h1>Folios repetidos</h1>
                <p>Los siguientes folios ya se encuentran registrados en el sistema, use otros folios en lugar de los siguientes:</p>
                <p><b id="temp_b"></b></p>
                <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
            let temp = document.getElementById("temp_b");
            temp.appendChild(document.createTextNode(array));
        }else if (data.status === "duplicate-entry"){
            container.innerHTML = `<h1>Entrada duplicada</h1>
                <p>El dato que intentaste registrar ya se encuentra registrado, si por alguna razón no lo puede visualizar intente refrescar la página.</p>
                <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
        }else if (data.status === "success"){
            container.innerHTML = text;
            Object.keys(replacements).forEach((item) => {
                let temp = container.querySelector("." + item);
                temp.appendChild(document.createTextNode(replacements[item]));
            });
            search_data_combobox(editorial_combobox, "editorial");
            search_data_combobox(author_combobox, "autores");
        }else if (data.status === "error"){
            container.innerHTML = `<h1>Error del servidor</h1>
                <p id="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button red type="cancel" onclick="return close_second_window()">Volver</button>`;
            let temp = document.getElementById("temp_p");
            temp.appendChild(document.createTextNode(data.message));
        }
    })
    .catch(error => {
        container.innerHTML = `<h1>Error del servidor</h1>
            <p id="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
            <button red type="cancel" onclick="return close_second_window()">Volver</button>`;
        let temp = document.getElementById("temp_p");
        temp.appendChild(document.createTextNode(error));
    });
}

function search_data_combobox(combobox, type_search, permitir_nulo=true){
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
            window.location.href = "../index.html";
        }else if (data.status === "success"){
            combobox.clear();
            combobox.clearOptions();
            if (permitir_nulo){
                combobox.addOption({"value": "---", "text": "---"});
            }
            switch (type_search){
                case "editorial":
                    JSON.parse(data.data).forEach((item) => {
                        combobox.addOption({"value": item["IDEditorial"], "text": item["Nombre"]});
                    });
                break;
                case "autores":
                    JSON.parse(data.data).forEach((item) => {
                        combobox.addOption({"value": item["IDAutor"], "text": item["Nombre"]});
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
    document.getElementById("clasification").value = "";
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
    second_overlay = false;
    book_length = 0;
    book_page = 0;

    document.getElementById("register_title").onclick = open_title;
    document.getElementById("register_author").onclick = open_author;
    document.getElementById("register_editor").onclick = open_editorial;
    document.getElementById("title_form").onsubmit = form_prevent;

    editorial_combobox = $('#editor').selectize({
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
    search_data_combobox(author_combobox, "autores");
});