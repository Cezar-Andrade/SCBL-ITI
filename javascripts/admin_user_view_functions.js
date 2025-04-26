function form_prevent(e){
    e.preventDefault();
}

function open_overlayed_window(){
    overlay = document.createElement("div");
    overlay.setAttribute("id", "overlayed_window");
    overlay.setAttribute("class", "overlayed_window");
    overlay.innerHTML = "<div id='container_overlay' class='container_overlay'></div>";
    document.body.appendChild(overlay);
}

function open_second_overlayed_window(){
    second_overlay = document.createElement("div");
    second_overlay.setAttribute("id", "second_overlayed_window");
    second_overlay.setAttribute("class", "overlayed_window");
    second_overlay.innerHTML = "<div id='second_container_overlay' class='second_container_overlay'></div>";
    document.body.appendChild(second_overlay);
}

function close_window_warning(){
    if (change_made){
        open_second_overlayed_window();
        document.getElementById("second_container_overlay").innerHTML = `<h1>Confirmar acción</h1>
            <p>Esta por cancelar todos los cambios que haya hecho en el titulo y sus ejemplares.</p>
            <p>¿Desea continuar?</p>
            <button yellow onclick="close_two_window()">Continuar</button>
            <button red onclick="close_second_window()">Cancelar</button>`;
    }else{
        close_window();
    }
}

function close_two_window(update=false){
    close_second_window();
    close_window();

    if (update){
        get_page_data();
    }
}

function close_window(){
    overlay.remove();
    return false;
}

function close_second_window(){
    second_overlay.remove();
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
        }else if (data.status === "success"){
            let container = document.getElementById("container_overlay");
            container.innerHTML = text;
            Object.keys(replacements).forEach((item) => {
                container.querySelector("." + item).textContent = replacements[item];
            });
        }else if (data.status === "invalid-credentials"){
            let container = document.getElementById("container_overlay");
            container.innerHTML = `<h1>Credenciales invalidas</h1>
                <p>Se han ingresado credenciales incorrectas, verifique que el usuario y la contraseña se hayan escrito correctamente.</p>
                <button type="cancel" class="temp_button">Cerrar</button>`;
            let temp = container.querySelector(".temp_button");
            temp.user = data.user;
            temp.pass = data.pass;
            temp.addEventListener("click", function (){
                return restaurar_contrasena(this.user, this.pass);
            });
        }else if (data.status === "inexistent-user"){
            let container = document.getElementById("container_overlay");
            container.innerHTML = `<h1>Usuario inexistente</h1>
                <p>El usuario ingresado no existe, verifique que haya escrito bien el usuario y la contraseña.</p>
                <button type="cancel" class="temp_button">Cerrar</button>`;
            let temp = container.querySelector(".temp_button");
            temp.user = data.user;
            temp.pass = data.pass;
            temp.addEventListener("click", function (){
                return restaurar_contrasena(this.user, this.pass);
            });
        }else if (data.status === "error"){
            let container = document.getElementById("container_overlay");
            container.innerHTML = `<h1>Error del servidor</h1>
                <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button type="cancel" onclick="return close_window()">Volver</button>`;
            container.querySelector(".temp_p").appendChild(document.createTextNode(data.message));
        }
    });
}

