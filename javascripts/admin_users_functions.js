function form_prevent(e){
    e.preventDefault();
}

function close_window(){
    overlay.remove();
    return false;
}

function close_second_window(){
    second_overlay.remove();
    return false;
}

function open_second_overlayed_window(){
    second_overlay = document.createElement("div");
    second_overlay.setAttribute("id", "second_overlayed_window");
    second_overlay.setAttribute("class", "overlayed_window");
    second_overlay.innerHTML = "<div id='second_container_overlay' class='second_container_overlay'></div>";
    document.body.appendChild(second_overlay);
}

function user_register(){
    open_overlayed_window();
    document.getElementById("container_overlay").innerHTML = `<h1>Registrar usuario</h1>
        <form method="POST" id="usuario_form">
            <div class="vertical_spacing">
                <label for="user_username">Nombre de usuario:</label>
                <input type="text" style="width:50%;" autocomplete="username" id="user_username" name="user_username" placeholder="Nombre de usuario..." required>
            </div>
            <div class="vertical_spacing">
                <label for="user_name">Nombre:</label>
                <input type="text" style="width:40%;" autocomplete="given-name" id="user_name" name="user_name" placeholder="Nombre...">
                <label for="user_gender"> Género:</label>
                <div style="display:inline-block; width:15%;">
                    <select id="user_gender" placeholder="Género..." required>
                        <option value="">Selecciona una opción...</option>
                        <option value="M">M</option>
                        <option value="F">F</option>
                    </select>
                </div>
            </div>
            <div class="vertical_spacing">
                <label for="user_apeP">Apellido paterno:</label>
                <input type="text" style="width:50%;" autocomplete="family-name" id="user_apeP" name="user_apeP" placeholder="Apellido paterno..." required>
            </div>
            <div class="vertical_spacing">
                <label for="user_apeM">Apellido materno:</label>
                <input type="text" style="width:50%;" autocomplete="family-name" id="user_apeM" name="user_apeM" placeholder="Apellido materno..." required>
            </div>
            <div class="vertical_spacing">
                <input type="radio" name="same" id="student" value="estudiante" checked required>
                <label for="student">Estudiante</label>
                <input type="radio" name="same" id="teacher" value="docente" required>
                <label for="teacher">Docente</label>
            </div>
            <div id="part_one" class="vetical_spacing">
                <label for="user_nocontrol">No. de control:</label>
                <input type="text" style="width:25%;" id="user_nocontrol" name="user_nocontrol" placeholder="########..." required>
                <label for="user_semester"> Semestre:</label>
                <input type="number" min="1" style="width:10%;" id="user_semester" name="user_semester" placeholder="Semestre..." required>
            </div>
            <div id="part_two" class="vetical_spacing">
                <label for="user_career">Carrera:</label>
                <input type="text" style="width:70%;" id="user_career" name="user_career" placeholder="Carrera..." required>
            </div>
            <div class="horizontal_alignment" style="margin-bottom:0;">
                <button type="submit" onclick="return register_user()">Registrar</button>
                <button type="cancel" onclick="return close_window()">Cerrar</button>
            </div>
        </form>`;
    genero2_combobox = $('#user_gender').selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;
    document.getElementById("student").addEventListener('change', function() {
        document.getElementById("part_one").innerHTML = `<label for="user_nocontrol">No. de control:</label>
            <input type="text" style="width:25%;" id="user_nocontrol" name="user_nocontrol" placeholder="########..." required>
            <label for="user_semester"> Semestre:</label>
            <input type="number" min="1" style="width:10%;" id="user_semester" name="user_semester" placeholder="Semestre..." required>`;
        document.getElementById("part_two").innerHTML = `<label for="user_career">Carrera:</label>
            <input type="text" style="width:70%;" id="user_career" name="user_career" placeholder="Carrera..." required>`;
    });
    document.getElementById("teacher").addEventListener('change', function() {
        document.getElementById("part_one").innerHTML = `<label for="user_nocard">No. de tarjeta:</label>
            <input type="text" style="width:40%;" id="user_nocard" name="user_nocard" placeholder="########..." required>`;
        document.getElementById("part_two").innerHTML = `<label for="user_department">Departamento:</label>
            <input type="text" style="width:60%;" id="user_department" name="user_department" placeholder="Departamento..." required>`;
    });
    document.getElementById("usuario_form").onsubmit = form_prevent;
}

