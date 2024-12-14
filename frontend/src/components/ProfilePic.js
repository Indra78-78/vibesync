/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
// import { cloudinary_cloud_name, cloudinary_upload_preset } from "../keys";

export default function ProfilePic({ changeprofile }) {
    const hiddenFileInput = useRef(null);
    const [image, setImage] = useState(null);
    const [url, setUrl] = useState("");

    const handleClick = () => {
        hiddenFileInput.current.click();
    };

    const handleDelete = () => {
        setUrl(null);
        postPic(null);
    };

    useEffect(() => {
        if (image) {
            postDetails();
        }
    }, [image]);

    const postDetails = () => {
        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", "instaclone12");
        data.append("cloud_name", "instagram-arjun");

        fetch("https://api.cloudinary.com/v1_1/instagram-arjun/image/upload", {
            method: "post",
            body: data,
        })
            .then((res) => res.json())
            .then((data) => setUrl(data.url))
            .catch((err) => console.error("Error uploading image:", err));
    };

    const postPic = (picUrl) => {
        fetch(`/uploadProfilePic`, {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
            body: JSON.stringify({
                pic: picUrl,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                changeprofile();
            
                    window.location.reload(); // Optional: to reload the page if the photo is deleted
                
            })
            .catch((err) => console.error("Error updating profile picture:", err));
    };

    useEffect(() => {
        if (url) {
            postPic(url);
        }
    }, [url]);

    return (
        <div className="profilePic darkBg">
            <div className="changePic centered">
                <div>
                    <h4>Change Profile Photo</h4>
                </div>
                <div style={{ borderTop: "0.5px solid black" }}>
                    <button
                        className="upload-btn"
                        style={{ color: "blue", fontWeight: "bold" }}
                        onClick={handleClick}
                    >
                        Upload Photo
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={hiddenFileInput}
                        style={{ display: "none" }}
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                </div>
                <div style={{ borderTop: "0.5px solid grey" }}>
                    <button
                        className="delete-btn"
                        style={{ color: "red", fontWeight: "bold" }}
                        onClick={handleDelete}
                    >
                        Delete Photo
                    </button>
                </div>
                <div style={{ borderTop: "0.5px solid grey" }}>
                    <button
                        className="cancel-btn"
                        style={{ color: "red" }}
                        onClick={() => window.location.reload()}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
