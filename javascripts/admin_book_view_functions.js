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

function hacer_guardado(){
    open_second_overlayed_window();
    document.getElementById("second_container_overlay").innerHTML = `<h1>Confirmar acción</h1>
        <p>Esta por guardar los cambios realizados al titulo.</p>
        <p>¿Desea continuar?</p>
        <button yellow onclick="cometer_guardado()">Continuar</button>
        <button red onclick="close_second_window()">Cancelar</button>`;
}

function cometer_guardado(){
    document.getElementById("second_container_overlay").innerHTML = `<h1>Procesando...</h1>
        <p>Por favor espere...</p>`;
    folios = [];
    folios_og = [];
    states = [];
    first = [];
    deleted = [];

    for (var i = 1; i < table.rows.length - 1; i++){
        const row = table.rows[i];
        var folio = row.cells[0].querySelector("input").value;

        for (var j = 0; j < folios.length; j++){
            if (folio == folios[j]){
                document.getElementById("second_container_overlay").innerHTML = `<h1>Folios repetidos</h1>
                    <p>En los nuevos folios que desea ingresar hay repetición, los folios no pueden repetirse entre ellos, asegurese además tambien de que estos folios no esten ya registrados en el sistema.</p>
                    <button red onclick='close_second_window()'>Cerrar</button>`;

                return;
            }
        }

        first.push(row.first);
        deleted.push(row.deleted);
        folios.push(folio);
        folios_og.push(row.folio);
        states.push(row.cells[1].querySelector("select").value);
    }

    today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);

    var dict = {
        "folios": folios,
        "folios_og": folios_og,
        "states": states,
        "first": first,
        "deleted": deleted,
        "fecha": today.toISOString().split("T")[0],
        "id": urlParams.get("id")
    };

    var formData = new FormData();
    formData.append("type", "operaciones_ejemplar");
    formData.append("data", JSON.stringify(dict));

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
            document.getElementById("second_container_overlay").innerHTML = `<h1>Usuario no autenticado</h1>
                <p>El usuario no ha iniciado sesión, solo el usuario administrador autenticado puede hacer estas operaciones.</p>
                <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
        }else if (data.status === "user-not-admin"){
            document.getElementById("second_container_overlay").innerHTML = `<h1>Usuario no administrador</h1>
                <p>El usuario con el que esta iniciado la sesión no tiene privilegios de administrador, por ende no puede realizar las siguientes acciones.</p>
                <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
        }else if (data.status === "folios-repeated"){
            array = JSON.parse(data.message);
            let container = document.getElementById("second_container_overlay");
            container.innerHTML = `<h1>Folios repetidos</h1>
                <p>Los siguientes folios ya se encuentran registrados en el sistema, use otros folios en lugar de los siguientes:</p>
                <p><b class="temp_b"></b></p>
                <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
            let temp = container.querySelector(".temp_b");
            temp.appendChild(document.createTextNode(array));
        }else if (data.status === "insufficient-books"){
            document.getElementById("second_container_overlay").innerHTML = `<h1>Ejemplares insuficientes</h1>
                <p>No hay suficientes ejemplares disponibles para las reservaciones y prestamos que los usuarios ya han realizado en el sistema.</p>
                <p>Cree más ejemplares para cubrir las reservaciones o cancele las reservaciones de los usuarios en la gestión de reservaciones y vuelva a intentarlo.</p>
                <button red type="cancel" onclick="return close_second_window()">Cerrar</button>`;
        }else if (data.status === "success"){
            document.getElementById("second_container_overlay").innerHTML = `<h1>Ejemplares guardados</h1>
                <p>Los cambios realizados a los ejemplares, se han guardado en la base de datos de forma exitosa.</p>
                <button red type="cancel" onclick="return close_two_window(true)">Cerrar</button>`;
        }else if (data.status === "error"){
            let container = document.getElementById("second_container_overlay");
            container.innerHTML = `<h1>Error del servidor</h1>
                <p class="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button red type="cancel" onclick="return close_second_window()">Volver</button>`;
            let temp = container.querySelector(".temp_p");
            temp.appendChild(document.createTextNode(data.message));
        }
    });
}

function gestionar_ejemplares(){
    change_made = false;

    open_overlayed_window();
    document.getElementById("container_overlay").innerHTML = `<h1>Gestionar ejemplares</h1>
        <table id="table_folio">
            <tr>
                <th style="width:22%">
                    <p style="margin:0"><b>Folio</b></p>
                </th>
                <th style="width:35%">
                    <p style="margin:0"><b>Estado fisico</b></p>
                </th>
                <th style="width:35%">
                    <p style="margin:0"><b>Disponibilidad</b></p>
                </th>
                <th style="width:8%"></th>
            </tr>
            <tr>
                <td colspan="4">
                    <button type="cancel" class="plus_button" onclick="add_folio()"></button>
                </td>
            </tr>
        </table>
        <button id="guardado" onclick="hacer_guardado()" disabled>Guardar</button>
        <button onclick="close_window_warning()">Cancelar</button>`;

    table = document.getElementById("table_folio");
    counter = 0;

    var formData = new FormData();
    formData.append("type", "ejemplares");
    formData.append("IDTitulo", urlParams.get("id"));

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
        ejemplares_datos = JSON.parse(data.data);
        state_combobox = [];

        for (var i = 0; i < ejemplares_datos.length; i++){
            const row = table.insertRow(table.rows.length - 1);
            row.first = true;
            row.folio = ejemplares_datos[i]["Folio"];
            row.deleted = false;
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            const cell4 = row.insertCell(3);

            cell1.innerHTML = `<input class="temp_input" type="text" style="width:80%">`;
            cell2.innerHTML = `<div><select class="state" placeholder="Estado físico...">
                    <option value="">Selecciona una opción...</option>
                    <option value="Buena condicion">Buena condición</option>
                    <option value="Maltratado">Maltratado</option>
                    <option value="Roto">Roto</option>
                    <option value="Perdido">Perdido</option>
                </select></div>`;
            cell3.innerHTML = "<p class='temp_p'></p>";
                
            let temp = cell3.querySelector(".temp_p");
            temp.appendChild(document.createTextNode(ejemplares_datos[i]["EstadoDisponible"]));

            combobox = $(cell2.querySelector(".state")).selectize({
                sortField: 'text',
                normalize: true,
                plugins: ['restore_on_backspace'],
                onDelete: function () {
                    return false;
                }
            })[0].selectize;
            combobox.setValue(ejemplares_datos[i]["EstadoFisico"]);
            combobox.on('change', function(value) {
                change_made = true;
                document.getElementById("guardado").disabled = false;
            });

            temp = cell1.querySelector(".temp_input");
            temp.value = row.folio;

            if (ejemplares_datos[i]["EstadoDisponible"] === "Disponible"){
                temp.addEventListener("input", function (value){
                    change_made = true;
                    document.getElementById("guardado").disabled = false;
                });
                cell4.innerHTML = `<button red class='cross_button' onclick='delete_folio(this)'></button>`;
            }else{
                temp.disabled = true;
                cell4.innerHTML = `<button style='background-image: url("../images/Exclamation.png");' class='search_button' onclick='view_info(this)'></button>`;
                combobox.disable();
            }
        }
    });
}

