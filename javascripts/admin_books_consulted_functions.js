function generate_report(){
    document.getElementById("generate").textContent = "Generando...";
    document.getElementById("generate").disabled = true;
    rows = [["Rank", "Título", "Autores", "ISBN", "Editorial", "Clasificacion", "Total"]];

    for (var i = 0; i < deudores_length; i++) {
        row = [];
        
        let editorial = deudores_data[i]["Editorial"];
        let isbn = deudores_data[i]["ISBN"];
        row.push(i + 1);
        row.push(deudores_data[i]["Titulo"]);
        row.push(deudores_data[i]["Autores"]);
        row.push(((isbn === null) ? "" : '"' + isbn + '"'));
        row.push((editorial === null) ? "" : editorial);
        row.push(deudores_data[i]["Clasificacion"]);
        row.push(deudores_data[i]["Total"]);
        
        rows.push(row);
    }
    var formData = new FormData();
    formData.append("type", "libros_consultados");
    formData.append("inicio", document.getElementById("fechainicio").value);
    formData.append("final", document.getElementById("fechafinal").value);
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
        link.download = "Libros_mas_consultados_" + document.getElementById("fechainicio").value + "_" + document.getElementById("fechafinal").value + ".xlsx";
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

function update_table(inicio, final){
    clear_table();

    var formData = new FormData();
    formData.append("type", "libros_consultados");
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
        deudores_data = JSON.parse(data.data);
        deudores_length = Object.keys(deudores_data).length;

        document.getElementById("generate").disabled = (deudores_length <= 0);
        
        for (var i=0; i<deudores_length; i++){
            item = deudores_data[i];
            row = table.insertRow(table.rows.length);

            cell1 = row.insertCell(0);
            cell2 = row.insertCell(1);
            cell3 = row.insertCell(2);
            cell4 = row.insertCell(3);
            cell5 = row.insertCell(4);

            cell1.innerHTML = "<p class='temp_p1'></p>";
            cell2.innerHTML = "<p class='temp_p2'></p>";
            cell3.innerHTML = "<p class='temp_p3'></p>";
            cell4.innerHTML = "<p class='temp_p4'></p>";
            cell5.innerHTML = "<p class='temp_p5'></p>";
            let temp = cell1.querySelector(".temp_p1");
            temp.appendChild(document.createTextNode(i + 1));
            temp = cell2.querySelector(".temp_p2");
            temp.appendChild(document.createTextNode(item["Titulo"]));
            temp = cell3.querySelector(".temp_p3");
            temp.appendChild(document.createTextNode(item["Autores"]));
            temp = cell4.querySelector(".temp_p4");
            temp.appendChild(document.createTextNode((item["Editorial"] === null) ? "" : item["Editorial"]));
            temp = cell5.querySelector(".temp_p5");
            temp.appendChild(document.createTextNode(item["Total"]));
        }
    });
}

function clear_table(){
    for (var i=table.rows.length - 1; i>0; i--){
        table.rows[i].parentNode.removeChild(table.rows[i]);
    }

    document.getElementById("generate").disabled = true;
}

document.addEventListener("DOMContentLoaded", () => {
    table = document.getElementById("table_info");
    document.getElementById("fechainicio").addEventListener('change', function() {
        inicio = document.getElementById("fechainicio");
        final = document.getElementById("fechafinal");
        final.min = inicio.value;
        if (inicio.value !== "" && final.value !== ""){
            update_table(inicio.value, final.value);
        }else{
            clear_table();
        }
    });
    document.getElementById("fechafinal").addEventListener('change', function() {
        inicio = document.getElementById("fechainicio");
        final = document.getElementById("fechafinal");
        inicio.max = final.value;
        if (inicio.value !== "" && final.value !== ""){
            update_table(inicio.value, final.value);
        }else{
            clear_table();
        }
    });
});