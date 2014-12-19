define(['domReady', 'i18n!orion/mixloginstatic/nls/messages'], function(domReady, messages){
	
	function addPageContent(){
		// Authentication Buttons
		document.getElementById("signinBtn").innerHTML = messages["signin"];
		document.getElementById("registerBtn").innerHTML = messages["register"];
		// Copyright
		document.getElementById("copyright").innerHTML = messages["copyright"];
		if(isLoginPage()){
			setUpLoginPage();
		}else{
			setUpRegisterPage();
		}
	}

	function setUpLoginPage () {
		// Sign in section
		document.getElementById("emailLogin").innerHTML = messages["emailLogin"];
		document.getElementById("username").placeholder = messages["username"];
		document.getElementById("password").placeholder = messages["password"];
		var div = document.getElementById("rememberMe");
		div.innerHTML = div.innerHTML + messages["rememberMe"];
		document.getElementById("signInBtn").innerHTML = messages["signInBtn"];
		document.getElementById("forgotPassword").innerHTML = messages["forgotPassword"];
		// Social Login
		document.getElementById("socialLogin").innerHTML = messages["socialLogin"];
		document.getElementById("signInWithGoogle").innerHTML = messages["signInWithGoogle"];
		document.getElementById("signInWithGitHub").innerHTML = messages["signInWithGitHub"];
	}

	function setUpRegisterPage () {
		// Sign in section
		document.getElementById("emailLogin").innerHTML = messages["registerSection"];
		document.getElementById("username").placeholder = messages["username"];
		document.getElementById("password").placeholder = messages["password"];
		var div = document.getElementById("repeatPassword");
		div.placeholder = messages["repeatPassword"];
		div.style.display = "";
		div = document.getElementById("email");
		div.placeholder = messages["email"];
		div.style.display = "";
		document.getElementById("rememberMe").style.display = "none";

		document.getElementById("signInBtn").innerHTML = messages["signUp"];
		document.getElementById("forgotPassword").style.display = "none";
		// Social Login
		document.getElementById("socialLogin").innerHTML = messages["socialLogin"];
		document.getElementById("signInWithGoogle").innerHTML = messages["signUpWithGoogle"];
		document.getElementById("signInWithGitHub").innerHTML = messages["signUpWithGitHub"];
	}
	
	function isLoginPage(){
		var url = new URL(document.URL);
		var paths = url.pathname.split("/");
		return "register" !== paths[paths.length - 1];
	}
	
	domReady(function() {
		addPageContent();
	});
});