function modify_user(){
    document.getElementById("book_leftside").innerHTML = `<p id="bloqueado_p">BLOQUEADO</p>
        <div style="margin: max(1vw, 5px) 0;"><image id="user_image" style="margin-top: 0;" class="user_image"></div>
        <div style="margin: max(1vw, 5px) 0;"><p data style="display:inline; margin"><b>Nombre de usuario: </b></p><input style="width: 30%" id="usuario" type="text"></div>
        <div style="margin: max(1vw, 5px) 0;"><p data style="display:inline;"><b>Nombre: </b></p><input style="width: 60%" id="nombre" type="text"></div>
        <div style="margin: max(1vw, 5px) 0;"><p data style="display:inline;"><b>Apellido Paterno: </b></p><input style="width: 38%" id="apeP" type="text"></div>
        <div style="margin: max(1vw, 5px) 0;"><p data style="display:inline;"><b>Apellido Materno: </b></p><input style="width: 36%" id="apeM" type="text"></div>
        <div style="margin: max(1vw, 5px) 0;"><p data style="display:inline;"><b>Genero: </b></p>
        <div style="display:inline-block; width: 66%;">
            <select id="genero" placeholder="Género...">
                <option value="">Selecciona una opción...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
            </select>
        </div></div>
        <p data id="prestamos_disponibles"><b>No. prestamos disponibles: </b></p>
        <button style="margin: 0 max(1vw, 5.5px)" onclick="guardar_cambios()">Guardar</button>`;
    document.getElementById("book_rightside").innerHTML = `<button style="padding-left:1vw; padding-right:1vw; margin-top: 1em; opacity: 0;" onclick="restaurar_contrasena()" disabled>Restaurar contraseña</button>
        <h1 class="student2"><b id="tipo_usuario"></b></h1>
        <p data style="margin: max(1.5vw, 9px) 0 0 0"><b id="numero_texto"></b></p>
        <input style="wdith:72%" type="number" id="numero">
        <p data style="margin: max(1.5vw, 9px) 0 0 0"><b id="tipo_carrera"></b></p>
        <input style="wdith:72%" type="text" id="carrera">
        <p data id="semestre_texto"><b>Semestre: </b><input style="width:40%" type="number" id="semestre">
        <p data id="prestados"><b>Libros prestados: </b></p>
        <button style="margin: 0 max(1vw, 5.5px)" onclick="update_page_data()">Cancelar</button>`;
    let temp = document.getElementById("user_image");
    temp.src = "../images/profile" + datos["Genero"] + ".png";
    if (bloqueado){
        temp = document.getElementById("bloqueado_p");
        temp.style = "opacity: 0";
    }
    temp = document.getElementById("usuario");
    temp.value = datos["NombreUsuario"];
    temp = document.getElementById("nombre");
    temp.value = datos["Nombre"];
    temp = document.getElementById("apeP");
    temp.value = ddatos["ApellidoPaterno"];
    temp = document.getElementById("apeM");
    temp.value = datos["ApellidoMaterno"];
    temp = document.getElementById("prestamos_disponibles");
    temp.appendChild(document.createTextNode(datos["PrestamosDisponibles"]));
    temp = document.getElementById("tipo_usuario");
    temp.textContent = ((estudiante) ? "ESTUDIANTE" : "DOCENTE");
    temp = document.getElementById("numero_texto");
    temp.textContent = "No. de " + ((estudiante) ? "control" : "tarjeta") + ":";
    temp = document.getElementById("numero");
    temp.value = ((estudiante) ? datos["NoControl"] : datos["NoTarjeta"]);
    temp = document.getElementById("tipo_carrera");
    temp.textContent = ((estudiante) ? "Carrera" : "Departamento") + ":";
    temp = document.getElementById("carrera");
    temp.value = ((estudiante) ? datos["Carrera"] : datos["Departamento"]);
    let temp2 = document.getElementById("semestre");
    if (!estudiante){
        temp = document.getElementById("semestre_texto");
        temp.style = "opacity: 0";
        temp2.style = "opacity: 0";
        temp2.disabled = true;
    }
    temp2.value = datos["Semestre"];
    temp = document.getElementById("prestados");
    temp.appendChild(document.createTextNode(datos["Prestados"]));
    genero_combobox = $('#genero').selectize({
        sortField: 'text',
        normalize: true,
        plugins: ['restore_on_backspace'],
        onDelete: function () {
            return false;
        }
    })[0].selectize;
    genero_combobox.setValue(datos["Genero"]);
}

function guardar_cambios(){
    open_overlayed_window();
    let container = document.getElementById("container_overlay");
    container.innerHTML = `<h1>Confirmar acción</h1>
        <p class="temp_p"></p>
        <button style="margin: 0 max(1vw, 5.5px)" onclick="efectuar_cambios()">Guardar</button>
        <button style="margin: 0 max(1vw, 5.5px)" onclick="close_window()">Cancelar</button>`;
    container.querySelector(".temp_p").textContent = "Esta por guardar los cambios hechos al usuario: " + document.getElementById("nombre").value + " " + document.getElementById("apeP").value + " " + document.getElementById("apeM").value;
}

function efectuar_cambios(){
    var dict = {
        "id": urlParams.get("id"),
        "usuario": document.getElementById("usuario").value,
        "nombre": document.getElementById("nombre").value,
        "apeP": document.getElementById("apeP").value,
        "apeM": document.getElementById("apeM").value,
        "genero": genero_combobox.getValue(),
        "numero": document.getElementById("numero").value,
        "carrera": document.getElementById("carrera").value,
        "semestre": document.getElementById("semestre").value,
        "estudiante": estudiante
    }

    var formData = new FormData();
    formData.append("type", "update usuario");
    formData.append("data", JSON.stringify(dict));

    send_query("<h1>Cambios guardados</h1><p>Los cambios hechos en el usuario han sido guardados exitosamente.</p><button type='cancel' onclick='return close_and_update()'>Cerrar</button>", formData);
}