function excel_load(){
    open_overlayed_window();
    document.getElementById("container_overlay").style = "top: 0%";
    document.getElementById("container_overlay").innerHTML = `<h1>Cargar excel</h1>
        <p>Para cargar usuarios, el archivo excel debe tener las columnas: <b>No. de control/tarjeta, Nombre, Apellido paterno, Apellido materno, Genero, Carrera/Departamento, Semestre (este es ignorado si son docentes)</b></p>
        <p>Los nombres de usuario de cada uno de los usuarios se toma desde su número de control o número de tarjeta.</p>
        <p style="color:red">Para dar de baja solo se requiere la columna del No. de control o No. de tarjeta, obligatoriamente solo esa columna, las demas son ignoradas.</p>
        <input type="file" id="excel_form" accept=".xlsx">
        <div class="horizontal_alignment" style="display:flex; align-items:center; justify-content:center;">
            <button type="submit" onclick="return excel_action('register')" style="margin:0.5vw;">Registrar</button>
            <button type="cancel" onclick="return excel_action('eliminate')" style="margin:0.5vw;">Dar de baja</button>
            <button type="cancel" onclick="return close_window()" style="margin:0.5vw;">Cerrar</button>
        </div>`;
}

function excel_action(text){
    fileInput = document.getElementById("excel_form");
    if (fileInput.files.length === 0) {
        document.getElementById("container_overlay").innerHTML = `<h1>Cargar excel</h1>
            <p>Para cargar usuarios, el archivo excel debe tener las columnas: <b>No. de control/tarjeta, Nombre, Apellido paterno, Apellido materno, Genero, Carrera/Departamento, Semestre (este es ignorado si son docentes)</b></p>
            <p>Los nombres de usuario de cada uno de los usuarios se toma desde su número de control o número de tarjeta.</p>
            <p style="color:red">Para dar de baja solo se requiere la columna del No. de control o No. de tarjeta, obligatoriamente solo esa columna, las demas son ignoradas.</p>
            <input type="file" id="excel_form" accept=".xlsx">
            <p style="color:red;">Selecciona un archivo .xlsx</p>
            <div class="horizontal_alignment" style="display:flex; align-items:center; justify-content:center;">
                <button type="submit" onclick="return excel_action('register')" style="margin:0.5vw;">Registrar</button>
                <button type="cancel" onclick="return excel_action('eliminate')" style="margin:0.5vw;">Dar de baja</button>
                <button type="cancel" onclick="return close_window()" style="margin:0.5vw;">Cerrar</button>
            </div>`;
        return;
    }

    open_second_overlayed_window();
    if (text == "register"){
        document.getElementById("second_container_overlay").innerHTML = `<h1>Registrar usuarios</h1>
            <p>Selecciona el tipo de usuarios con los que se hará la operación de registro de usuarios.</p>
            <div class="horizontal_alignment" style="display:flex; align-items:center; justify-content:center;">
                <button yellow type="submit" onclick="return excel_perform('student', 'register')" style="margin:0 0.5vw;">Alumnos</button>
                <button yellow type="cancel" onclick="return excel_perform('teacher', 'register')" style="margin:0 0.5vw;">Docentes</button>
                <button red type="cancel" onclick="return close_second_window()" style="margin:0.5vw;">Cerrar</button>
            </div>`;
    }else{
        document.getElementById("second_container_overlay").innerHTML = `<h1>Eliminar usuarios</h1>
            <p>Selecciona el tipo de usuarios con los que se hará la operación de eliminar usuarios.</p>
            <div class="horizontal_alignment" style="display:flex; align-items:center; justify-content:center;">
                <button yellow type="submit" onclick="return excel_perform('student', 'eliminate')" style="margin:0 0.5vw;">Alumnos</button>
                <button yellow type="cancel" onclick="return excel_perform('teacher', 'eliminate')" style="margin:0 0.5vw;">Docentes</button>
                <button red type="cancel" onclick="return close_second_window()" style="margin:0.5vw;">Cerrar</button>
            </div>`;
    }
}

