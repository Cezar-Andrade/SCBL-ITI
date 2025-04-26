function get_menu_data(){
    var formData = new FormData();
    formData.append("type", "menu_user");

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

        document.getElementById("pfp").src = "../images/profile" + datos[3] + ".png"
        document.getElementById("user_greet").innerHTML = "¡Bienvenid" + ((datos[3] === "M") ? "o" : "a") + " " + datos[2] + "!";
        document.getElementById("multas").innerHTML = "Multas a deber: " + datos[0];
        document.getElementById("reservaciones").innerHTML = "Reservaciones permitidas: " + (3 - datos[1]);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    get_menu_data();
});