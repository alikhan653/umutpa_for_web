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
                document.getElementById("usernamePlaceholder").innerHTML = email_id;
                document.getElementById("personImage").src = userImg;
                if(document.getElementById("div-name")){
                    document.getElementById("div-name").innerText = userName;
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