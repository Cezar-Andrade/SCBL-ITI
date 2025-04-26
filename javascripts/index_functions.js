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
            open_central_window(`<h1>Credenciales Incorrectas</h1>
                <p>La contraseña ingresada no coincide con la cuenta de usuario, verifique que los haya escrito correctamente e intentelo de nuevo.<br><br>
                Si el problema persiste, consulte con el Centro de Información al respecto.</p>
                <div class='horizontal_alignment'>
                    <button type='cancel' id='cancel' onclick='close_central_window()'>Cerrar</button>
                </div>`);
        }else if (data.status === "user-does-not-exist"){
            open_central_window(`<h1>Usuario Inexistente</h1>
                <p>El usuario que ingresó no existe, verifique que lo haya escrito correctamente o consulte con el Centro de Información al respecto para que le hagan una cuenta.</p>
                <div class='horizontal_alignment'>
                    <button type='cancel' id='cancel' onclick='close_central_window()'>Cerrar</button>
                </div>`);
        }else if (data.status === "error"){
            open_central_window(`<h1>Error del Servidor</h1>
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

function send_recovery_email(){
    const usuario = document.getElementById("username_recovery").value;
    const numero = document.getElementById("number_recovery").value;

    if (usuario === "" || numero === ""){
        return true;
    }else{
        document.getElementById("window_container").innerHTML = `<h1>Procesando...</h1>
            <p>Por favor espere...</p>`;
    }
    
    var formData = new FormData();
    formData.append("username", usuario);
    formData.append("nocontrol", numero);
    
    fetch("php/verify_and_send_email.php", {
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
            document.getElementById("window_container").innerHTML = `<h1>Correo Enviado</h1>
                <p>Un mensaje fue enviado a tu correo institucional para restaurar la contraseña, por favor revise su correo institucional.</p>
                <div class='horizontal_alignment'>
                    <button type='cancel' id='cancel' onclick='close_central_window()'>Cerrar</button>
                </div>`;
        }else if (data.status === "not-expired"){
            document.getElementById("window_container").innerHTML = `<h1>Petición Reciente</h1>
                <p>Ya haz solicitado una petición para restaurar tu contraseña recientemente, vuelve cuando se hayan cumplido 4 horas desde la última petición o consulte con el Centro de Información al respecto.</p>
                <div class='horizontal_alignment'>
                    <button type='cancel' id='cancel' onclick='close_central_window()'>Cerrar</button>
                </div>`;
        }else if (data.status === "not-valid"){
            document.getElementById("window_container").innerHTML = `<h1>Recuperar Contraseña</h1>
                <p style='color: red;'>El nombre de usuario no coincide con el número de control/tarjeta o no existe dicho usuario, verifique que haya escrito bien los datos.</p>
                <form method='POST'>
                    <div class='vertical_spacing'>
                        <label for='username'>Usuario:</label><br>
                        <input type='text' id='username_recovery' autocomplete="username" placeholder="Nombre de usuario..." required><br>
                    </div>
                    <div class='vertical_spacing'>
                        <label for='username'>No. de Control/Tarjeta:</label><br>
                        <input type='text' id='number_recovery' autocomplete="off" placeholder='########...' required><br>
                    </div>
                    <div class='horizontal_alignment'>
                        <button type='submit' id='recover' onclick='return send_recovery_email()'>Recuperar</button>
                        <button type='cancel' id='cancel' onclick='close_central_window()'>Cancelar</button>
                    </div>
                </form>`;
            document.getElementById("username_recovery").value = usuario;
            document.getElementById("number_recovery").value = numero;
        }else if (data.status === "error"){
            document.getElementById("window_container").innerHTML = `<h1>Error del Servidor</h1>
                <p class="temp_p">Parece que sucedio un error del lado del servidor, la siguiente información se recabo al respecto, favor de comunicarlo al Centro de Información:<br></p>
                <div class='horizontal_alignment'>
                    <button type='cancel' id='cancel' onclick='close_central_window()'>Cerrar</button>
                </div>`;
            container.querySelector(".temp_p").appendChild(document.createTextNode(data.message));
        }
    })
    .catch((error) => {
        let container = document.getElementById("window_container");
        container.innerHTML = `<h1>Error del Servidor</h1>
            <p class="temp_p">Parece que sucedio un error del lado del servidor, la siguiente información se recabo al respecto, favor de comunicarlo al Centro de Información:<br></p>
            <div class='horizontal_alignment'>
                <button type='cancel' id='cancel' onclick='close_central_window()'>Cerrar</button>
            </div>`;
        container.querySelector(".temp_p").appendChild(document.createTextNode(error));
    });
}

function close_central_window(){
    document.getElementById("password-forgot").onclick = open_recovery_window;
    document.getElementById("no-account").onclick = open_noaccount_window;
    document.getElementById("password").disabled = false;
    document.getElementById("username").disabled = false;
    document.getElementById("login").disabled = false;
    document.getElementById("window_container").remove();
}

function open_central_window(innerHTML){
    document.getElementById("password-forgot").onclick = void(0);
    document.getElementById("no-account").onclick = void(0);
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
    open_central_window(`<h1>Recuperar Contraseña</h1>
        <p>Para recuperar la contraseña ingrese el número de control o tarjeta y tu nombre de usuario a continuación.</p>
        <form method='POST' id='recovery_form'>
            <div class='vertical_spacing'>
                <label for='username'>Usuario:</label><br>
                <input type='text' id='username_recovery' autocomplete="username" placeholder='Nombre de usuario...' required><br>
            </div>
            <div class='vertical_spacing'>
                <label for='username'>No. de Control/Tarjeta:</label><br>
                <input type='text' id='number_recovery' autocomplete="off" placeholder='########...' required><br>
            </div>
            <div class='horizontal_alignment'>
                <button type='submit' id='recover' onclick='return send_recovery_email()'>Recuperar</button>
                <button type='cancel' id='cancel' onclick='close_central_window()'>Cancelar</button>
            </div>
        </form>`);
    
    document.getElementById("recovery_form").onsubmit = form_prevent;
}

function open_noaccount_window(){
    open_central_window(`<h1>Creación de Cuenta</h1>
        <p>Si no tienes una cuenta registrada, consulta con el Centro de Información en las instalaciones del Instituto Tecnológico de Iguala. Usualmente las cuentas se actualizan cada semestre, si es la primera vez que accedes al sitio, puede que tu usuario sea tu primer nombre junto al primer apellido y la contraseña sea tu número de control o tarjeta.</p>
        <div class='horizontal_alignment'>
            <button type='cancel' id='cancel' onclick='close_central_window()'>Cerrar</button>
        </div>`);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("password-forgot").onclick = open_recovery_window;
    document.getElementById("no-account").onclick = open_noaccount_window;
    document.getElementById("login").onclick = login;
    document.getElementById("login_form").onsubmit = form_prevent;
});