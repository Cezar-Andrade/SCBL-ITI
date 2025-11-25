function generate_report(){
    document.getElementById("generate").textContent = "Generando...";
    document.getElementById("generate").disabled = true;

    inicio = document.getElementById("fechainicio").value;
    final = document.getElementById("fechafinal").value;

    rows = [
        ["Fecha del reporte:", to_date(inicio), to_date(final)],
        [],
        ["Veces material consultado:", datos[0]],
        ["Número de usuarios:", datos[1]],
        ["Número de usuarios inscritos:", datos[2]],
        [],
        ["Número de préstamos"],
        ["En sala:", datos[3]],
        ["A domicilio:", datos[4]],
        [],
        ["Número de títulos adquiridos:", datos[5]],
        ["Número de títulos en existencia:", datos[6]],
        ["Número de títulos consultados:", datos[7]],
        [],
        ["Número de ejemplares adquiridos:", datos[8]],
        ["Número de ejemplares en existencia:", datos[9]],
        ["Número de ejemplares consultados:", datos[10]]
    ];

    var formData = new FormData();
    formData.append("type", "estadisticas");
    formData.append("inicio", inicio);
    formData.append("final", final);
    formData.append("data", JSON.stringify(rows));

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
        link.download = "Estadisticas_Sistema_Bibliotecario_ITI_" + inicio + "_" + final + ".xlsx";
        link.click();
    });
}

function to_date(date){
    let datos = date.split("-");
    return datos[2] + "/" + datos[1] + "/" + datos[0];
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

function update_data(inicio, final){
    var formData = new FormData();
    formData.append("type", "estadisticas");
    formData.append("inicio", inicio);
    formData.append("final", final);

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
        
        document.getElementById("material_consultado").textContent = datos[0];
        document.getElementById("no_usuarios").textContent = datos[1];
        document.getElementById("no_usuarios_inscritos").textContent = datos[2];
        document.getElementById("prestamos_sala").textContent = datos[3];
        document.getElementById("prestamos_domicilio").textContent = datos[4];
        document.getElementById("titulos_adquiridos").textContent = datos[5];
        document.getElementById("titulos_existencia").textContent = datos[6];
        document.getElementById("titulos_consultados").textContent = datos[7];
        document.getElementById("ejemplares_adquiridos").textContent = datos[8];
        document.getElementById("ejemplares_existencia").textContent = datos[9];
        document.getElementById("ejemplares_consultados").textContent = datos[10];

        document.getElementById("generate").disabled = false;
    });
}

function clear_data(){
    document.getElementById("material_consultado").textContent = "--";
    document.getElementById("no_usuarios").textContent = "--";
    document.getElementById("no_usuarios_inscritos").textContent = "--";
    document.getElementById("prestamos_sala").textContent = "--";
    document.getElementById("prestamos_domicilio").textContent = "--";
    document.getElementById("titulos_adquiridos").textContent = "--";
    document.getElementById("titulos_existencia").textContent = "--";
    document.getElementById("titulos_consultados").textContent = "--";
    document.getElementById("ejemplares_adquiridos").textContent = "--";
    document.getElementById("ejemplares_existencia").textContent = "--";
    document.getElementById("ejemplares_consultados").textContent = "--";

    document.getElementById("generate").disabled = true;
}

document.addEventListener("DOMContentLoaded", () => {
    table = document.getElementById("table_info");
    document.getElementById("fechainicio").addEventListener('change', function() {
        inicio = document.getElementById("fechainicio");
        final = document.getElementById("fechafinal");
        final.min = inicio.value;
        if (inicio.value !== "" && final.value !== ""){
            update_data(inicio.value, final.value);
        }else{
            clear_data();
        }
    });
    document.getElementById("fechafinal").addEventListener('change', function() {
        inicio = document.getElementById("fechainicio");
        final = document.getElementById("fechafinal");
        inicio.max = final.value;
        if (inicio.value !== "" && final.value !== ""){
            update_data(inicio.value, final.value);
        }else{
            clear_data();
        }
    });
});