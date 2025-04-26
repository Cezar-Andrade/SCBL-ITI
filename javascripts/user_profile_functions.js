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

function close_window(){
    overlay.remove();
    return false;
}

function set_password(){
    usuario = document.getElementById("usuario").value;
    password = document.getElementById("password").value;
    new_password = document.getElementById("new_password").value;
    confirm_password = document.getElementById("confirm_password").value;
    numero = ((estudiante) ? datos["NoControl"] : datos["NoTarjeta"]);

    if (usuario === "" || password === "" || new_password === "" || confirm_password === ""){
        return true;
    }else if (new_password !== confirm_password){
        document.getElementById("container_overlay").innerHTML = `<h1>Contraseñas no coinciden</h1>
            <p>Las contraseñas nuevas no coinciden, verifique que las haya escrito bien y vuelva a intentarlo.</p>
            <button onclick="change_password('` + usuario + `', '` + password + `', '` + new_password + `', '` + confirm_password + `', false)">Volver</button>`;
        return false;
    }else if (new_password === password){
        document.getElementById("container_overlay").innerHTML = `<h1>Mismas contraseñas</h1>
            <p>La contraseña nueva que intentas colocar es la misma contraseña actual que estas colocando para autenticarte, tienen que ser diferentes.</p>
            <button onclick="change_password('` + usuario + `', '` + password + `', '` + new_password + `', '` + confirm_password + `', false)">Volver</button>`;
        return false;
    }else if (new_password === numero){
        document.getElementById("container_overlay").innerHTML = `<h1>Contraseña invalida</h1>
            <p>La contraseña nueva no puede ser el número de control o número de tarjeta, escoja otra contraseña más segura.</p>
            <button onclick="change_password('` + usuario + `', '` + password + `', '` + new_password + `', '` + confirm_password + `', false)">Volver</button>`;
        return false;
    }

    var formData = new FormData();
    formData.append("type", "contrasena");
    formData.append("usuario", usuario);
    formData.append("pass", password);
    formData.append("new_pass", new_password);

    send_query("<h1>Contraseña cambiada</h1><p>La contraseña de tu cuenta ha sido cambiada con éxito.</p>", confirm_password, formData);
}

function send_query(text, confirm_password, formData){
    document.getElementById("container_overlay").innerHTML = `<h1>Procesando...</h1>
        <p>Por favor espere...</p>`;
    
    fetch("../php/user_insert_queries.php", {
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
        }else if (data.status == "not-valid"){
            document.getElementById("container_overlay").innerHTML = `<h1>Credenciales incorrectas</h1>
                <p>El usuario y contraseña no coinciden con los datos de la cuenta actual, verifique que los haya escrito correctamente.</p>
                <button onclick="change_password('` + formData.get("usuario") + `', '` + formData.get("pass") + `', '` + formData.get("new_pass") + `', '` + confirm_password + `', false)">Volver</button>`;
        }else if (data.status === "success"){
            container = document.getElementById("container_overlay");
            container.innerHTML = text + "<button type='cancel' onclick='return close_window()'>Cerrar</button>";
        }else if (data.status === "error"){
            document.getElementById("container_overlay").innerHTML = `<h1>Error del servidor</h1>
                <p>Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br>
                ` + data.message + `</p>
                <button type="cancel" onclick="return close_window()">Volver</button>`;
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
                    <input style="width:70%" type="text" autocomplete="username" id="usuario" name="usuario" placeholder="Nombre de usuario..." value="` + a + `" required>
                </div>
                <div>
                    <label for="password">Contraseña: </label>
                    <input style="width:62.5%" type="password" autocomplete="current-password" id="password" name="password" placeholder="Contraseña..." value="` + b + `" required>
                </div>
            </div>
            <div class="vertical_spacing">
                <div>
                    <label for="new_password">Nueva contraseña: </label>
                    <input style="width:50%" type="password" id="new_password" autocomplete="new-password" name="new_password" placeholder="Nueva contraseña..." value="` + c + `" required>
                </div>
                <div>
                    <label for="confirm_password">Confirmar contraseña: </label>
                    <input style="width:42.5%" type="password" id="confirm_password" autocomplete="off" name="confirm_password" placeholder="Confirmar contraseña..." value="` + d + `" required>
                </div>
            </div>
            <div class="horizontal_alignment">
                <button type="submit" onclick="return set_password()">Cambiar</button>
                <button type="cancel" onclick="close_window()">Cerrar</button>
            </div>
        </form>`;
    document.getElementById("change_password_form").onsubmit = form_prevent;
}

function get_page_data(){
    var formData = new FormData();

    formData.append("type", "profile_user");

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
        
        document.getElementById("book_leftside").innerHTML = `<image style="width:max(11vw, 61.2px);height:max(11vw, 61.2px);" src="../images/ITI.png" class="user_image">
            <p style="margin-bottom:0;"><b>Nombre de usuario: </b>` + datos["NombreUsuario"] + `</p>
            <p style="margin:0;"><b>Nombre: </b>` + datos["Nombre"] + `</p>
            <p style="margin:0;"><b>Apellido paterno: </b>` + datos["ApellidoPaterno"] + `</p>
            <p style="margin:0;"><b>Apellido materno: </b>` + datos["ApellidoMaterno"] + `</p>
            <p style="margin:0;"><b>Genero: </b>` + ((datos["Genero"] === "M") ? "Masculino" : "Femenino") + `</p>
            <p><b>No. de prestamos disponibles: </b>` + datos["PrestamosDisponibles"] + `</p>`;
        document.getElementById("book_rightside").innerHTML = `<h1 class="student"><b>` + ((estudiante) ? "ESTUDIANTE" : "DOCENTE") + `</b></h1>
            <p style="margin-bottom:0;"><b>No. de ` + ((estudiante) ? "control" : "tarjeta") + `:</b></p>
            <p style="margin-top:0;">` + ((estudiante) ? datos["NoControl"] : datos["NoTarjeta"]) + `</p>
            <p style="margin-bottom:0;"><b>Departamento:</b></p>
            <p style="margin-top:0;">` + ((estudiante) ? datos["Carrera"] : datos["Departamento"]) + `</p>
            <p style="margin:0;" ` + ((estudiante) ? "" : "style='opacity:0'") + `><b>Semestre: </b>` + datos["Semestre"] + `</p>
            <p><b>Libros prestados: </b>` + datos["Prestados"] + `</p>`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    get_page_data();
});