function excel_perform(text, type){
    var formData = new FormData();
    formData.append("type", text + "_file_" + type);
    for (const file of fileInput.files) {
        formData.append('files[]', file);
    }

    if (text == "student"){
        send_query(["control", "Control"], formData);
    }else{
        send_query(["tarjeta", "Tarjeta"], formData);
    }
}

function register_user(){
    var formData = new FormData();
    if (document.getElementById("student").checked){
        formData.append("type", "student");
        var dict = {
            "nombre": document.getElementById("user_name").value,
            "apeP": document.getElementById("user_apeP").value,
            "apeM": document.getElementById("user_apeM").value,
            "usuario": document.getElementById("user_username").value,
            "genero": genero2_combobox.getValue(),
            "nocontrol": document.getElementById("user_nocontrol").value,
            "semestre": document.getElementById("user_semester").value,
            "carrera": document.getElementById("user_career").value
        }
        formData.append("data", JSON.stringify(dict));

        if (dict["nombre"] === "" || dict["apeP"] === "" || dict["apeM"] === "" || dict["usuario"] === "" || dict["genero"] === "" || dict["nocontrol"] === "" || dict["semestre"] === "" || dict["carrera"] === ""){
            return true;
        }
    }else{
        formData.append("type", "teacher");
        var dict = {
            "nombre": document.getElementById("user_name").value,
            "apeP": document.getElementById("user_apeP").value,
            "apeM": document.getElementById("user_apeM").value,
            "usuario": document.getElementById("user_username").value,
            "genero": genero2_combobox.getValue(),
            "notarjeta": document.getElementById("user_nocard").value,
            "departamento": document.getElementById("user_department").value
        }
        formData.append("data", JSON.stringify(dict));

        if (dict["nombre"] === "" || dict["apeP"] === "" || dict["apeM"] === "" || dict["usuario"] === "" || dict["genero"] === "" || dict["notarjeta"] === "" || dict["departamento"] === ""){
            return true;
        }
    }

    var replacements = {
        "temp_b1": dict["usuario"],
        "temp_b2": ((formData.get("type") === "student") ? "Estudiante" : "Docente")
    }

    send_query("<h1>Usuario registrado</h1><p>El usuario: <b class='temp_b1'></b></p><p>De tipo: <b class='temp_b2'></b></p><p>Se registro con éxito con la contraseña siendo su número de control para los estudiantes y número de tarjeta para los docentes, la cual deberán cambiar al momento de iniciar sesión.</p>", formData, replacements);
}

function open_delete_users(){
    open_overlayed_window();

    checkboxes = document.getElementsByClassName("user_checkbox");
    checked = [];
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            checked.push(checkboxes[i].value);
        }
    }

    if (checked.length > 0){
        let container = document.getElementById("container_overlay");
        container.innerHTML = `<h1>Borrar usuarios</h1>
            <p>Esta por borrar los siguientes usuarios:</p>`;
        for (let i = 0; i < checked.length; i++){
            item = usuario_data[checked[i]];
            let div = document.createElement("div");
            div.className = "vertical_spacing";
            div.innerHTML = '<p><b class="temp_b1"></b>, <b class="temp_b2"></b>, <b class="temp_b3">Nombre: </b>, <b class="temp_b4">Genero: </b></p>';
            let temp = div.querySelector(".temp_b1");
            temp.textContent = ((item["NoControl"] === null) ? "No. de Tarjeta: " : "No. de Control: ");
            temp.insertAdjacentText("afterend", ((item["NoControl"] === null) ? item["NoTarjeta"] : item["NoControl"]));
            temp = div.querySelector(".temp_b2");
            temp.textContent = ((item["NoControl"] === null) ? "Departamento: " : "Carrera: ");
            temp.insertAdjacentText("afterend", ((item["NoControl"] === null) ? item["Departamento"] : item["Carrera"]));
            temp = div.querySelector(".temp_b3");
            temp.insertAdjacentText("afterend", item["Nombre"]);
            temp = div.querySelector(".temp_b4");
            temp.insertAdjacentText("afterend", ((item["Genero"] === "F") ? "Femenino" : "Masculino"));
            container.appendChild(div);
        }
        let temp = document.createElement("p");
        temp.textContent = "¿Desea continuar?";
        container.appendChild(temp);
        temp = document.createElement("button");
        temp.textContent = "Borrar";
        temp.red = true;
        temp.onclick = delete_users;
        container.appendChild(temp);
        temp = document.createElement("button");
        temp.textContent = "Cerrar";
        temp.onclick = close_window;
        container.appendChild(temp);
    }else{
        document.getElementById("container_overlay").innerHTML = `<h1>No ha seleccionado usuarios.</h1>
        <p>Selecciona los usuarios a borrar marcandolos en la casilla a la derecha de los usuarios que haya buscado.</p>
        <button onclick="close_window()">Cerrar</button>`;
    }
}

