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
                change_password(this.usuario, this.password, this.new_password, this.confirm_password, false);
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
        
        let leftside = document.getElementById("book_leftside");
        leftside.innerHTML = `<image style="width:max(11vw, 61.2px);height:max(11vw, 61.2px);" class="user_image">
            <p class="temp_p1"><b>Nombre de usuario: </b></p>
            <p class="temp_p2"><b>Nombre: </b></p>
            <p class="temp_p3"><b>Apellido paterno: </b></p>
            <p class="temp_p4"><b>Apellido materno: </b></p>
            <p class="temp_p5"><b>Genero: </b></p>`;
        let rightside = document.getElementById("book_rightside");
        rightside.innerHTML = `<h1 class="student"><b>DOCENTE</b></h1>
            <p><b>No. de tarjeta:</b></p>
            <p class="temp_p1"></p>
            <p><b>Departamento:</b></p>
            <p class="temp_p2"></p>`;
        leftside.querySelector(".user_image").src = "../images/profile" + datos["Genero"] + ".png";
        leftside.querySelector(".temp_p1").appendChild(document.createTextNode(datos["NombreUsuario"]));
        leftside.querySelector(".temp_p2").appendChild(document.createTextNode(datos["Nombre"]));
        leftside.querySelector(".temp_p3").appendChild(document.createTextNode(datos["ApellidoPaterno"]));
        leftside.querySelector(".temp_p4").appendChild(document.createTextNode(datos["ApellidoMaterno"]));
        leftside.querySelector(".temp_p5").appendChild(document.createTextNode(((datos["Genero"] === "M") ? "Masculino" : "Femenino")));
        rightside.querySelector(".temp_p1").textContent = datos["NoTarjeta"];
        rightside.querySelector(".temp_p2").textContent = datos["Departamento"];
    });
}

document.addEventListener("DOMContentLoaded", () => {
    get_page_data();
});