function add_folio(){
    const table = document.getElementById("table_folio");
    const row = table.insertRow(table.rows.length - 1);
    row.first = false;
    row.folio = null;
    row.deleted = false;
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);
    const cell4 = row.insertCell(3);

    var formData = new FormData();
    formData.append("type", "folio");
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
        folio = JSON.parse(data.data)[0];
        cell1.innerHTML = `<input class="temp_input" type="text" style="width:80%"">`;

        let temp = cell1.querySelector(".temp_input");
        temp.value = folio;
    });

    cell2.innerHTML = `<div><select class="state" placeholder="Estado físico...">
            <option value="">Selecciona una opción...</option>
            <option value="Buena condicion">Buena condición</option>
            <option value="Maltratado">Maltratado</option>
            <option value="Roto">Roto</option>
            <option value="Perdido">Perdido</option>
        </select></div>`;
    cell3.innerHTML = `<p>Disponible</p>`;
    cell4.innerHTML = `<button red class="cross_button" onclick="delete_folio(this)"></button>`;

    $(cell2.querySelector(".state")).selectize({
        sortField: 'text',
        normalize: true,
        plugins: ['restore_on_backspace'],
        onDelete: function () {
            return false;
        }
    })[0].selectize.setValue("Buena condicion");

    change_made = true;
    document.getElementById("guardado").disabled = false;
}

function delete_folio(element){
    if (table.rows.length == 3){
        open_second_overlayed_window();
        document.getElementById("second_container_overlay").innerHTML = `<h1>Accion no permitida</h1>
            <p>No puedes borrar el ultimo ejemplar, si deseas restaurar algunos ejemplares, será necesario que canceles la operación actual e inicies de nuevo.</p>
            <button red type="cancel" onclick="return close_second_window()">Volver</button>`;
        return;
    }

    const row = element.parentNode.parentNode;
    if (row.first){
        row.style.display = "none";
        row.deleted = true;
    }else{
        row.parentNode.removeChild(row);
    }

    change_made = true;
    document.getElementById("guardado").disabled = false;
}

function view_info(element){
    const row = element.parentNode.parentNode;
    const folio = row.querySelector("input").value;

    var formData = new FormData();
    formData.append("type", "prestado");
    formData.append("Folio", folio);
    
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
        
        open_second_overlayed_window();
        let container = document.getElementById("second_container_overlay");
        container.innerHTML = `<h1>Ejemplar prestado</h1>
            <p class="titulo_temp"><b>Titulo: </b></p>
            <p class="folio_temp"><b>Folio prestado: </b></p>
            <p class="tipo_usuario_temp"><b>Tipo de usuario: </b></p>
            <p class="numero_temp"><b class="numero_extra_temp"></b></p>
            <p class="nombre_temp"><b>Nombre: </b></p>
            <p class="genero_temp"><b>Genero: </b></p>
            <p class="domicilio_temp"><b>Tipo de prestamo: </b></p>
            <button red onclick="close_second_window()">Cerrar</button>`;
        let temp = container.querySelector(".titulo_temp");
        temp.appendChild(document.createTextNode(datos["Titulo"]));
        temp = container.querySelector(".folio_temp");
        temp.appendChild(document.createTextNode(folio));
        temp = container.querySelector(".tipo_usuario_temp");
        temp.appendChild(document.createTextNode((datos["NoControl"] === null) ? "Docente" : "Estudiante"));
        temp = container.querySelector(".numero_temp");
        temp.appendChild(document.createTextNode((datos["NoControl"] === null) ? datos["NoTarjeta"] : datos["NoControl"]));
        temp = container.querySelector(".numero_extra_temp");
        temp.appendChild(document.createTextNode("No. de " + ((datos["NoControl"] === null) ? "Tarjeta" : "Control") + ": "));
        temp = container.querySelector(".nombre_temp");
        temp.appendChild(document.createTextNode(datos["Nombre"]));
        temp = container.querySelector(".genero_temp");
        temp.appendChild(document.createTextNode(datos["Genero"]));
        temp = container.querySelector(".domicilio_temp");
        temp.appendChild(document.createTextNode((datos["ADomicilio"] == 1) ? "A domicilio" : "En sala"));
    });
}