function delete_users(idselected=false){
    document.getElementById("container_overlay").innerHTML = `<h1>Procesando...</h1>
        <p>Por favor espere...</p>`;
    
    ids = [];
    for (let i = checked.length - 1; i >= 0; i--) {
        ids.push(usuario_data[checked[i]]["Id"]);
    }

    var formData = new FormData();
    formData.append("type", "user");
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
            titlesIds = JSON.parse(data.usersLeft); //Me dio flojera de cambiar los nombres de las variables xd
            titlesDeletedIds = JSON.parse(data.usersDeleted);
            final_count = parseInt(data.selfuser);
            titlesLeft = "";
            titlesDeleted = "";
            let container = document.getElementById("container_overlay");
            container.innerHTML = `<h1>Resultado</h1>
                <button type='cancel' class="temp_button" onclick='return close_window()'>Cerrar</button>`;
            let button = container.querySelector(".temp_button");
            
            if (titlesDeletedIds.length > 0){
                let p = document.createElement("p");
                p.textContent = "Los siguientes usuarios fueron eliminados de la base de datos:";
                button.insertAdjacentElement("beforebegin", p);
                for (let i = checked.length - 1; i >= 0; i--) {
                    deleted = false;
                    titlesDeletedIds.forEach((item) => {
                        if (!deleted && usuario_data[checked[i]]["Id"] === item["IDUsuario"]){
                            usuario_data.splice(checked[i], 1);
                            p = document.createElement("p");
                            p.innerHTML = '<b class="temp_b1"></b>, <b class="temp_b2"></b>, <b class="temp_b3">Nombre: </b>, <b class="temp_b4">Genero: </b>';
                            let temp = p.querySelector(".temp_b1");
                            temp.textContent = ((item["NoControl"] === null) ? "No. de Tarjeta: " : "No. de Control: ");
                            temp.insertAdjacentText("afterend", ((item["NoControl"] === null) ? item["NoTarjeta"] : item["NoControl"]));
                            temp = p.querySelector(".temp_b2");
                            temp.textContent = ((item["NoControl"] === null) ? "Departamento: " : "Carrera: ");
                            temp.insertAdjacentText("afterend", ((item["NoControl"] === null) ? item["Departamento"] : item["Carrera"]));
                            temp = p.querySelector(".temp_b3");
                            temp.insertAdjacentText("afterend", item["Nombre"]);
                            temp = p.querySelector(".temp_b4");
                            temp.insertAdjacentText("afterend", ((item["Genero"] === "F") ? "Femenino" : "Masculino"));
                            button.insertAdjacentElement("beforebegin", p);
                            deleted = true;
                        }
                    });
                }
            }
            if (titlesIds.length > 0){
                if (final_count >= 0){
                    let p = document.createElement("p");
                    p.textContent = "ESTAS TRATANDO DE ELIMINARTE A TI MISMO, NO PUEDES, SIMPLEMENTE NO:";
                    button.insertAdjacentElement("beforebegin", p);
                    let item = titlesIds[final_count];
                    p = document.createElement("p");
                    p.innerHTML = '<b class="temp_b1"></b>, <b class="temp_b2"></b>, <b class="temp_b3">Nombre: </b>, <b class="temp_b4">Genero: </b>';
                    let temp = p.querySelector(".temp_b1");
                    temp.textContent = ((item["NoControl"] === null) ? "No. de Tarjeta: " : "No. de Control: ");
                    temp.insertAdjacentText("afterend", ((item["NoControl"] === null) ? item["NoTarjeta"] : item["NoControl"]));
                    temp = p.querySelector(".temp_b2");
                    temp.textContent = ((item["NoControl"] === null) ? "Departamento: " : "Carrera: ");
                    temp.insertAdjacentText("afterend", ((item["NoControl"] === null) ? item["Departamento"] : item["Carrera"]));
                    temp = p.querySelector(".temp_b3");
                    temp.insertAdjacentText("afterend", item["Nombre"]);
                    temp = p.querySelector(".temp_b4");
                    temp.insertAdjacentText("afterend", ((item["Genero"] === "F") ? "Femenino" : "Masculino"));
                    button.insertAdjacentElement("beforebegin", p);
                }
                let p = document.createElement("p");
                p.textContent = "Los siguientes usuarios NO pudieron ser elimimnados debido a que tienen prestamos o multas pendientes y aun no han sido resueltos, resuelvalos en las secciones correspondientes:";
                button.insertAdjacentElement("beforebegin", p);
                count = 0;
                titlesIds.forEach((item) => {
                    if (count === final_count){
                        count++;
                        return;
                    }
                    count++;
                    p = document.createElement("p");
                    p.innerHTML = '<b class="temp_b1"></b>, <b class="temp_b2"></b>, <b class="temp_b3">Nombre: </b>, <b class="temp_b4">Genero: </b>';
                    let temp = p.querySelector(".temp_b1");
                    temp.textContent = ((item["NoControl"] === null) ? "No. de Tarjeta: " : "No. de Control: ");
                    temp.insertAdjacentText("afterend", ((item["NoControl"] === null) ? item["NoTarjeta"] : item["NoControl"]));
                    temp = p.querySelector(".temp_b2");
                    temp.textContent = ((item["NoControl"] === null) ? "Departamento: " : "Carrera: ");
                    temp.insertAdjacentText("afterend", ((item["NoControl"] === null) ? item["Departamento"] : item["Carrera"]));
                    temp = p.querySelector(".temp_b3");
                    temp.insertAdjacentText("afterend", item["Nombre"]);
                    temp = p.querySelector(".temp_b4");
                    temp.insertAdjacentText("afterend", ((item["Genero"] === "F") ? "Femenino" : "Masculino"));
                    button.insertAdjacentElement("beforebegin", p);
                });
            }
            
            update_search();
        }else if (data.status === "error"){
            let container = document.getElementById("container_overlay");
            container.innerHTML = `<h1>Error del servidor</h1>
                <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button type="cancel" onclick="return close_window()">Volver</button>`;
            container.querySelector(".temp_p").appendChild(document.createTextNode(data.message));
        }
    })
    .catch(error => {
        let container = document.getElementById("container_overlay");
        container.innerHTML = `<h1>Error del servidor</h1>
            <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
            <button type="cancel" onclick="return close_window()">Volver</button>`;
        container.querySelector(".temp_p").appendChild(document.createTextNode(error));
    });
}

