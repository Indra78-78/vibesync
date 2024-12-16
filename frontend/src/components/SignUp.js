import React, {  useState } from "react"
import logo from "../image/logo.jpg"

import "../css/SignUp.css"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
// import { GoogleOAuthProvider } from '@react-oauth/google';
// import { GoogleLogin } from 'react-google-login';

export default function SignUp() {
    const navigate = useNavigate()
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");

    // // TOAST COMMENTS
    const notifyA = (msg) => toast.error(msg);
    const notifyB = (msg) => toast.success(msg);
    // //FUNCTION TO POST DATA
    const emailRegex = /^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/
    const passwordRegex = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
    const postData = () => {
        //CHECKING EMAIL
        if (!emailRegex.test(email)) {
            notifyA("invalid Email")
            return
        } else if (!passwordRegex.test(password)) {
            notifyA("Password must be 8-10 characters long, with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.")
            return
        }
    
    //     //SENDING DATA TO SERVER
        fetch(`/signup`, {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name, userName: userName, email: email, password: password
            })
        }).then(res => res.json())
            .then(data => {
                if (data.error) {
                    notifyA(data.error)
                } else {
                    notifyB(data.message)
                    navigate("/signin")
                }

                console.log(data)
            })
    }

    return (
        <div className="signUp">
            <div className="form-container">
                <div className="form">
                    <img className="signUpLogo" src={logo} alt="hgcg" />
                    <p className="loginPara">
                        SignUp to see photos and videos<br /> of your friends
                    </p>
                    <div><input type="email" name="email" id="email" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value) }} /></div>
                    <div><input type="text" name="name" id="name" placeholder="Full Name" value={name} onChange={(e) => { setName(e.target.value) }} /></div>
                    <div><input type="text" name="username" id="username" placeholder="User Name" value={userName} onChange={(e) => { setUserName(e.target.value) }} /></div>
                    <div><input type="password" name="password" id="password" placeholder="Password" value={password} onChange={(e) => { setPassword(e.target.value) }} /></div>
                    <p className="loginPara">
                        By Signing up you agree to our Terms,<br />privacy policy and cookies policy.
                    </p>
                    <input type="submit" id="submit-btn" value={"Sign Up"} onClick={() => { postData() }} />

                </div>
                <div className="form2">
                    Already have an account ? <Link to={"/signin"} ><span style={{ color: "white", cursor: "pointer", fontWeight: "380" }}> Sign In </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
