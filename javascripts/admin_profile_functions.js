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

function close_and_update(){
    close_window();
    get_page_data();
}

function close_window(){
    overlay.remove();
    return false;
}

function set_password(){
    usuario = document.getElementById("usuario").value;
    password = document.getElementById("password").value;
    new_password = document.getElementById("new_password").value;
    confirm_password = document.getElementById("confirm_password").value;

    if (usuario === "" || password === "" || new_password === "" || confirm_password === ""){
        return true;
    }else if (new_password !== confirm_password){
        let container = document.getElementById("container_overlay");
        container.innerHTML = `<h1>Contraseñas no coinciden</h1>
            <p>Las contraseñas nuevas no coinciden, verifique que las haya escrito bien y vuelva a intentarlo.</p>
            <button class="temp_button">Volver</button>`;
        let temp = container.querySelector(".temp_button");
        temp.usuario = usuario;
        temp.password = password;
        temp.new_password = new_password;
        temp.confirm_password = confirm_password;
        temp.addEventListener("click", function (){
            change_password(this.usuario, this.password, this.new_password, this.confirm_password, false);
        });
        return false;
    }else if (new_password === password){
        let container = document.getElementById("container_overlay");
        container.innerHTML = `<h1>Mismas contraseñas</h1>
            <p>La contraseña nueva que intentas colocar es la misma contraseña actual que estas colocando para autenticarte, tienen que ser diferentes.</p>
            <button class="temp_button">Volver</button>`;
        let temp = container.querySelector(".temp_button");
        temp.usuario = usuario;
        temp.password = password;
        temp.new_password = new_password;
        temp.confirm_password = confirm_password;
        temp.addEventListener("click", function (){
            change_password(this.usuario, this.password, this.new_password, this.confirm_password, false);
        });
        return false;
    }

    var formData = new FormData();
    formData.append("type", "contrasena");
    formData.append("usuario", usuario);
    formData.append("pass", password);
    formData.append("new_pass", new_password);

    send_query("<h1>Contraseña cambiada</h1><p>La contraseña de tu cuenta ha sido cambiada con éxito.</p><button type='cancel' onclick='return close_window()'>Cerrar</button>", confirm_password, formData);
}

function send_query(text, confirm_password, formData){
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
        }else if (data.status == "not-valid"){
            let container = document.getElementById("container_overlay")
            container.innerHTML = `<h1>Credenciales incorrectas</h1>
                <p>El usuario y contraseña no coinciden con los datos de la cuenta actual, verifique que los haya escrito correctamente.</p>
                <button class="temp_button">Volver</button>`;
            let temp = container.querySelector(".temp_button");
            temp.usuario = formData.get("usuario");
            temp.password = formData.get("pass");
            temp.new_password = formData.get("new_pass");
            temp.confirm_password = confirm_password;
            temp.addEventListener("click", function (){
                change_password(this.usuario, this.password);
            });
        }else if (data.status === "not-valid-2"){
            let container = document.getElementById("container_overlay")
            container.innerHTML = `<h1>Credenciales incorrectas</h1>
                <p>El usuario y contraseña no coinciden con los datos de la cuenta, verifique que los haya escrito correctamente.</p>
                <button class="temp_button">Volver</button>`;
            let temp = container.querySelector(".temp_button");
            temp.usuario = formData.get("username");
            temp.password = formData.get("pass");
            temp.addEventListener("click", function (){
                guardar_cambios(this.usuario, this.password, false);
            });
        }else if (data.status === "success"){
            container = document.getElementById("container_overlay");
            container.innerHTML = text;
        }else if (data.status === "error"){
            let container = document.getElementById("container_overlay");
            container.innerHTML = `<h1>Error del servidor</h1>
                <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button type="cancel" onclick="return close_window()">Volver</button>`;
            let temp = container.querySelector(".temp_p");
            temp.appendChild(document.createTextNode(data.message));
        }
    });
}