function search_query(){
    var dict = {
        "nombre": document.getElementById("name").value,
        "apeP": document.getElementById("apeP").value,
        "apeM": document.getElementById("apeM").value,
        "usuario": document.getElementById("username").value,
        "genero": genero_combobox.getValue(),
        "nocontrol": document.getElementById("nocontrol").value,
        "semestre": document.getElementById("semester").value,
        "carrera": document.getElementById("career").value,
        "notarjeta": document.getElementById("nocard").value,
        "departamento": document.getElementById("department").value
    }

    if (dict["nocontrol"] === ""){
        dict["nocontrol"] = null;
    }
    if (dict["semestre"] === ""){
        dict["semestre"] = null;
    }
    if (dict["carrera"] === ""){
        dict["carrera"] = null;
    }
    if (dict["notarjeta"] === ""){
        dict["notarjeta"] = null;
    }
    if (dict["departamento"] === ""){
        dict["departamento"] = null;
    }
    if (dict["semestre"] == null && dict["carrera"] == null && dict["departamento"] == null){
        filtered = false;
    }else{
        filtered = true;
    }

    var formData = new FormData();
    formData.append("type", "usuario");
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
        usuario_data = JSON.parse(data.data);
        usuario_length = Object.keys(usuario_data).length;
        usuario_max_page = Math.ceil(usuario_length/6);
        usuario_page = Math.min(1, usuario_max_page);
        
        update_search();

        window.location.href = "#search_list";
    });
    
    return true;
}

