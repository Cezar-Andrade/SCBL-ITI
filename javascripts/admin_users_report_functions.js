function generate_report(){
    document.getElementById("generate").textContent = "Generando...";
    document.getElementById("generate").disabled = true;

    var formData = new FormData();
    formData.append("type", "usuarios");

    fetch("../php/admin_report_queries.php", {
        method: "POST",
        body: formData
    })
    .then(response => {
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
            response.json().then(data => {
                open_overlayed_window();
                if (data.status === "user-not-authenticated"){
                    document.getElementById("container_overlay").innerHTML = `<h1>Usuario no autenticado</h1>
                        <p>El usuario no ha iniciado sesión, solo el usuario administrador autenticado puede hacer estas operaciones.</p>
                        <button type="cancel" onclick="return close_window()">Cerrar</button>`;
                }else if (data.status === "user-not-admin"){
                    document.getElementById("container_overlay").innerHTML = `<h1>Usuario no administrador</h1>
                        <p>El usuario con el que esta iniciado la sesión no tiene privilegios de administrador, por ende no puede realizar las siguientes acciones.</p>
                        <button type="cancel" onclick="return close_window()">Cerrar</button>`;
                }else{
                    document.getElementById("container_overlay").innerHTML = `<h1>Error del servidor</h1>
                        <p id="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                        <button type="cancel" onclick="return close_window()">Volver</button>`;
                    let temp = document.getElementById("temp_p");
                    temp.removeAttribute("id");
                    temp.appendChild(document.createTextNode(data.message));
                }
            });
            
            return null;
        } else if (contentType && contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
            return response.blob();
        } else {
            document.getElementById("generate").textContent = "Generar";
            document.getElementById("generate").disabled = false;
            return response.text().then(text => { throw new Error(text) });
        }
    })
    .then(blob => {
        document.getElementById("generate").textContent = "Generar";
        document.getElementById("generate").disabled = false;
        
        if (blob == null){
            return;
        }

        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Usuarios_registrados_SCBL_ITI.xlsx";
        link.click();
    });
}

function close_window(){
    overlay.remove();
    return false;
}

function open_overlayed_window(){
    overlay = document.createElement("div");
    overlay.setAttribute("id", "overlayed_window");
    overlay.setAttribute("class", "overlayed_window");
    overlay.innerHTML = "<div id='container_overlay' class='container_overlay'></div>";
    document.body.appendChild(overlay);
}