function change_password(a="", b="", c="", d="", window=true){
    if (window){
        open_overlayed_window();
    }
    document.getElementById("container_overlay").innerHTML = `<h1>Cambiar contraseña</h1>
        <p>Inserta tu nombre de usuario y contraseña actual para cambiar la contraseña.</p>
        <form method="POST" id="change_password_form">
            <div class="vertical_spacing">
                <div>
                    <label for="usuario">Usuario: </label>
                    <input style="width:70%" autocomplete="username" type="text" id="usuario" name="usuario" placeholder="Nombre de usuario..." required>
                </div>
                <div>
                    <label for="password">Contraseña: </label>
                    <input style="width:62.5%" type="password" autocomplete="current-password" id="password" name="password" placeholder="Contraseña..." required>
                </div>
            </div>
            <div class="vertical_spacing">
                <div>
                    <label for="new_password">Nueva contraseña: </label>
                    <input style="width:50%" type="password" id="new_password" autocomplete="new-password" name="new_password" placeholder="Nueva contraseña..." required>
                </div>
                <div>
                    <label for="confirm_password">Confirmar contraseña: </label>
                    <input style="width:42.5%" type="password" id="confirm_password" autocomplete="off" name="confirm_password" placeholder="Confirmar contraseña..." required>
                </div>
            </div>
            <div class="horizontal_alignment">
                <button type="submit" onclick="return set_password()">Cambiar</button>
                <button type="cancel" onclick="close_window()">Cerrar</button>
            </div>
        </form>`;
    document.getElementById("usuario").value = a;
    document.getElementById("password").value = b;
    document.getElementById("new_password").value = c;
    document.getElementById("confirm_password").value = d;
    document.getElementById("change_password_form").onsubmit = form_prevent;
}

function guardar_cambios(a="", b="", window=true){
    if (window){
        open_overlayed_window();
    }
    let container = document.getElementById("container_overlay");
    container.innerHTML = `<h1>Confirmar acción</h1>
        <p>Inserta tu nombre de usuario y contraseña actual para guardar los cambios hechos en su cuenta.</p>
        <form method="POST" id="authenticate_form">
            <div class="vertical_spacing">
                <div>
                    <label for="usuario">Usuario: </label>
                    <input style="width:70%" autocomplete="username" type="text" id="usuario_auth" name="usuario" placeholder="Nombre de usuario..." required>
                </div>
                <div>
                    <label for="password">Contraseña: </label>
                    <input style="width:62.5%" type="password" autocomplete="current-password" id="password" name="password" placeholder="Contraseña..." required>
                </div>
            </div>
            <div class="horizontal_alignment">
                <button type="submit" onclick="return efectuar_cambios()">Cambiar</button>
                <button type="cancel" onclick="close_window()">Cerrar</button>
            </div>
        </form>`;
    document.getElementById("usuario_auth").value = a;
    document.getElementById("password").value = b;
    document.getElementById("authenticate_form").onsubmit = form_prevent;
}