function change_page(direction){
    if (usuario_page > 1 && direction < 0){
        usuario_page--;
    }else if(usuario_page < usuario_max_page && direction > 0){
        usuario_page++;
    }else{
        return;
    }
    
    update_search();
}

function update_search(){
    usuario_length = Object.keys(usuario_data).length;
    usuario_max_page = Math.ceil(usuario_length/6);
    usuario_page = Math.min(usuario_page, usuario_max_page);

    let result = document.getElementById("result_area");
    result.innerHTML = "";
    if (usuario_length > 0){
        for (let i = 6*usuario_page - 6; i < Math.min(usuario_length, 6*usuario_page); i++){
            item = usuario_data[i];
            inicio = new Date(item["FechaInicio"] + "T00:00:00");
            fin = new Date(item["FechaFin"] + "T23:59:59");
            today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
            
            let result_div = document.createElement("div");
            result_div.className = "search_user_result";
            if (!(item["FechaInicio"] === null || today > fin)){
                result_div.style = "background-color: #FFA8A8";
            }else if (item["Multado"] == 1){
                result_div.style = "background-color:rgb(255, 224, 139)";
            }else if (item["FechaInscrito"] === null){
                result_div.style = "background-color:rgb(194, 194, 194)";
            }
            result_div.innerHTML = `<div class="photo_user" style="justify-content: center;">
                    <img class="temp_photo">
                </div>
                <div class="search_content">
                    <p><b class="temp_b1"></b>, <b class="temp_b2"></b><br>
                    <b class="temp_b3">Nombre: </b>, <b class="temp_b4">Genero: </b></p>
                </div>
                <div class="view_button"style="justify-content: center;">
                    <button class="temp_button">Ver</button>
                </div>
                <div class="mark_box" style="justify-content: center;">
                    <input type='checkbox' class='user_checkbox'>
                </div>`;
            let temp = result_div.querySelector(".temp_photo");
            temp.src = "../images/profile" + item["Genero"] + ".png";
            temp = result_div.querySelector(".temp_b1");
            temp.textContent = ((item["NoControl"] === null) ? "No. de Tarjeta: " : "No. de Control: ");
            temp.insertAdjacentText("afterend", ((item["NoControl"] === null) ? item["NoTarjeta"] : item["NoControl"]));
            temp = result_div.querySelector(".temp_b2");
            temp.textContent = ((item["NoControl"] === null) ? "Departamento: " : "Carrera: ");
            temp.insertAdjacentText("afterend", ((item["NoControl"] === null) ? item["Departamento"] : item["Carrera"]));
            temp = result_div.querySelector(".temp_b3");
            temp.insertAdjacentText("afterend", item["Nombre"]);
            temp = result_div.querySelector(".temp_b4");
            temp.insertAdjacentText("afterend", ((item["Genero"] === "F") ? "Femenino" : "Masculino"));
            temp = result_div.querySelector(".temp_button");
            temp.Id = item["Id"];
            temp.addEventListener("click", function (){
                window.location.href = "user_view?id=" + this.Id;
            });
            temp = result_div.querySelector(".user_checkbox");
            temp.value = i;
            result.appendChild(result_div);
        };
    }else{
        let result_div = document.createElement("div");
        result_div.className = "search_user_result";
        result_div.innerHTML += `<div class="search_content">
                <p>Sin resultados...</p>
            </div>`;
        result.appendChild(result_div);
    }
    document.getElementById("pages_available").textContent = "Página " + usuario_page + " de " + usuario_max_page;
}

function clear_data(){
    document.getElementById("name").value = "";
    document.getElementById("apeP").value = "";
    document.getElementById("apeM").value = "";
    document.getElementById("username").value = "";
    genero_combobox.clear();
    document.getElementById("nocontrol").value = "";
    document.getElementById("career").value = "";
    document.getElementById("semester").value = "";
    document.getElementById("nocard").value = "";
    document.getElementById("department").value = "";
}

