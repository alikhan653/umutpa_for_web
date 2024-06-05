const auth = firebase.auth();
console.log(auth.currentUser);
auth.onAuthStateChanged(function (user) {
    if (user) {
        var email_id = user.email;
        var userId = user.uid;

        console.log(user.uid);
        var dbRef = firebase.database().ref('Users/' + userId);

        dbRef.once('value').then((snapshot) => {
            if (snapshot.exists()) {
                var userData = snapshot.val();
                var userName = userData.first_name;
                var userImg = userData.imageUrl;
                if(document.getElementById("usernamePlaceholder"))
                    document.getElementById("usernamePlaceholder").innerHTML = userName;
                if(document.getElementById("personImage"))
                    document.getElementById("personImage").src = userImg;
                if(document.getElementById("div-name")){
                    console.log('div-name' + userName)
                    document.getElementById("div-name").innerText = userName;
                }
                if(document.getElementById("doctor-name")){
                    document.getElementById("doctor-name").innerText = userName;
                }
                if(document.getElementById("div-position")){
                    document.getElementById("div-position").innerText = userData.position + " ";
                }
                var userRole = userData.role;
                console.log(userRole)
                if (userRole === "Admin") {
                    console.log("Admin")
                    // const ul = document.querySelector('.list-group');
                    // const adminButton = document.createElement('a');
                    // adminButton.id = "admin-button";
                    // adminButton.className = "list-group-item";
                    // adminButton.href = "addPat.html";
                    // adminButton.setAttribute('data-toggle', 'tooltip');
                    // adminButton.setAttribute('data-placement', 'bottom');
                    // adminButton.setAttribute('title', 'Admin Panel');
                    // adminButton.innerHTML = '<i class="las la-code la-lw"></i><span>Admin Panel</span>';
                    // ul.insertBefore(adminButton, ul.querySelector('.divider'));
                }
            } else {
                console.log("No data available for the specified user ID");
            }
        }).catch((error) => {
            console.error("Error fetching data: ", error);
        });
    } else {
        window.location.href = "login.html";
    }
});