function prestar_ejemplares(){
    open_overlayed_window();
    document.getElementById("container_overlay").innerHTML = `<h1>Prestar ejemplares</h1>
    <table id="table_folio">
        <tr>
            <th style="width:22%">
                <p style="margin:0"><b>Folio</b></p>
            </th>
            <th style="width:35%">
                <p style="margin:0"><b>Estado fisico</b></p>
            </th>
            <th style="width:35%">
                <p style="margin:0"><b>No.Control/Tarjeta</b></p>
            </th>
            <th style="width:8%"></th>
        </tr>
    </table>
    <button id="prestamo" onclick="hacer_prestamos()" disabled>Continuar</button>
    <button onclick="close_window()">Cancelar</button>`;

    table = document.getElementById("table_folio");
    counter = 0;
    disponibles = 0;
    reservaciones = 0;

    var formData = new FormData();
    formData.append("type", "ejemplares");
    formData.append("IDTitulo", urlParams.get("id"));

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
        ejemplares_datos = JSON.parse(data.data);

        for (var i = 0; i < ejemplares_datos.length; i++){
            const row = table.insertRow(table.rows.length);
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            const cell4 = row.insertCell(3);

            disabled = false;
            if (ejemplares_datos[i]["EstadoDisponible"] !== "Disponible"){
                disabled = true;
            }else{
                disponibles++;
            }

            cell1.innerHTML = "<p class='temp_folio'></p>";
            cell2.innerHTML = "<p class='temp_estado'></p>";
            cell3.innerHTML = "<input autocomplete='off' class='temp_user' style='width: 80%'>";
            cell4.innerHTML = "<button class='search_button' disabled></button>";

            let temp = cell1.querySelector(".temp_folio");
            temp.appendChild(document.createTextNode(ejemplares_datos[i]["Folio"]));
            temp = cell2.querySelector(".temp_estado");
            temp.appendChild(document.createTextNode(ejemplares_datos[i]["EstadoFisico"]));
            temp = cell4.querySelector(".search_button");
            temp.id = "button" + i;
            temp.number = i;
            temp.onclick = function(){
                search_user(this.number);
            };

            input = cell3.querySelector(".temp_user");
            input.id = "user" + i;
            if (disabled){
                input.disabled = true;
                input.value = "Prestado...";
            }
            input.number = i;
            input.addEventListener('input', function() {
                button = document.getElementById("button" + this.number);
                if (this.value === ""){
                    button.disabled = true;
                }else{
                    button.disabled = false;
                }
                        
                if (button.getAttribute("style") !== null){
                    counter--;
                    
                    if (counter == 0){
                        document.getElementById("prestamo").disabled = true;
                    }

                    button.removeAttribute("style");
                    button.onclick = function(){
                        search_user(this.number);
                    };
                }
            });
        }
    });
}

function hacer_prestamos(){
    folios = [];
    nombres = [];
    for (var i = 0; i < ejemplares_datos.length; i++){
        button = document.getElementById("button" + i);

        if (button.getAttribute("style") !== null){
            var datos = ejemplares_datos[i];

            folios.push(datos["Folio"]);
            nombres.push(button.Nombre);
        }
    }

    open_second_overlayed_window();
    document.getElementById("second_container_overlay").innerHTML = `<h1>Confirmar accion</h1>
        <p>Esta por asignar los folios: <b id="folios"></b> a los usuarios: <b id="nombres"></b> respectivamente.</p>
        <p>¿Desea continuar?</p>
        <button yellow onclick="efectuar_prestamos()">Confirmar</button>
        <button red onclick="close_second_window()">Cancelar</button>`;
    let temp = document.getElementById("folios");
    temp.appendChild(document.createTextNode(folios));
    temp = document.getElementById("nombres");
    temp.appendChild(document.createTextNode(nombres));
}

function format_date(today){
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
}

async function print_ticket(datos){
    try{
        if (!qz.websocket.isActive()) {
            await qz.websocket.connect();
        }
    }catch{
        return -1;
    }

    try{
        const config = qz.configs.create("Epson");
        
        const datos2 = [
            "\x1B\x40",
            " ___________________________________\n",
            "         Firma de recibido\n\n",
            "  Institituto Tecnologico de Iguala\n",
            "         Ticket de prestamo\n\n",
            "Telefono:\n\n",
            "Datos del usuario:\n",
            ((datos["NoControl"] !== null) ? "No. de Control: " + datos["NoControl"] : "No. de Tarjeta: " + datos["NoTarjeta"]) + "\n",
            "Nombre: " + datos["Nombre"] + "\n",
            ((datos["NoControl"] !== null) ? "Carrera: " + datos["Carrera"] : "Departamento: " + datos["Departamento"]) + "\n\n",
            "Datos del libro:\n",
            "Folio: " + datos["Folio"] + "\n",
            "Titulo: " + datos["Titulo"] + "\n\n",
            "Datos del prestamo:\n",
            "Fecha de prestado: " + datos["FechaEntregado"] + "\n",
            "Fecha de entrega limite: " + datos["FechaLimite"] + "\n\n\n\n\n\n\n\n",
            "\x1D\x56\x00"
        ];

        await qz.print(config, datos2);

        return 1;
    }catch{
        return 0;
    }
}

