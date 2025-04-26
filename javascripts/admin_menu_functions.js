function get_menu_data(){
    var formData = new FormData();
    today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    formData.append("type", "menu");
    formData.append("fecha", today.toISOString().split('T')[0]);

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

        document.getElementById("pfp").src = "../images/profile" + datos[5] + ".png"
        document.getElementById("user_greet").textContent = "¡Bienvenid" + ((datos[5] === "M") ? "o" : "a") + " " + datos[4] + "!";
        document.getElementById("bloqueados").textContent = "Usuarios bloqueados: " + datos[0];
        let container = document.getElementById("conteo");
        container.textContent = "Prestamos expirados: " + datos[1];
        container.appendChild(document.createElement("br"));
        container.appendChild(document.createTextNode("Reservaciones expiradas: " + datos[2]));
        container.appendChild(document.createElement("br"));
        container.appendChild(document.createTextNode("Multas NO saldadas: " + datos[3]));
    });
}

document.addEventListener("DOMContentLoaded", () => {
    get_menu_data();
});