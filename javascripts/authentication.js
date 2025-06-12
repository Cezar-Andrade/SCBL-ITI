function pass_form_prevent(e){
    e.preventDefault();
}

function open_pass_overlayed_window(){
    pass_overlay = document.createElement("div");
    pass_overlay.setAttribute("id", "pass_overlayed_window");
    pass_overlay.setAttribute("class", "overlayed_window");
    pass_overlay.innerHTML = "<div id='pass_container_overlay' class='second_container_overlay'></div>";
    document.body.appendChild(pass_overlay);
}

function pass_close_window(){
    pass_overlay.remove();
    return false;
}

function set_password_forced(){
    new_password = document.getElementById("new_password_forced").value;
    confirm_password = document.getElementById("confirm_password_forced").value;

    if (new_password === "" || confirm_password === ""){
        return true;
    }else if (new_password !== confirm_password){
        let container = document.getElementById("pass_container_overlay");
        container.innerHTML = `<h1>Contraseñas no coinciden</h1>
            <p>Las contraseñas nuevas no coinciden, verifique que las haya escrito bien y vuelva a intentarlo.</p>
            <button class="temp_button" yellow>Volver</button>`;
        let temp = container.querySelector(".temp_button");
        temp.new_password = new_password;
        temp.confirm_password = confirm_password;
        temp.addEventListener("click", function (){
            change_password_forced(this.new_password, this.confirm_password, false);
        });
        return false;
    }else if (new_password === numero){
        let container = document.getElementById("pass_container_overlay");
        container.innerHTML = `<h1>Contraseña invalida</h1>
            <p>La contraseña nueva no puede ser el número de control o número de tarjeta, escoja otra contraseña más segura.</p>
            <button class="temp_button" yellow>Volver</button>`;
        let temp = container.querySelector(".temp_button");
        temp.new_password = new_password;
        temp.confirm_password = confirm_password;
        temp.addEventListener("click", function (){
            change_password_forced(this.new_password, this.confirm_password, false);
        });
        return false;
    }

    var formData = new FormData();
    formData.append("type", "contrasena forzada");
    formData.append("new_pass", new_password);

    pass_send_query("<h1>Contraseña cambiada</h1><p>La contraseña de tu cuenta ha sido cambiada con éxito.</p><button yellow type='cancel' onclick='pass_close_window()'>Cerrar</button>", confirm_password, formData);
}

function pass_send_query(text, confirm_password, formData){
    document.getElementById("pass_container_overlay").innerHTML = `<h1>Procesando...</h1>
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
            let container = document.getElementById("pass_container_overlay");
            container.innerHTML = `<h1>Usuario no autenticado</h1>
                <p>El usuario no ha iniciado sesión o se cerro la sesión, vuelva a iniciar sesión y vuelva a intentarlo.</p>
                <button class="temp_button" yellow type="cancel">Cerrar</button>`;
            let temp = container.querySelector(".temp_button");
            temp.new_password = formData.get("new_pass");
            temp.confirm_password = confirm_password;
            temp.addEventListener("click", function (){
                change_password_forced(this.new_password, this.confirm_password, false);
            });
        }else if (data.status === "success"){
            document.getElementById("pass_container_overlay").innerHTML = text;
        }else if (data.status === "error"){
            let container = document.getElementById("pass_container_overlay");
            container.innerHTML = `<h1>Error del servidor</h1>
                <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button class="temp_button" yellow type="cancel">Volver</button>`;
            container.querySelector(".temp_p").appendChild(document.createTextNode(data.message));
            let temp = container.querySelector(".temp_button");
            temp.new_pass = formData.get("new_pass");
            temp.confirm_password = confirm_password;
            temp.addEventListener("click", function (){
                change_password_forced(this.new_pass, this.confirm_password, false);
            });
        }
    });
}

function change_password_forced(a="", b="", window=true){
    if (window){
        open_pass_overlayed_window();
    }
    document.getElementById("pass_container_overlay").innerHTML = `<h1>Cambia la contraseña</h1>
        <p>La contraseña actual consiste del número de contro o número de tarjeta, para asegurar que solo usted pueda acceder a su cuenta es necesario cambiar la contraseña a una que no sea dichos números.</p>
        <p>Por favor ingrese los datos necesarios para cambiar su contraseña.</p>
        <form method="POST" id="change_password_forced_form">
            <div class="vertical_spacing">
                <div>
                    <label for="new_password">Nueva contraseña: </label>
                    <input style="width:50%" type="password" autocomplete="new-password" id="new_password_forced" name="new_password" placeholder="Nueva contraseña..." required>
                </div>
                <div>
                    <label for="confirm_password">Confirmar contraseña: </label>
                    <input style="width:42.5%" type="password" autocomplete="off" id="confirm_password_forced" name="confirm_password" placeholder="Confirmar contraseña..." required>
                </div>
            </div>
            <button yellow type="submit" onclick="set_password_forced()">Cambiar</button>
        </form>`;
    document.getElementById("change_password_forced_form").onsubmit = pass_form_prevent;
    document.getElementById("new_password_forced").value = a;
    document.getElementById("confirm_password_forced").value = b;
}

document.addEventListener("DOMContentLoaded", () => {
    fetch("../php/authenticate.php")
    .then(response => {
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        } else {
            return response.text().then(text => { throw new Error(text) });
        }
    })
    .then(data => {
        if (data.status === "change-pass"){
            numero = data.numero;
            change_password_forced();
        }else if (data.status === "not-valid"){
            window.location.href = "../index.html";
        }else if (data.status === "error"){
            let container = document.getElementById("content_div");
            container.innerHTML = "<h1 style='font-size: 34px;'>Error del Servidor</h1><p class='temp_p'>Parece que sucedio un error del lado del servidor, la siguiente información se recabo al respecto, favor de comunicarlo al Centro de Información:<br></p>";
            container.querySelector(".temp_p").appendChild(document.createTextNode(data.message));
        }
    })
    .catch(error => {
        let container = document.getElementById("content_div");
        container.innerHTML = "<h1 style='font-size: 34px;'>Error del Servidor</h1><p class='temp_p'>Parece que sucedio un error del lado del servidor, la siguiente información se recabo al respecto, favor de comunicarlo al Centro de Información:<br></p>";
        container.querySelector(".temp_p").appendChild(document.createTextNode(error));
    });
});