async function efectuar_prestamos(){
    container = document.getElementById("second_container_overlay");
    container.innerHTML = `<h1>Procesando...</h1>
        <p>Por favor espere...</p>`;
    
    today2 = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    fecha = today2.toISOString().split('T')[0];
    today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    today.setDate(today.getDate() + 2);
    if (today.getDay() == 0){
        today.setDate(today.getDate() + 1);
    }else if (today.getDay() == 6){
        today.setDate(today.getDate() + 2);
    }
    fechaLimite = today.toISOString().split('T')[0];

    smth_wrong = false;
    smth_good = false;
    print_error = false;
    software_error = false;
    
    for (var i = 0; i < ejemplares_datos.length; i++){
        button = document.getElementById("button" + i);

        if (button.getAttribute("style") !== null){
            var dict = {
                "IDUsuario": button.IDUsuario,
                "Folio": ejemplares_datos[i]["Folio"],
                "Fecha": fecha,
                "FechaLimite": fechaLimite,
                "estudiante": button.estudiante,
                "domicilio": button.domicilio
            };
            
            var formData = new FormData();
            formData.append("type", "prestamo");
            formData.append("data", JSON.stringify(dict));

            await fetch("../php/admin_insert_queries.php", {
                method: "POST",
                body: formData
            })
            .then(async response => {
                const contentType = response.headers.get("content-type");
                
                if (contentType && contentType.includes("application/json")) {
                    return response.json();
                } else {
                    return response.text().then(text => { throw new Error(text) });
                }
            })
            .then(async data => {
                if (data.status === "success"){
                    smth_good = true;

                    if (dict["domicilio"] == 1){
                        await print_ticket(JSON.parse(data.message));
                        impresion = await print_ticket(JSON.parse(data.message));

                        if (impresion == 0){
                            print_error = true;
                        }else if (impresion == -1){
                            software_error = true;
                        }
                    }
                }else{
                    smth_wrong = true;
                }
            });
        }
    }

    if (smth_wrong){
        container.innerHTML = `<h1>Algo paso...</h1>
            <p>` + ((smth_good) ? "Algunos" : "Todos los") + ` prestamos que se intentaron asignar no fueron posible de registrar debido a información incorrecta o falta de privilegios.</p>
            <p>Verifique que tenga permisos de administrador en la cuenta y que se hayan escrito bien los numeros de control o tarjeta de los usuarios.</p>
            ` + ((smth_good) ? "Los prestamos que se lograron realizar han sido registrados con la fecha <b id='date2'></b> y tienen como fecha límite para su devolución <b id='date1'></b>" : "") + `
            <p>Si el problema persiste, consulte con el Centro de Información.</p>
            ` + ((print_error) ? "<p><b>ADVERTENCIA:</b> La impresora se desconecto, no esta respondiendo o no esta funcionando correctamente, verifique que este en correcto funcionamiento, imprima los tickets visualizando los préstamos individualmente despues de haber verificado el funcionamiento de la impresora.</p>" : "")
            + ((software_error) ? "<p><b>ADVERTENCIA:</b> El software QZ Tray usado para comunicarse con la impresora no responde o no esta presente, inicie el programa en el sistema para funcionar adecuadamente, después imprima los tickets visualizando los préstamos individualmente despues de haber verificado el funcionamiento del software.</p>" : "") + `
            <button yellow onclick="trigger_window()">Cerrar</button>`;
        if (smth_good){
            document.getElementById("date2").appendChild(document.createTextNode(format_date(today2)));
            document.getElementById("date1").appendChild(document.createTextNode(format_date(today)));
        }
    }else{
        container.innerHTML = `<h1>Prestamos registrados</h1>
            <p>Los prestamos a domicilio asignados han sido registrados con la fecha <b id="date2"></b> y tienen como fecha límite para su devolución <b id="date1"></b></p>
            <p>Los prestamos en sala han quedado marcados como completados.</p>
            ` + ((print_error) ? "<p><b>ADVERTENCIA:</b> La impresora se desconecto, no esta respondiendo o no esta funcionando correctamente, verifique que este en correcto funcionamiento, imprima los tickets visualizando los préstamos individualmente despues de haber verificado el funcionamiento de la impresora.</p>" : "")
            + ((software_error) ? "<p><b>ADVERTENCIA:</b> El software QZ Tray usado para comunicarse con la impresora no responde o no esta presente, inicie el programa en el sistema para funcionar adecuadamente, después imprima los tickets visualizando los préstamos individualmente despues de haber verificado el funcionamiento del software.</p>" : "") + `
            <button yellow onclick="trigger_window()">Cerrar</button>`;
        document.getElementById("date2").appendChild(document.createTextNode(format_date(today2)));
        document.getElementById("date1").appendChild(document.createTextNode(format_date(today)));
    }
}

function trigger_window(){
    close_second_window();
    close_window();
    prestar_ejemplares();
}

function search_user(numero){
    open_second_overlayed_window();

    if (disponibles - counter > reservaciones){
        document.getElementById("second_container_overlay").innerHTML = `<h1>Selecciona tipo de usuario</h1>
            <button id="student_button" yellow style="margin: 0; padding: 1vw;">Estudiante</button>
            <button red style="margin: 0; padding-top: 0; padding-bottom: 0; padding-left: 1vw; padding-right: 1vw;" onclick="close_second_window()">Cancelar</button>
            <button id="teacher_button" yellow style="margin: 0; padding: 1vw;">Docente</button>`;
        let temp = document.getElementById("student_button");
        temp.numero = numero;
        temp.addEventListener("click", function() {
            search_student(this.numero);
        });
        temp = document.getElementById("teacher_button");
        temp.numero = numero;
        temp.addEventListener("click", function() {
            search_teacher(this.numero);
        });
    }else{
        document.getElementById("second_container_overlay").innerHTML = `<h1>Libros insuficientes</h1>
            <p>Ya no se pueden asignar más folios a los usuarios de este título debido a que hay reservaciones vigentes sobre este, espere a que expiren y vengan a recogerlos o cancele la reservación en el apartado correspondiente.</p>
            <button red onclick="close_second_window()">Cerrar</button>`;
    }
}