function close_and_update(){
    close_window();
    get_page_data();
}

function delete_user(){
    open_overlayed_window();
    let container = document.getElementById("container_overlay");
    container.innerHTML = `<h1>Confirmar acción</h1>
        <p class="temp_p"></p>
        <p>¿Desea continuar?</p>
        <button onclick="proceed_delete()">Continuar</button>
        <button onclick="close_window()">Cancelar</button>`;
    container.querySelector(".temp_p").textContent = "Esta por borrar al usuario: " + datos["Nombre"] + " " + datos["ApellidoPaterno"] + " " + datos["ApellidoMaterno"];
}

function proceed_delete(){
    ids = [urlParams.get("id")];
    
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
            titlesDeletedIds = JSON.parse(data.usersDeleted);
            
            if (titlesDeletedIds.length > 0){
                document.getElementById("container_overlay").innerHTML = `<h1>Usuario eliminado</h1>
                    <p>El usuario fue eliminado con éxito.</p>
                    <button type='cancel' onclick='window.location.href="users"'>Salir</button>`;
            }else{
                document.getElementById("container_overlay").innerHTML = `<h1>Usuario NO eliminado</h1>
                    <p>El usuario no se puede eliminar debido a que tiene prestamos pendientes o multas pendientes, hasta que sean resueltas el usuario no puede borrarse.</p>
                    <button type='cancel' onclick='close_window()'>Salir</button>`;
            }
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

function user_block(){
    today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    today.setDate(today.getDate() + 1);

    open_overlayed_window();
    if (bloqueado){
        fin = new Date(datos["FechaFin"] + "T23:59:59");
        let container = document.getElementById("container_overlay");
        container.innerHTML = `<h1>Confirmar acción</h1>
            <p>Esta por desbloquear al usuario: <b class="temp_b0"></b> el cual esta programado para ser desbloqueado automaticamente para el final de la fecha: <b class="temp_b1"></b>.</p>
            <p>¿Desea continuar?</p>
            <button type="submit" onclick="return proceed_block()">Continuar</button>
            <button type="cancel" onclick="return close_window()">Cancelar</button>`;
        container.querySelector(".temp_b0").textContent = datos["Nombre"] + " " + datos["ApellidoPaterno"] + " " + datos["ApellidoMaterno"];
        container.querySelector(".temp_b1").textContent = format_date(fin);
    }else{
        let container = document.getElementById("container_overlay");
        container.innerHTML = `<h1>Confirmar acción</h1>
            <p>Esta por bloquear al usuario: <b class="temp_b"></b>, seleccione la fecha de desbloqueo y escriba una razón del bloqueo.</p>
            <form method="POST" id="form_bloqueo">
                <div class="vertical_spacing">
                    <label for="fecha_bloqueo">Fecha desbloqueo: </label>
                    <input type="date" id="fecha_bloqueo" placeholder="Fecha..." required>
                </div>
                <div>
                    <label>Razón:</label>
                </div>
                <div>
                    <textarea rows="4" style="resize: none; width: 70%;" maxlength="255" id="razon_bloqueo" placeholder="Razón..." required></textarea>
                </div>
                <button type="submit" onclick="return proceed_block()">Continuar</button>
                <button type="cancel" onclick="return close_window()">Cancelar</button>
            </form>`;
        container.querySelector(".temp_b").textContent = datos["Nombre"] + " " + datos["ApellidoPaterno"] + " " + datos["ApellidoMaterno"];
        document.getElementById("form_bloqueo").onsubmit = form_prevent;
        document.getElementById("fecha_bloqueo").min = today.toISOString().split("T")[0];
    }
}

function format_date(today){
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
}

function proceed_block(){
    if (bloqueado){
        var formData = new FormData();
        formData.append("type", "bloqueo");
        formData.append("id", urlParams.get("id"));

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
                document.getElementById("container_overlay").innerHTML = `<h1>Usuario desbloqueado</h1>
                    <p>El usuario ha sido desbloqueado exitosamente.</p>
                    <button type='cancel' onclick='return close_and_update()'>Cerrar</button>`;
            }else if (data.status === "error"){
                let container = document.getElementById("container_overlay");
                container.innerHTML = `<h1>Error del servidor</h1>
                    <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                    <button type="cancel" onclick="return close_window()">Volver</button>`;
                container.querySelector(".temp_p").appendChild(document.createTextNode(data.message));
            }
        });
    }else{
        fecha = document.getElementById("fecha_bloqueo").value;
        razon = document.getElementById("razon_bloqueo").value;

        if (fecha === "" || razon === ""){
            return true;
        }

        final = new Date(fecha + "T23:59:59")
        today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
        var dict = {
            "fin": fecha,
            "razon": razon,
            "inicio": today.toISOString().split('T')[0],
            "id": urlParams.get("id")
        }

        var formData = new FormData();
        formData.append("type", "bloqueo");
        formData.append("data", JSON.stringify(dict));

        var replacements = {
            "temp_b1": format_date(today),
            "temp_b2": dict["razon"],
            "temp_b3": format_date(final)
        }
        
        send_query("<h1>Usuario bloqueado</h1><p>El usuario ha sido bloqueado con la fecha: <b class='temp_b1'></b> bajo la siguiente razón:</p><p><b class='temp_b2'></b></p><p>Será desbloqueado automaticamente para la fecha: <b class='temp_b3'></b></p><button type='cancel' onclick='return close_and_update()'>Cerrar</button>", formData, replacements);
    }
}