function efectuar_cambios(){
    usuario = document.getElementById("usuario_auth").value;
    password = document.getElementById("password").value;

    if (usuario === "" || password === ""){
        return true;
    }

    var dict = {
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
    formData.append("type", "update self admin");
    formData.append("data", JSON.stringify(dict));
    formData.append("username", usuario);
    formData.append("pass", password);

    send_query("<h1>Cambios guardados</h1><p>Los cambios hechos en el usuario han sido guardados exitosamente.</p><button type='cancel' onclick='return close_and_update()'>Cerrar</button>", "", formData);
}

function modify_user(){
    document.getElementById("book_leftside").innerHTML = `<image id="user_image" style="width:max(11vw, 61.2px);height:max(11vw, 61.2px);" class="user_image">
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
        </div></div>`;
    let rightside = document.getElementById("book_rightside");
    rightside.innerHTML = `<h1 class="student"><b class="temp_b1">DOCENTE</b></h1>
        <p data style="margin: max(1.5vw, 9px) 0 0 0"><b class="temp_b2">No. de tarjeta:</b></p>
        <input style="wdith:72%" type="text" id="numero">
        <p data style="margin: max(1.5vw, 9px) 0 0 0"><b class="temp_b3">Departamento:</b></p>
        <input style="wdith:72%" type="text" id="carrera">
        <p data id="semestre_texto"><b>Semestre: </b><input style="width:40%" type="number" id="semestre"></p>`;
    document.getElementById("buttons").innerHTML = `<button style="margin: 0 max(1vw, 5.5px)" onclick="guardar_cambios()">Guardar</button>
        <button style="margin: 0 max(1vw, 5.5px)" onclick="update_page_data()">Cancelar</button>`;
    let temp = document.getElementById("user_image");
    temp.src = "../images/profile" + datos["Genero"] + ".png";
    rightside.querySelector(".temp_b1").textContent = ((estudiante) ? "ESTUDIANTE" : "DOCENTE");
    rightside.querySelector(".temp_b2").textContent = ((estudiante) ? "No. de control:" : "No. de tarjeta:");
    rightside.querySelector(".temp_b3").textContent = ((estudiante) ? "Carrera:" : "Departamento:");
    if (!estudiante){
        document.getElementById("semestre").disabled = true;
        document.getElementById("semestre_texto").style = "opacity:0";
    }
    temp = document.getElementById("usuario");
    temp.value = datos["NombreUsuario"];
    temp = document.getElementById("nombre");
    temp.value = datos["Nombre"];
    temp = document.getElementById("apeP");
    temp.value = datos["ApellidoPaterno"];
    temp = document.getElementById("apeM");
    temp.value = datos["ApellidoMaterno"];
    temp = document.getElementById("numero");
    temp.value = ((estudiante) ? datos["NoControl"] : datos["NoTarjeta"]);
    temp = document.getElementById("carrera");
    temp.value = ((estudiante) ? datos["Carrera"] : datos["Departamento"]);
    temp = document.getElementById("semestre");
    temp.value = datos["Semestre"];
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

function update_page_data(){
    let leftside = document.getElementById("book_leftside");
    leftside.innerHTML = `<image style="width:max(11vw, 61.2px);height:max(11vw, 61.2px);" class="user_image">
        <p class="temp_p1"><b>Nombre de usuario: </b></p>
        <p class="temp_p2"><b>Nombre: </b></p>
        <p class="temp_p3"><b>Apellido paterno: </b></p>
        <p class="temp_p4"><b>Apellido materno: </b></p>
        <p class="temp_p5"><b>Genero: </b></p>`;
    let rightside = document.getElementById("book_rightside");
    rightside.innerHTML = `<h1 class="student"><b class="temp_b1"></b></h1>
        <p><b class="temp_b2"></b></p>
        <p class="temp_p1"></p>
        <p><b class="temp_b3"></b></p>
        <p class="temp_p2"></p>
        <p class="temp_p3"><b>Semestre: </b></p>`;
    document.getElementById("buttons").innerHTML = `<button id="modify" onclick="modify_user()">Modificar</button>
        <button id="contrasena" onclick="change_password()">Cambiar contraseña</button>
        <button id="back" onclick="window.location.href = 'menu'">Volver</button>`;
    leftside.querySelector(".user_image").src = "../images/profile" + datos["Genero"] + ".png";
    leftside.querySelector(".temp_p1").appendChild(document.createTextNode(datos["NombreUsuario"]));
    leftside.querySelector(".temp_p2").appendChild(document.createTextNode(datos["Nombre"]));
    leftside.querySelector(".temp_p3").appendChild(document.createTextNode(datos["ApellidoPaterno"]));
    leftside.querySelector(".temp_p4").appendChild(document.createTextNode(datos["ApellidoMaterno"]));
    leftside.querySelector(".temp_p5").appendChild(document.createTextNode(((datos["Genero"] === "M") ? "Masculino" : "Femenino")));
    rightside.querySelector(".temp_p1").textContent = ((estudiante) ? datos["NoControl"] : datos["NoTarjeta"]);
    rightside.querySelector(".temp_p2").textContent = ((estudiante) ? datos["Carrera"] : datos["Departamento"]);
    let temp = rightside.querySelector(".temp_p3");
    temp.appendChild(document.createTextNode(datos["Semestre"]));
    if (!estudiante){
        temp.style = "margin:0; opacity:0";
    }
    rightside.querySelector(".temp_b1").textContent = ((estudiante) ? "ESTUDIANTE" : "DOCENTE");
    rightside.querySelector(".temp_b2").textContent = ((estudiante) ? "No. de Control" : "No. de Tarjeta");
    rightside.querySelector(".temp_b3").textContent = ((estudiante) ? "Carrera" : "Departamento");
}

function get_page_data(){
    var formData = new FormData();

    formData.append("type", "profile");

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
        estudiante = (datos["NoControl"] !== null);
        
        update_page_data();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    get_page_data();
});