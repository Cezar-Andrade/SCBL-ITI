function form_prevent(e){
    e.preventDefault();
}

function format_date(today){
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
}

function login(){
    const usuario = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);

    if (usuario === "" || pass === ""){
        return true;
    }

    var formData = new FormData();
    formData.append("username", usuario);
    formData.append("pass", pass);
    formData.append("fecha", today.toISOString().split('T')[0]);

    fetch("php/login.php", {
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
        if (data.status === "valid"){
            window.location.href = data.redirect;
        }else if (data.status === "blocked-user"){
            inicio = new Date(data.inicio + "T00:00:00");
            fin = new Date(data.fin + "T00:00:00");
            open_central_window(`<h1>Cuenta bloqueada</h1>
                <p>Su cuenta se encuentra bloqueada desde <b class="temp_b1"></b> y se desbloqueará automaticamente hasta la fecha <b class="temp_b2"></b>.</p>
                <p>La razón por la que se bloqueo la cuenta es la siguiente: <b class="temp_b3"></b></p>
                <p>Consulte al centro de información para cualquier queja o duda al respecto.</p>
                <div class='horizontal_alignment'>
                    <button type='cancel' id='cancel' onclick='close_central_window()'>Cerrar</button>
                </div>`);
            let container = document.getElementById("window_container");
            container.querySelector(".temp_b1").textContent = format_date(inicio);
            container.querySelector(".temp_b2").textContent = format_date(fin);
            container.querySelector(".temp_b3").textContent = data.razon;
        }else if (data.status === "not-valid"){
            open_central_window(`<h1>Credenciales incorrectas</h1>
                <p>La contraseña ingresada no coincide con la cuenta de usuario, verifique que los haya escrito correctamente e intentelo de nuevo.<br><br>
                Si el problema persiste, consulte con el Centro de Información al respecto.</p>
                <div class='horizontal_alignment'>
                    <button type='cancel' id='cancel' onclick='close_central_window()'>Cerrar</button>
                </div>`);
        }else if (data.status === "user-does-not-exist"){
            open_central_window(`<h1>Usuario inexistente</h1>
                <p>El usuario que ingresó no existe, verifique que lo haya escrito correctamente o consulte con el Centro de Información al respecto para que le hagan una cuenta.</p>
                <div class='horizontal_alignment'>
                    <button type='cancel' id='cancel' onclick='close_central_window()'>Cerrar</button>
                </div>`);
        }else if (data.status === "not-allowed"){
            open_central_window(`<h1>Usuario no permitido</h1>
                <p>El usuario que ingreso no tiene permisos para acceder al sistema.</p>
                <div class='horizontal_alignment'>
                    <button type='cancel' id='cancel' onclick='close_central_window()'>Cerrar</button>
                </div>`);
        }else if (data.status === "error"){
            open_central_window(`<h1>Error del servidor</h1>
                <p class="temp_p">Parece que sucedio un error del lado del servidor, la siguiente información se recabo al respecto, favor de comunicarlo al Centro de Información:<br></p>
                <div class='horizontal_alignment'>
                    <button type='cancel' id='cancel' onclick='close_central_window()'>Cerrar</button>
                </div>`);
            document.getElementById("window_container").querySelector(".temp_p").appendChild(document.createTextNode(data.message));
        }
    })
    .catch((error) => {
        open_central_window(`<h1>Error del Servidor</h1>
            <p class="temp_p">Parece que sucedio un error del lado del servidor, la siguiente información se recabo al respecto, favor de comunicarlo al Centro de Información:<br></p>
            <div class='horizontal_alignment'>
                <button type='cancel' id='cancel' onclick='close_central_window()'>Cerrar</button>
            </div>`);
        document.getElementById("window_container").querySelector(".temp_p").appendChild(document.createTextNode(error));
    });
}

function close_central_window(){
    document.getElementById("password-forgot").onclick = open_recovery_window;
    document.getElementById("password").disabled = false;
    document.getElementById("username").disabled = false;
    document.getElementById("login").disabled = false;
    document.getElementById("window_container").remove();
}

function open_central_window(innerHTML){
    document.getElementById("password-forgot").onclick = void(0);
    document.getElementById("password").disabled = true;
    document.getElementById("username").disabled = true;
    document.getElementById("login").disabled = true;
    
    const recovery_window = document.createElement("div");
    recovery_window.setAttribute("id", "window_container");
    recovery_window.setAttribute("class", "recovery_window");
    recovery_window.innerHTML = innerHTML;
    
    document.body.append(recovery_window);
}

function open_recovery_window(){
    open_central_window(`<h1>Pasos para restaurar contraseña</h1>
        <p>Para que le restauren la contraseña a su cuenta, por favor comuniquese con el jefe del centro de información.</p>
        <div class='horizontal_alignment'>
            <button type='cancel' id='cancel' onclick='close_central_window()'>Cerrar</button>
        </div>`);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("password-forgot").onclick = open_recovery_window;
    document.getElementById("login").onclick = login;
    document.getElementById("login_form").onsubmit = form_prevent;
});