function open_delete_search(){
    open_overlayed_window();
    if (usuario_data.length > 0){
        if (filtered){
            document.getElementById("container_overlay").innerHTML = `<h1>¿Borrar muchos usuarios?</h1>
                <p>Esta por borrar un conjunto de usuarios que comparten carrera, semestre y/o departamentos.</p>
                <p>¿Desea continuar?</p>
                <button red onclick="return perform_deletion()" style="margin:0.5vw;">Borrar</button>
                <button onclick="return close_window()" style="margin:0.5vw;">Cerrar</button>`;
        }else{
            document.getElementById("container_overlay").innerHTML = `<h1>Advertencia</h1>
                <p>En esta búsqueda no se uso ningún filtro de carrera, semestre o departamento, los usuarios que esta por borrar puede que sean de varias areas y semestres diferentes. <b>Solo haga esto si esta completamente seguro de lo que hace</b>.</p>
                <p>¿Desea continuar?</p>
                <button red onclick="return perform_deletion()" style="margin:0.5vw;">Borrar</button>
                <button onclick="return close_window()" style="margin:0.5vw;">Cerrar</button>`;
        }
    }else{
        document.getElementById("container_overlay").innerHTML = `<h1>No hay resultados</h1>
            <p>No se ha realizado ninguna búsqueda, realize una búsqueda para poder borrar los datos encontrados.</p>
            <button onclick="return close_window()" style="margin:0.5vw;">Cerrar</button>`;
    }
}

function perform_deletion(){
    checked = [];
    for (let i = 0; i < usuario_length; i++) {
        checked.push(i);
    }

    delete_users(true);
}