function search_student(numero){
    document.getElementById("second_container_overlay").innerHTML = `<h1>Procesando...</h1>
        <p>Por favor espere...</p>`;
    today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    
    var dict = {
        "nocontrol": document.getElementById("user" + numero).value,
        "fecha": today.toISOString().split('T')[0]
    }

    var formData = new FormData();
    formData.append("type", "estudiante por ID");
    formData.append("data", JSON.stringify(dict));
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

        needed = 0;

        for (var i = 1; i < table.rows.length; i++){
            const button = table.rows[i].querySelector("button");
            const style = button.getAttribute("style");

            if (style !== null){
                const user = table.rows[i].querySelector("input").value;

                if (datos["IDUsuario"] === button.IDUsuario){
                    needed++;
                }
            }
        }

        let container = document.getElementById("second_container_overlay");
        if (data.data === "false"){
            container.innerHTML = `<h1>Usuario no encontrado...</h1>
                <button red onclick="close_second_window()">Cerrar</button>`;
            
            return;
        }else if (needed >= 1){
            container.innerHTML = `<h1>Usuario repetido</h1>
                <p>Los usuarios solo pueden llevarse solo un ejemplar de cada título a la vez.</p>
                <button red onclick="close_second_window()">Cerrar</button>`;

            return;
        }else if (datos["YaPrestado"] == 1){
            container.innerHTML = `<h1>Libro ya prestado</h1>
                <p id="temp_text"></p>
                <button red onclick="close_second_window()">Cerrar</button>`;
            let temp = document.getElementById("temp_text");
            temp.removeAttribute("id");
            temp.appendChild(document.createTextNode("El usuario: " + datos["Nombre"] + " " + datos["ApellidoPaterno"] + " " + datos["ApellidoMaterno"] + " ya tiene el libro prestado, no puede llevarse más de uno."));
            return;
        }else if (datos["Multado"] == 1 || datos["Expirado"] == 1 || datos["Bloqueado"] == 1){
            container.innerHTML = `<h1>Acción no permitida</h1>
                <p id="temp_text"></p>
                <p>Asegurese de que no tenga multas pendientes, prestamos expirados o que no este bloqueado para que pueda pedir un ejemplar prestado.</p>
                <button red onclick="close_second_window()">Cerrar</button>`;
            let temp = document.getElementById("temp_text");
            temp.removeAttribute("id");
            temp.appendChild(document.createTextNode("El usuario: " + datos["Nombre"] + " " + datos["ApellidoPaterno"] + " " + datos["ApellidoMaterno"] + " tiene una multa no saldada, un prestamo expirado o esta bloqueado."));
            return;
        }

        button = document.getElementById("button" + numero);
        button.estudiante = true;
        button.IDUsuario = datos["IDUsuario"];
        button.Nombre = datos["Nombre"] + " " + datos["ApellidoPaterno"] + " " + datos["ApellidoMaterno"];

        container.innerHTML = `<h1>Tipo de prestamo</h1>
            <p>Selecciona el tipo de prestamo que se hará con el usuario: <b class="temp_b"></b>.</p>
            <button id="en_sala" yellow style="margin: 0; padding: 1vw;">En sala</button>
            <button red style="margin: 0; padding-top: 0; padding-bottom: 0; padding-left: 1vw; padding-right: 1vw;" onclick="close_second_window()">Cancelar</button>
            <button id="a_domicilio" yellow style="margin: 0; padding: 1vw;">A domicilio</button>`;
        container.querySelector(".temp_b").textContent = button.Nombre;
        let temp = document.getElementById("en_sala");
        temp.addEventListener("click", function() {
            select_type_loan(0, needed, button);
        });
        temp = document.getElementById("a_domicilio");
        temp.addEventListener("click", function() {
            select_type_loan(1, needed, button);
        });
    });
}

function select_type_loan(domicilio, needed, button){
    if (datos["PrestamosDisponibles"] <= needed && domicilio == 1){
        let container = document.getElementById("second_container_overlay");
        container.innerHTML = `<h1>Prestamos insuficientes</h1>
            <p id="temp_text"></p>
            <p>Asegurese que ya haya devuelto los libros que solicito prestado.</p>
            <button red onclick="close_second_window()">Cerrar</button>`;
        let temp = document.getElementById("temp_text");
        temp.removeAttribute("id");
        temp.appendChild(document.createTextNode("El usuario: " + button.Nombre + " carece de prestamos disponibles para asignar."));
        return;
    }

    button.domicilio = domicilio;
    button.style = "background-color: lime; background-image:url('../images/Check.png');";
    button.onclick = "";
    document.getElementById("prestamo").disabled = false;

    counter++;

    close_second_window();
}

