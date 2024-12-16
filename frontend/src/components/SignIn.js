/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-useless-escape */
import React, {  useState ,useContext} from "react"
import logo from "../image/logo.jpg"
import "../css/Signin.css"

import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { LoginContext } from "../context/loginContext"

 

export default function SignIn() {

    const {setuserLogin}=useContext(LoginContext)
    const navigate = useNavigate()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const emailRegex=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const notifyA = (msg) => toast.error(msg);
    const notifyB = (msg) => toast.success(msg);
    const postData = () => {
        //CHECKING EMAIL
        if (!emailRegex.test(email)) {
            notifyA("invalid Email")
            return
        }

        //SENDING DATA TO SERVER
        fetch(`/signin`, {
            method: "post",
            headers: {
                "Content-Type": "application/json"

            },
            body: JSON.stringify({
                email: email, password: password
            })
        }).then(res => res.json())
            .then(data => {
                if (data.error) {
                    notifyA(data.error)
                } else {
                    navigate(`/profile`)
                    notifyB("Signed in succesfully")
                    console.log(data)
                    localStorage.setItem("jwt",data.token)
                    localStorage.setItem("user",JSON.stringify(data.user))
                    setuserLogin(true)
                    
                }

                console.log(data)
            })
    }

    return (
        <div className="signIn">
            <div>
                <div className="loginForm">
                    <img className="signUpLogo" src={logo} />
                    <div><input type="email" name="email" id="email" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value) }} /></div>

                    <div><input type="password" name="password" id="password" placeholder="Password" value={password} onChange={(e) => { setPassword(e.target.value) }} /></div>
                    <input type="submit" id="login-btn" value={"Sign In"} onClick={()=>{postData()}} />
                </div>
                <div className="form2">
                    Do not have an account ? <Link to={"/signup"} ><span style={{ color: "white", cursor: "pointer", fontWeight: "380" }}> Sign Up </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}