function restaurar_contrasena(usuario="", contrasena=""){
    if (usuario === "" && contrasena === ""){
        open_overlayed_window();
    }
    let container = document.getElementById("container_overlay");
    container.innerHTML = `<h1>Restaurar contraseña</h1>
        <p class="temp_p">Esta por restaurar la contraseña del usuario: </p>
        <p>Para continuar debe verificar su identidad ingresando su usuario y contraseña.</p>
        <form method="POST" id="pass_form">
            <div class="vertical_spacing">
                <label for="usuario">Usuario: </label>
                <input id="usuario" autocomplete="username" type="text" required>
            </div>
            <div class="vertical_spacing">
                <label for="contrasena">Contraseña: </label>
                <input id="contrasena" autocomplete="current-password" type="password" required>
            </div>
            <button onclick="autenticar()">Continuar</button>
            <button onclick="close_window()">Cancelar</button>
        </form>`;
    container.querySelector(".temp_p").appendChild(document.createTextNode(datos["Nombre"] + " " + datos["ApellidoPaterno"] + " " + datos["ApellidoMaterno"]));
    document.getElementById("pass_form").onsubmit = form_prevent;
    document.getElementById("usuario").value = usuario;
    document.getElementById("contrasena").value = contrasena;
}

function autenticar(){
    usuario = document.getElementById("usuario").value;
    pass = document.getElementById("contrasena").value;

    if (usuario === "" || pass === ""){
        return true;
    }

    var dict = {
        "usuario": usuario,
        "pass": pass,
        "id": urlParams.get("id"),
        "estudiante": estudiante
    }

    var formData = new FormData();
    formData.append("type", "contrasena restaurar");
    formData.append("data", JSON.stringify(dict));

    var replacements = {
        "temp_b1": datos["Nombre"] + " " + datos["ApellidoPaterno"] + " " + datos["ApellidoMaterno"] + " fue restaurada exitosamente.",
        "temp_b2": ((estudiante) ? datos["NoControl"] : datos["NoTarjeta"])
    }

    send_query("<h1>Contraseña restaurada</h1><p>La contraseña del usuario: <b class='temp_b1'></b></p><p>La nueva contraseña del usuario es su número de " + ((estudiante) ? "control" : "tarjeta") + " el cual es: <b class='temp_b2'></b></p><p>El usuario tendar que cambiar la contraseña al momento de iniciar sesión.</p><button onclick='close_window()'>Cerrar</button>", formData, replacements);
}