function search_teacher(numero){
    document.getElementById("second_container_overlay").innerHTML = `<h1>Procesando...</h1>
        <p>Por favor espere...</p>`;
    today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);

    var dict = {
        "notarjeta": document.getElementById("user" + numero).value,
        "fecha": today.toISOString().split('T')[0]
    }
    
    var formData = new FormData();
    formData.append("type", "docente por ID");
    formData.append("data", JSON.stringify(dict));
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

        needed = 0;

        for (var i = 1; i < table.rows.length; i++){
            const button = table.rows[i].querySelector("button");
            const style = button.getAttribute("style");

            if (style !== null){
                const user = table.rows[i].querySelector("input").value;

                if (datos["IDUsuario"] === button.IDUsuario){
                    needed++;
                }
            }
        }

        if (data.data === "false"){
            document.getElementById("second_container_overlay").innerHTML = `<h1>No encontrado...</h1>
                <button red onclick="close_second_window()">Cerrar</button>`;
            
            return;
        }else if (needed >= 1){
            container.innerHTML = `<h1>Usuario repetido</h1>
                <p>Los usuarios solo pueden llevarse solo un ejemplar de cada título a la vez.</p>
                <button red onclick="close_second_window()">Cerrar</button>`;

            return;
        }else if (datos["YaPrestado"] == 1){
            container.innerHTML = `<h1>Libro ya prestado</h1>
                <p id="temp_text"></p>
                <button red onclick="close_second_window()">Cerrar</button>`;
            let temp = document.getElementById("temp_text");
            temp.removeAttribute("id");
            temp.appendChild(document.createTextNode("El usuario: " + datos["Nombre"] + " " + datos["ApellidoPaterno"] + " " + datos["ApellidoMaterno"] + " ya tiene el libro prestado, no puede llevarse más de uno."));
            return;
        }else if (datos["Multado"] == 1 || datos["Expirado"] == 1 || datos["Bloqueado"] == 1){
            container.innerHTML = `<h1>Acción no permitida</h1>
                <p id="temp_text"></p>
                <p>Asegurese de que no tenga multas pendientes, prestamos expirados o que no este bloqueado para que pueda pedir un ejemplar prestado.</p>
                <button red onclick="close_second_window()">Cerrar</button>`;
            let temp = document.getElementById("temp_text");
            temp.removeAttribute("id");
            temp.appendChild(document.createTextNode("El usuario: " + datos["Nombre"] + " " + datos["ApellidoPaterno"] + " " + datos["ApellidoMaterno"] + " tiene una multa no saldada, un prestamo expirado o esta bloqueado."));
            return;
        }

        button = document.getElementById("button" + numero);
        button.estudiante = false;
        button.IDUsuario = datos["IDUsuario"];
        button.Nombre = datos["Nombre"] + " " + datos["ApellidoPaterno"] + " " + datos["ApellidoMaterno"];

        counter++;
        
        container.innerHTML = `<h1>Tipo de prestamo</h1>
            <p>Selecciona el tipo de prestamo que se hará con el usuario: <b class="temp_b"></b>.</p>
            <button id="en_sala" yellow style="margin: 0; padding: 1vw;">En sala</button>
            <button red style="margin: 0; padding-top: 0; padding-bottom: 0; padding-left: 1vw; padding-right: 1vw;" onclick="close_second_window()">Cancelar</button>
            <button id="a_domicilio" yellow style="margin: 0; padding: 1vw;">A domicilio</button>`;
        container.querySelector(".temp_b").textContent = button.Nombre;
        let temp = document.getElementById("en_sala");
        temp.addEventListener("click", function() {
            select_type_loan(0, 0, button);
        });
        temp = document.getElementById("a_domicilio");
        temp.addEventListener("click", function() {
            select_type_loan(1, 0, button);
        });
    });
}

function send_query(text, formData){
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
            document.getElementById("container_overlay").innerHTML = text;
        }else if (data.status === "error"){
            document.getElementById("container_overlay").innerHTML = `<h1>Error del servidor</h1>
                <p id="temp_p">Ocurrio un error del lado del servidor, comuniquese con el Centro de Información al respecto o vuelva a intentarlo más tarde:<br><br></p>
                <button type="cancel" onclick="return close_window()">Volver</button>`;
            let temp = document.getElementById("temp_p");
            temp.removeAttribute("id");
            temp.appendChild(document.createTextNode(data.message));
        }
    });
}

function get_page_data(){
    var formData = new FormData();

    formData.append("type", "vista titulo");
    formData.append("IDTitulo", urlParams.get("id"));

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

        tomo = "---";
        volumen = "---";
        
        if (datos["NoTomo"] !== null){
            tomo = datos["NoTomo"];
            
            if (datos["Tomo"] !== null){
                tomo += " - " + datos["Tomo"];
            }
        }else if (datos["Tomo"] !== null){
            tomo = datos["Tomo"];
        }

        if (datos["NoVolumen"] !== null){
            volumen = datos["NoVolumen"];
            
            if (datos["Volumen"] !== null){
                volumen += " - " + datos["Volumen"];
            }
        }else if (datos["Volumen"] !== null){
            volumen = datos["Volumen"];
        }

        update_page();
    });
}

function update_page(){
    document.getElementById("book_leftside").innerHTML = `<h1>Datos del titulo</h1>
        <p data id="titulo_temp"><b>Titulo: </b></p>
        <p data id="editorial_temp"><b>Editorial: </b></p>
        <p data id="ubicacion_temp"><b>Lugar publicación: </b></p>
        <p data id="clasificacion_temp"><b>Clasificación: </b></p>
        <p data id="edicion_temp"><b>Edición: </b></p>
        <p data id="autores_temp" style="-webkit-line-clamp: 2; line-clamp: 2;"><b>Autores: </b></p>
        <button style="padding-left:1vw; padding-right:1vw; margin: 0 max(1vw, 5.5px)" onclick="modificar_titulo()">Modificar</button>
        <button style="padding-left:1vw; padding-right:1vw; margin: 0 max(1vw, 5.5px)" onclick="history.back()">Volver</button>`;
    document.getElementById("book_rightside").innerHTML = `<p data id="isbn_temp" style="margin-top: 2.5vw; margin-bottom: max(1.5vw, 9px)"><b>ISBN: </b></p>
        <p data id="idioma_temp"><b>Idioma: </b></p>
        <p data id="anio_temp"><b>Año de publicación: </b></p>
        <p data id="tomo_temp"><b>Tomo: </b></p>
        <p data id="volumen_temp"><b>Volumen: </b></p>
        <p data id="ejemplares_temp"><b>No. de ejemplares: </b></p>
        <p data id="folios_temp" style="-webkit-line-clamp: 2; line-clamp: 2;"><b>Folios: </b></p>
        <button style="padding-left:1vw; padding-right:1vw; margin: 0 max(1vw, 5.5px)" onclick="gestionar_ejemplares()">Gestionar<br>ejemplares</button>
        <button style="padding-left:1vw; padding-right:1vw; margin: 0 max(1vw, 5.5px)" onclick="prestar_ejemplares()">Prestar<br>ejemplares</button>`;
    let temp = document.getElementById("titulo_temp");
    temp.appendChild(document.createTextNode(datos["Titulo"]));
    temp = document.getElementById("editorial_temp");
    temp.appendChild(document.createTextNode(datos["Editorial"] === null ? "---" : datos["Editorial"]));
    temp = document.getElementById("ubicacion_temp");
    temp.appendChild(document.createTextNode(datos["Ubicacion"] === null ? "---" : datos["Ubicacion"]));
    temp = document.getElementById("clasificacion_temp");
    temp.appendChild(document.createTextNode((datos["Clasificacion"] === null) ? "---" : datos["Clasificacion"]));
    temp = document.getElementById("edicion_temp");
    temp.appendChild(document.createTextNode(datos["Edicion"] === null ? "---" : datos["Edicion"]));
    temp = document.getElementById("autores_temp");
    temp.appendChild(document.createTextNode((datos["Autores"] === null) ? "---" : datos["Autores"]));
    temp = document.getElementById("isbn_temp");
    temp.appendChild(document.createTextNode(datos["ISBN"] === null ? "---" : datos["ISBN"]));
    temp = document.getElementById("idioma_temp");
    temp.appendChild(document.createTextNode(datos["Idioma"]));
    temp = document.getElementById("anio_temp");
    temp.appendChild(document.createTextNode(datos["AnioPublicacion"] === null ? "---" : datos["AnioPublicacion"]));
    temp = document.getElementById("tomo_temp");
    temp.appendChild(document.createTextNode(tomo));
    temp = document.getElementById("volumen_temp");
    temp.appendChild(document.createTextNode(volumen));
    temp = document.getElementById("ejemplares_temp");
    temp.appendChild(document.createTextNode(datos["NoFolios"]));
    temp = document.getElementById("folios_temp");
    temp.appendChild(document.createTextNode(datos["Folios"]));
}

