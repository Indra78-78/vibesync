import React, { useState, useEffect } from 'react';
import '../css/createPost.css';
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
// import { cloudinary_cloud_name,cloudinary_upload_preset } from '../keys';

export default function Createpost() {
    // var picLink = "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg";

    const navigate = useNavigate();
    const [body, setBody] = useState("");
    const [image, setImage] = useState(null); // Changed to null initially
    const [url, setUrl] = useState("");

    const notifyA = (msg) => toast.error(msg);
    const notifyB = (msg) => toast.success(msg);

    useEffect(() => {
        if (url) {
            // Saving post to MongoDB
            fetch("/createPost", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("jwt")
                },
                body: JSON.stringify({
                    body,
                    pic: url
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        notifyA(data.error);
                    } else {
                        notifyB("Successfully Posted");
                        navigate("/");
                    }
                })
                .catch(err => {
                    console.log(err);
                    notifyA("Error while posting. Please try again.");
                });
        }
    }, [url, body, navigate]);

    const postDetails = () => {
        if (image) {
            const data = new FormData();
            data.append("file", image);
            data.append("upload_preset", "instaclone12");
            data.append("cloud_name", "instagram-arjun");

            fetch("https://api.cloudinary.com/v1_1/instagram-arjun/image/upload", {
                method: "post",
                body: data
            })
                .then(res => res.json())
                .then(data => setUrl(data.url))
                .catch(err => {
                    console.log(err);
                    notifyA("Error uploading image. Please try again.");
                });
        } else {
            notifyA("Please select an image.");
        }
    };

    const loadFile = (event) => {
        const file = event.target.files[0];
        if (file) {
            var output = document.getElementById('output');
            output.src = URL.createObjectURL(file);
            output.onload = function () {
                URL.revokeObjectURL(output.src);
            };
            setImage(file); // Update image state
        }
    };

    return (
        <div className='createPost'>
            <div className="post-header">
                <h4 style={{ margin: "3px auto" }}>Create new Post</h4>
                <button id='post-btn' onClick={(e) => { postDetails() }}>Share</button>
            </div>
            <div className="main-div">
                <img id='output' src='' alt='' />
                <input type="file" accept="image/*" onChange={loadFile} />
            </div>
            {/* Details  */}
            <div className="details">
                <div className="card-header">
                    <div className="card-pic">
                        <img src={JSON.parse(localStorage.getItem("user")).Photo} alt="" />
                    </div>
                    <h5>{JSON.parse(localStorage.getItem("user")).name}</h5>
                </div>
                <textarea type="text" placeholder='Write a caption' onChange={(e) => setBody(e.target.value)}></textarea>
            </div>
        </div>
    );
}