function send_query(text, formData, replacements={}){
    if (second_overlay !== null){
        close_second_window();
        second_overlay = null;
    }
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
        }else if (data.status === "duplicate-entry"){
            document.getElementById("container_overlay").innerHTML = `<h1>Entrada duplicada</h1>
                <p>El dato que intentaste registrar ya se encuentra registrado, si por alguna razón no lo puede visualizar intente refrescar la página.</p>
                <button type="cancel" onclick="return close_window()">Cerrar</button>`;
        }else if (data.status === "success-delete"){
            container = document.getElementById("container_overlay");
            container.style = "font-size: 1.25vw";
            datos = JSON.parse(data.message);

            if (datos.length > 0){
                inserted = datos[0];
                excepted = datos[1];
                notFound = datos[2];
                
                if (inserted.length > 0){
                    let p = document.createElement("p");
                    for (let i = 0; i < inserted.length; i++) {
                        let b1 = document.createElement("b");
                        b1.textContent = "Nombre: ";
                        let b2 = document.createElement("b");
                        b2.textContent = "No. de " + text[1] + ": ";
                        
                        p.appendChild(b1);
                        p.appendChild(document.createTextNode(inserted[i]["Nombre"]));
                        p.appendChild(document.createTextNode(", "));
                        p.appendChild(b2);
                        p.appendChild(document.createTextNode(inserted[i]["No" + text[1]]));
                        p.appendChild(document.createElement("br"));
                    }
                    container.innerHTML = "<h1>Usuarios eliminados</h1>";
                    let temp = document.createElement("p");
                    temp.textContent = "Los siguientes usuarios fueron eliminados con éxito sin ningun problema.";
                    container.appendChild(temp);
                    container.appendChild(p);
                }else if (excepted.length > 0){
                    container.innerHTML = "<h1>Usuarios no eliminados</h1>";
                }else{
                    container.innerHTML = "<h1>Usuarios no encontrados</h1>"
                }
                
                if (excepted.length > 0){
                    let p = document.createElement("p");
                    for (let i = 0; i < excepted.length; i++) {
                        let b1 = document.createElement("b");
                        b1.textContent = "Nombre: ";
                        let b2 = document.createElement("b");
                        b2.textContent = "No. de " + text[1] + ": ";
                        
                        p.appendChild(b1);
                        p.appendChild(document.createTextNode(excepted[i]["Nombre"]));
                        p.appendChild(document.createTextNode(", "));
                        p.appendChild(b2);
                        p.appendChild(document.createTextNode(excepted[i]["No" + text[1]]));
                        p.appendChild(document.createElement("br"));
                    }
                    let temp = document.createElement("p");
                    temp.textContent = "Los siguientes usuarios no pudieron eliminarse, verifique que no tenga multas no saldadas o prestamos no entregados, vaya a los menus correspondientes para resolver eso:";
                    container.appendChild(temp);
                    container.appendChild(p);
                }

                if (notFound.length > 0){
                    let p = document.createElement("p");
                    for (let i = 0; i < notFound.length; i++) {
                        p.appendChild(document.createTextNode(notFound[i]));
                        p.appendChild(document.createElement("br"));
                    }
                    let temp = document.createElement("p");
                    temp.textContent = "Los siguientes números de " + text[1] + " no se encontraron en la base de datos, verifique que esten escritos bien o puede que sea uno repetido:";
                    container.appendChild(temp);
                    container.appendChild(p);
                }
            }else{
                container.innerHTML = text;
                Object.keys(replacements).forEach((item) => {
                    container.querySelector("." + item).textContent = replacements[item];
                })
            }
            let button = document.createElement("button");
            button.type = "cancel";
            button.addEventListener("click", function (){
                return close_window();
            });
            button.textContent = "Cerrar";
            container.appendChild(button);
        }else if (data.status === "success"){
            container = document.getElementById("container_overlay");
            datos = JSON.parse(data.message);

            if (datos.length > 0){
                inserted = datos[0];
                excepted = datos[1];
                
                if (inserted.length > 0){
                    let p = document.createElement("p");
                    for (let i = 0; i < inserted.length; i++) {
                        let b1 = document.createElement("b");
                        b1.textContent = "Nombre: ";
                        let b2 = document.createElement("b");
                        b2.textContent = "No. de " + text[1] + ": ";
                        
                        p.appendChild(b1);
                        p.appendChild(document.createTextNode(inserted[i]["Nombre"]));
                        p.appendChild(document.createTextNode(", "));
                        p.appendChild(b2);
                        p.appendChild(document.createTextNode(inserted[i]["No" + text[1]]));
                        p.appendChild(document.createElement("br"));
                    }
                    container.innerHTML = "<h1>Usuarios registrados</h1>";
                    let temp = document.createElement("p");
                    temp.textContent = "Los siguientes usuarios fueron registrados con éxito, sus contraseñas son sus números de " + text[0] + " el cual deberán cambiar al momento de iniciar sesión:";
                    container.appendChild(temp);
                    container.appendChild(p);
                }else{
                    container.innerHTML = "<h1>Usuarios no registrados</h1>";
                }
                
                if (excepted.length > 0){
                    let p = document.createElement("p");
                    for (let i = 0; i < excepted.length; i++) {
                        let b1 = document.createElement("b");
                        b1.textContent = "Nombre: ";
                        let b2 = document.createElement("b");
                        b2.textContent = "No. de " + text[1] + ": ";
                        
                        p.appendChild(b1);
                        p.appendChild(document.createTextNode(excepted[i]["Nombre"]));
                        p.appendChild(document.createTextNode(", "));
                        p.appendChild(b2);
                        p.appendChild(document.createTextNode(excepted[i]["No" + text[1]]));
                        p.appendChild(document.createElement("br"));
                    }
                    let temp = document.createElement("p");
                    temp.textContent = "Los siguientes usuarios no pudieron registrarse, verifique que los números de " + text[0] + " no se encuentren ya registrados en el sistema o que su nombre de usuario no este siendo usado por otro usuario:";
                    container.appendChild(temp);
                    container.appendChild(p);
                }
            }else{
                container.innerHTML = text;
                Object.keys(replacements).forEach((item) => {
                    container.querySelector("." + item).textContent = replacements[item];
                })
            }
            let button = document.createElement("button");
            button.type = "cancel";
            button.addEventListener("click", function (){
                return close_window();
            });
            button.textContent = "Cerrar";
            container.appendChild(button);
        }else if (data.status === "error"){
            let container = document.getElementById("container_overlay");
            container.innerHTML = `<h1>Error del servidor</h1>
                <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button type="cancel" onclick="return close_window()">Volver</button>`;
            container.querySelector(".temp_p").appendChild(document.createTextNode(data.message));
        }
    })
    .catch(error => {
        let container = document.getElementById("container_overlay");
        container.innerHTML = `<h1>Error del servidor</h1>
            <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
            <button type="cancel" onclick="return close_window()">Volver</button>`;
        container.querySelector(".temp_p").appendChild(document.createTextNode(error));
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
    usuario_data = [];
    filtered = false;
    second_overlay = null;

    document.getElementById("user_form").onsubmit = form_prevent;

    genero_combobox = $('#gender').selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;
});