async function modificar_titulo(){
    document.getElementById("book_leftside").innerHTML = `<h1>Datos del titulo</h1>
        <div class="vertical_spacing"><p data style="display: inline"><b>Titulo: </b></p><input required style="width: 73%" id="titulo" type="text" placeholder="Titulo..." required></div>
        <div class="vertical_spacing"><p data style="display: inline"><b>Editorial: </b></p><div style="display: inline-block; width: 69%;"><select id="editorial" placeholder="Editorial..."></select></div></div>
        <div class="vertical_spacing"><p data id="ubicacion"><b>Lugar publicación: </b></p></div>
        <div class="vertical_spacing"><p data style="display: inline"><b>Clasificación: </b></p><input style="width: 56%;" id="clasificacion" placeholder="Clasificación..."></select></div>
        <div class="vertical_spacing"><p data style="display: inline"><b>Edición: </b></p><input style="width: 68%" id="edicion" type="text" placeholder="Edición..."></div>
        <div class="vertical_spacing"><p data style="display: inline; -webkit-line-clamp: 2; line-clamp: 2;"><b>Autores: </b></p><div style="display: inline-block; width: 70%;"><select id="autores" placeholder="Autores..." multiple></select></div></div>
        <button onclick="return confirmar_cambios()">Guardar</button>`;
    document.getElementById("book_rightside").innerHTML = `<div class="vertical_spacing" style="margin-top: 2.5vw; margin-bottom: max(1.5vw, 9px)"><p data style="display: inline;"><b>ISBN: </b></p><input style="width: 76%" id="isbn" type="text" placeholder="###-###-###..."></div>
        <div class="vertical_spacing"><p data style="display: inline"><b>Idioma: </b></p><div style="display: inline-block; width: 72%;"><select id="idioma" placeholder="Idioma..." required>
            <option value="">Selecciona una opción...</option>
            <option value="Español">Español</option>
            <option value="Inglés">Inglés</option>
        </select></div></div>
        <div class="vertical_spacing"><p data style="display: inline"><b>Año de publicación: </b></p><input style="width: 30%" id="anio" type="number" placeholder="####...."></div>
        <div class="vertical_spacing"><p data style="display: inline"><b>Tomo: </b></p><input style="width: 15%" id="notomo" type="number" placeholder="##..."><p style="display: inline"> - </p><input style="width: 45%" id="tomo" type="text" placeholder="Nombre del tomo..."></div>
        <div class="vertical_spacing"><p data style="display: inline"><b>Volumen: </b></p><input style="width: 15%" id="novolumen" type="number" placeholder="##..."><p style="display: inline"> - </p><input style="width: 35%" id="volumen" type="text" placeholder="Nombre del volumen..."></div>
        <p data id="nofolios_temp"><b>No. de ejemplares: </b></p>
        <p data id="folios_temp" style="-webkit-line-clamp: 2; line-clamp: 2;"><b>Folios: </b></p>
        <button onclick="return cancelar_cambios()">Cancelar</button>`;
    let temp = document.getElementById("titulo");
    temp.value = datos["Titulo"];
    temp = document.getElementById("ubicacion");
    temp.appendChild(document.createTextNode(datos["Ubicacion"] === null ? "---" : datos["Ubicacion"]));
    temp = document.getElementById("edicion");
    temp.value = (datos["Edicion"] === null ? "" : datos["Edicion"]);
    temp = document.getElementById("isbn");
    temp.value = (datos["ISBN"] === null ? "" : datos["ISBN"]);
    temp = document.getElementById("anio");
    temp.value = (datos["AnioPublicacion"] === null ? "" : datos["AnioPublicacion"]);
    temp = document.getElementById("notomo");
    temp.value = ((datos["NoTomo"] === null) ? "" : datos["NoTomo"]);
    temp = document.getElementById("novolumen");
    temp.value = ((datos["NoVolumen"] === null) ? "" : datos["NoVolumen"]);
    temp = document.getElementById("tomo");
    temp.value = ((datos["Tomo"] === null) ? "" : datos["Tomo"]);
    temp = document.getElementById("volumen");
    temp.value = ((datos["Volumen"] === null) ? "" : datos["Volumen"]);
    temp = document.getElementById("clasificacion");
    temp.value = ((datos["Clasificacion"] === null) ? "" : datos["Clasificacion"]);
    temp = document.getElementById("nofolios_temp");
    temp.appendChild(document.createTextNode(datos["NoFolios"]));
    temp = document.getElementById("folios_temp");
    temp.appendChild(document.createTextNode(datos["Folios"]));
    editorial_combobox = $("#editorial").selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;
    autores_combobox = $("#autores").selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;
    idioma_combobox = $("#idioma").selectize({
        sortField: 'text',
        normalize: true
    })[0].selectize;
    idioma_combobox.setValue(datos["Idioma"]);

    await search_data_combobox(editorial_combobox, "editorial");
    await search_data_combobox(autores_combobox, "autores");
        
    editorial_combobox.setValue(datos["IDEditorial"]);
    if (datos["IDAutores"] !== null){
        autores_combobox.setValue(datos["IDAutores"].split(", "));
    }
}