function update_page_data(){
    if (bloqueado){
        document.getElementById("content_div").style = "background-image: url('../images/UserCardRed.png');";
    }else{
        document.getElementById("content_div").style = "background-image: url('../images/UserCard.png');";
    }
    let leftside = document.getElementById("book_leftside");
    leftside.innerHTML = `<p class="temp_p1">BLOQUEADO</p>
        <image style="margin-top: 0;" class="user_image">
        <p data class="temp_p2"><b>Nombre de usuario: </b></p>
        <p data class="temp_p3"><b>Nombre: </b></p>
        <p data class="temp_p4"><b>Apellido Paterno: </b></p>
        <p data class="temp_p5"><b>Apellido Materno: </b></p>
        <p data class="temp_p6"><b>Genero: </b></p>
        <p data class="temp_p7"><b>No. prestamos disponibles: </b></p>
        <button style="padding-left:1vw; padding-right:1vw; margin: 0 max(1vw, 5.5px)" onclick="modify_user()">Modificar</button>
        <button class="temp_button" style="padding-left:1vw; padding-right:1vw; margin: 0 max(1vw, 5.5px)" onclick="user_block()"></button>`;
    let rightside = document.getElementById("book_rightside");
    rightside.innerHTML = `<button class="temp_button" style="padding-left:1vw; padding-right:1vw; margin-top: 1em" onclick="restaurar_contrasena()">Restaurar contraseña</button>
        <h1 class="student2"><b class="temp_b1"></b></h1>
        <p data style="margin: max(1.5vw, 9px) 0 0 0"><b class="temp_b2"></b></p>
        <p data class="temp_p1" style="margin: 0 0 max(1.5vw, 9px) 0"></p>
        <p data style="margin: max(1.5vw, 9px) 0 0 0"><b class="temp_b3"></b></p>
        <p data class="temp_p2" style="margin: 0 0 max(1.5vw, 9px) 0"></p>
        <p data class="temp_p3"><b>Semestre: </b></p>
        <p data class="temp_p4"><b>Libros prestados: </b></p>
        <button style="padding-left:1vw; padding-right:1vw; margin: 0 max(1vw, 5.5px)" onclick="delete_user()">Eliminar</button>
        <button style="padding-left:1vw; padding-right:1vw; margin: 0 max(1vw, 5.5px)" onclick="history.back()">Volver</button>`;
    if (bloqueado){
        rightside.querySelector(".temp_button").disabled = true;
    }else{
        leftside.querySelector(".temp_p1").style = "opacity: 0;";
    }
    leftside.querySelector(".user_image").src = "../images/profile" + datos["Genero"] + ".png";
    leftside.querySelector(".temp_p2").appendChild(document.createTextNode(datos["NombreUsuario"]));
    leftside.querySelector(".temp_p3").appendChild(document.createTextNode(datos["Nombre"]));
    leftside.querySelector(".temp_p4").appendChild(document.createTextNode(datos["ApellidoPaterno"]));
    leftside.querySelector(".temp_p5").appendChild(document.createTextNode(datos["ApellidoMaterno"]));
    leftside.querySelector(".temp_p6").appendChild(document.createTextNode(((datos["Genero"] === "M") ? "Masculino" : "Femenino")));
    leftside.querySelector(".temp_p7").appendChild(document.createTextNode(datos["PrestamosDisponibles"]));
    leftside.querySelector(".temp_button").textContent = ((bloqueado) ? "Desbloquear" : "Bloquear");
    rightside.querySelector(".temp_b1").textContent = ((estudiante) ? "ESTUDIANTE" : "DOCENTE");
    rightside.querySelector(".temp_b2").textContent = "No. de " + ((estudiante) ? "control" : "tarjeta") + ":";
    rightside.querySelector(".temp_p1").textContent = ((estudiante) ? datos["NoControl"] : datos["NoTarjeta"]);
    rightside.querySelector(".temp_b3").textContent = ((estudiante) ? "Carrera" : "Departamento") + ":";
    rightside.querySelector(".temp_p2").textContent = ((estudiante) ? datos["Carrera"] : datos["Departamento"]);
    let temp = rightside.querySelector(".temp_p3");
    if (!estudiante){
        temp.style = "opacity: 0";
    }
    temp.appendChild(document.createTextNode(datos["Semestre"]));
    rightside.querySelector(".temp_p4").appendChild(document.createTextNode(datos["Prestados"]));
}

function get_page_data(){
    var formData = new FormData();

    formData.append("type", "vista usuario");
    formData.append("IDUsuario", urlParams.get("id"));
    
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
        datos = JSON.parse(data.data);
        inicio = new Date(datos["FechaInicio"] + "T00:00:00");
        fin = new Date(datos["FechaFin"] + "T23:59:59");
        today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
        bloqueado = true;
        estudiante = false;

        if (datos["FechaInicio"] === null || today > fin){
            bloqueado = false;
        }
        
        if (datos["NoControl"] !== null){
            estudiante = true;
        }

        update_page_data();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    urlParams = new URLSearchParams(window.location.search);

    get_page_data();
});