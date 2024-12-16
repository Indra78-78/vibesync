import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/home.css";
import "../css/navbar.css"
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function Home() {
    const picLink = "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg";
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [comment, setComment] = useState("");
    const [expandedText, setExpandedText] = useState({});
    const videoRefs = useRef({});

    const notifyA = (msg) => toast.error(msg);
    const notifyB = (msg) => toast.success(msg);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) {
            navigate("/signup");
        } else {
            fetchData();
        }
    }, [navigate]);

    const fetchData = () => {
        fetch(`/allposts`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
            .then(res => res.json())
            .then(result => {
                setData(result);
            })
            .catch(err => console.log(err));
    };

    const handleLikeUnlike = (id, action) => {
        const url = action === "like" ? "like" : "unlike";
        fetch(`/${url}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                postId: id
            })
        })
            .then(res => res.json())
            .then(result => {
                const newData = data.map(post => post._id === result._id ? result : post);
                setData(newData);
            })
            .catch(err => console.error('Error:', err));
    };

    const makeComment = (text, id) => {
        fetch(`/comment`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                text: text,
                postId: id
            })
        }).then(res => res.json())
            .then((result) => {
                if (result.error) {
                    notifyA(result.error);
                } else {
                    const newData = data.map(post => post._id === result._id ? result : post);
                    setComment("");
                    setData(newData);
                    notifyB("Commented Successfully");
                }
            }).catch(err => notifyA("Failed to comment"));
    };

    const toggleComments = (index) => {
        const newData = [...data];
        newData[index].showComments = !newData[index].showComments;
        setData(newData);
    };

    const toggleText = (id) => {
        setExpandedText(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    const renderText = (text, id) => {
        const maxLength = 62;
        if (text.length <= maxLength || expandedText[id]) {
            return (
                <>
                    {text}
                    {text.length > maxLength && (
                        <span onClick={() => toggleText(id)} style={{ color: "blue", cursor: "pointer" }}>
                            {expandedText[id] ? " show less" : ""}
                        </span>
                    )}
                </>
            );
        }
        return (
            <>
                {text.substring(0, maxLength)}...
                <span onClick={() => toggleText(id)} style={{ color: "blue", cursor: "pointer" }}>
                    {" show more"}
                </span>
            </>
        );
    };

    const renderMedia = (mediaUrl, id) => {
        const fileType = mediaUrl.split('.').pop();
        if (["mp4", "webm", "ogg"].includes(fileType)) {
            return (
                <video
                    key={id}
                    src={mediaUrl}
                    controls
                    className="media"
                    ref={(el) => { videoRefs.current[id] = el; }}
                    autoPlay
                    muted
                    onClick={() => toggleVideoPlayPause(id)}
                />
            );
        }
        return <img src={mediaUrl} alt="post media" className="media" key={id} />;
    };

    const toggleVideoPlayPause = (id) => {
        const video = videoRefs.current[id];
        if (video) {
            if (video.paused || video.ended) {
                video.play();
            } else {
                video.pause();
            }
        }
    };
    
    

    return (
        <div className="home">
            {data.length > 0 && data.map((post, index) => (
                <div className="card" key={post._id}>
                    <div className="card-header">
                        <div className="card-pic">
                            <img src={post.postedBy.Photo ? post.postedBy.Photo : picLink} alt="profile" />
                        </div>
                        <h5 style={{textDecoration:"none"}}>
                            <Link to={`/profile/${post.postedBy._id}`} style={{ color: "black" }}>
                                {post.postedBy.name}
                            </Link>
                        </h5>
                    </div>
                    <div className="card-media" onDoubleClick={() => handleLikeUnlike(post._id, post.likes.includes(JSON.parse(localStorage.getItem("user"))._id) ? "unlike" : "like")}>
                        {renderMedia(post.photo, post._id)}
                    </div>
                    <div className="card-content">
                        {post.likes.includes(JSON.parse(localStorage.getItem("user"))._id) ? (
                            <span className="material-symbols-outlined material-symbols-outlined-red" onClick={() => handleLikeUnlike(post._id, "unlike")}>favorite</span>
                        ) : (
                            <span className="material-symbols-outlined" onClick={() => handleLikeUnlike(post._id, "like")}>favorite</span>
                        )}
                        
                        <p>{post.likes.length} likes</p>
                        
                        <p>{renderText(post.body, post._id)}</p>
                        <p style={{ fontWeight: "bold", cursor: "pointer" }} onClick={() => toggleComments(index)}>view all comments</p>
                        
                    </div>
                    <div className="add-comment">
                        <span className="material-symbols-outlined">sentiment_satisfied</span>
                        <input type="text" placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
                        <button className="comment" onClick={() => makeComment(comment, post._id)}>Post</button>
                    </div>
                    {post.showComments && (
                        <div className="comment-section">
                            {post.comments.map((comment) => (
                                <p className="comm" key={comment._id}>
                                    <span className="commenter" style={{fontSize:"10px",fontFamily:"cursive"}}>{comment.postedBy.name}:</span>
                                    <span className="commentText" style={{fontSize:"9.5px"}}> {comment.comment}</span>
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}