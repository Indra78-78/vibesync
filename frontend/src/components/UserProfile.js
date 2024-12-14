import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/Profile.css";

export default function UserProfile() {
    const defaultPicLink = "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg";
    const { userid } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState("");
    const [posts, setPosts] = useState([]);
    const [isFollow, setIsFollow] = useState(false);

    const followUser = (userId) => {
        fetch(`/follow`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({ followId: userId })
        })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            setIsFollow(true);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    const unfollowUser = (userId) => {
        fetch(`/unfollow`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({ followId: userId })
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error('Network response was not ok ' + res.statusText);
            }
            return res.json();
        })
        .then((data) => {
            console.log(data);
            setIsFollow(false);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };
    const renderMedia = (mediaUrl) => {
        const fileType = mediaUrl.split('.').pop();
        if (["mp4", "webm", "ogg"].includes(fileType)) {
            return <video src={mediaUrl} controls className="media" />;
        }
        return <img src={mediaUrl} alt="post media" className="media" />;
    };
    useEffect(() => {
        fetch(`/user/${userid}`, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => res.json())
        .then((result) => {
            console.log(result);
            setUser(result.user);
            setPosts(result.posts);
            if (result.user.followers.includes(JSON.parse(localStorage.getItem("user"))._id)) {
                setIsFollow(true);
            } else {
                setIsFollow(false);
            }
        })
        .catch(error => console.error("Error fetching user profile:", error));
    }, [userid]);

    const messageUser = () => {
        const senderId = JSON.parse(localStorage.getItem("user"))._id;
        const receiverId = userid;

        fetch(`/conversation`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({ senderId, receiverId })
        })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            navigate(`/message`);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    return (
        <div className="profile">
            <div className="profile-frame">
                <div className="profile-pic">
                    <img src={user.Photo || defaultPicLink} alt="" />
                </div>
                <div className="profile-data">
                    <div style={{ display: "block", alignItems: "center", justifyContent: "space-between" }}>
                        <h1>{user.name}</h1>
                        <div>
                            <div className="btns">
                                <button className="followBtn" onClick={() => {
                                    if (isFollow) {
                                        unfollowUser(user._id);
                                    } else {
                                        followUser(user._id);
                                    }
                                }}>
                                    {isFollow ? "Unfollow" : "Follow"}
                                </button>
                                <button className="messageBtn" onClick={messageUser}>
                                    Message
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="profile-info" style={{ display: "flex" }}>
                        <p>{posts.length} POSTS</p>
                        <p>{user.followers ? user.followers.length : "0"} FOLLOWERS</p>
                        <p>{user.following ? user.following.length : "0"} FOLLOWING</p>
                    </div>
                </div>
            </div>
            <hr style={{ width: "90%", margin: "15px auto", opacity: "0.8" }} />
            <div className="gallery">
                {posts && posts.map((pics) => (
                    <div key={pics._id} className="item">
                        {renderMedia(pics.photo)}
                    </div>
                ))}
            </div>
        </div>
    );
}