async function search_data_combobox(combobox, type_search){
    var formData = new FormData();
    formData.append("type", type_search);

    await fetch("../php/admin_search_queries.php", {
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
        if (data.status === "user-not-admin" || data.status === "user-not-authenticated"){
            window.location.href = "../index.html";
        }else if (data.status === "success"){
            combobox.clear();
            combobox.clearOptions();
            switch (type_search){
                case "editorial":
                    JSON.parse(data.data).forEach((item) => {
                        combobox.addOption({"value": item["IDEditorial"], "text": item["Nombre"]});
                    });
                break;
                case "autores":
                    JSON.parse(data.data).forEach((item) => {
                        combobox.addOption({"value": item["IDAutor"], "text": item["Nombre"]});
                    });
                break;
            }
            combobox.refreshOptions(false);
        }
    })
    .catch(error => {
        open_overlayed_window();
        document.getElementById("content_div").innerHTML = `<h1 style='font-size: 34px;'>Error del Servidor</h1>
            <p id="error_temp">Parece que sucedio un error del lado del servidor, la siguiente información se recabo al respecto, favor de comunicarlo al Centro de Información:<br></p>`;
        let temp = document.getElementById("error_temp");
        temp.removeAttribute("id");
        temp.appendChild(document.createTextNode(error));
    });
}

function confirmar_cambios(){
    titulo = document.getElementById("titulo").value;
    idioma = idioma_combobox.getValue();

    if (titulo === "" || idioma === ""){
        return true;
    }

    open_overlayed_window();
    document.getElementById("container_overlay").innerHTML = `<h1>Confirmar accion</h1>
        <p>Esta por guardar los cambios que haya realizado sobre este titulo.</p>
        <p>¿Desea continuar?</p>
        <button onclick='commit_cambios()'>Continuar</button>
        <button onclick='close_window()'>Cancelar</button>`;
}

function commit_cambios(){
    if (titulo === "" || idioma === ""){
        return true;
    }

    var dict = {
        "editorial": editorial_combobox.getValue(),
        "titulo": document.getElementById("titulo").value,
        "ISBN": document.getElementById("isbn").value,
        "codigo": document.getElementById("clasificacion").value,
        "anio": document.getElementById("anio").value,
        "idioma": idioma_combobox.getValue(),
        "edicion": document.getElementById("edicion").value,
        "notomo": document.getElementById("notomo").value,
        "nombretomo": document.getElementById("tomo").value,
        "novolumen": document.getElementById("novolumen").value,
        "nombrevolumen": document.getElementById("volumen").value,
        "autores": autores_combobox.getValue(),
        "id": urlParams.get("id")
    };

    if (dict["codigo"] === ""){
        dict["codigo"] = null;
    }

    if (dict["ISBN"] === ""){
        dict["ISBN"] = null;
    }

    if (dict["editorial"] === ""){
        dict["editorial"] = null;
    }

    if (dict["anio"] === ""){
        dict["anio"] = null;
    }

    if (dict["edicion"] === ""){
        dict["edicion"] = null;
    }

    if (dict["notomo"] === ""){
        dict["notomo"] = null;
    }else{
        dict["notomo"] = parseInt(dict["notomo"]);
    }

    if (dict["nombretomo"] === ""){
        dict["nombretomo"] = null;
    }

    if (dict["novolumen"] === ""){
        dict["novolumen"] = null;
    }else{
        dict["novolumen"] = parseInt(dict["novolumen"]);
    }

    if (dict["nombrevolumen"] === ""){
        dict["nombrevolumen"] = null;
    }

    if (dict["codigo"] === ""){
        dict["codigo"] = null;
    }

    var formData = new FormData();
    formData.append("type", "update titulo");
    formData.append("data", JSON.stringify(dict));

    send_query("<h1>Datos actualizados</h1><p>Los datos del libro han sido actualizados</p><button onclick='close_reload()'>Cerrar</button>", formData);
}

function close_reload(){
    close_window();
    get_page_data();
}

function cancelar_cambios(){
    open_overlayed_window();
    document.getElementById("container_overlay").innerHTML = `<h1>Confirmar accion</h1>
        <p>¿Seguro que desea continuar y deshacer todos los cambios que ha realizado?</p>
        <button onclick='close_and_update()'>Continuar</button>
        <button onclick='close_window()'>Cancelar</button>`;
    
    return false;
}

function close_and_update(){
    close_window();
    update_page();
}

document.addEventListener("DOMContentLoaded", () => {
    urlParams = new URLSearchParams(window.location.search);

    document.getElementById("book_view_form").onsubmit = form_prevent;

    get_page_data();
});