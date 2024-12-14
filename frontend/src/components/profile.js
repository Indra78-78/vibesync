import React, { useEffect, useState } from "react";
import "../css/Profile.css";
import PostDetail from "./PostDetails";
import ProfilePic from "./ProfilePic";

export default function Profile() {
  const piclink = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhcdVEzoVWLyCqD6wPIyxnxW3L2lYNzsmrGHK-A-tGxA&s';
  const [pic, setPic] = useState([]);
  const [show, setShow] = useState(false);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState('');
  const [changePic, setChangePic] = useState(false);

  const toggleDetails = (posts) => {
    setShow(!show);
    setPosts(posts);
  };

  const changeProfile = () => {
    setChangePic(!changePic);
  };

  const fetchUserData = () => {
    fetch(`/user/${JSON.parse(localStorage.getItem("user"))._id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setPic(result.posts);
        setUser(result.user); 
        console.log(result);
      });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const renderMedia = (mediaUrl) => {
    const fileType = mediaUrl.split('.').pop();
    if (["mp4", "webm", "ogg"].includes(fileType)) {
      return <video src={mediaUrl} controls className="media" />;
    }
    return <img src={mediaUrl} alt="post media" className="media" />;
  };

  return (
    <div className="profile">
      <div className="profile-frame">
        <div className="profile-pic">
          <img onClick={changeProfile}
            src={user.Photo ? user.Photo : piclink} alt=""
          />
        </div>
        <div className="profile-data">
          <h1>{JSON.parse(localStorage.getItem("user")).name}</h1>
          <div className="profile-info">
            <p>{pic ? pic.length : "0"} posts</p>
            <p>{user.followers ? user.followers.length : "0"} followers</p>
            <p>{user.followING ? user.followING.length : "0"} following</p>
          </div>
        </div>
      </div>
      <hr style={{ width: "90%", margin: "20px auto", opacity: "0.8" }} />
      <div className="gallery">
        {pic.map((pics) => (
          <div key={pics._id} onClick={() => { toggleDetails(pics); }} className="item">
            {renderMedia(pics.photo)}
          </div>
        ))}
      </div>
      {show && <PostDetail item={posts} toggleDetails={toggleDetails} />}
      {changePic && <ProfilePic changeprofile={fetchUserData} />}
    </div>
  );
}
