/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/home.css";
import { toast } from "react-toastify"
import { Link } from "react-router-dom";

export default function MyFollowingPost(){
    const picLink= "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg"
    const navigate = useNavigate()
    const [data, setData] = useState([])
    const [comment, setComment] = useState([])
    const [item, setItem] = useState(null); // Changed initial state to null
    const [show, setShow] = useState(false);
    const [, setRefreshData] = useState(true);

    const notifyA = (msg) => toast.error(msg);
    const notifyB = (msg) => toast.success(msg);

    useEffect(() => {
        const token = localStorage.getItem("jwt")
        if (!token) {
            navigate("./signup")
        }
        //FETCHING ALL TH POSTS
        fetch(`/myfollowingpost`, {
          
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt"),

            },
        }).then(res => res.json())
            .then(result => {
                console.log(result)
                setData(result)
                // setRefreshData(false)
            })
            .catch(err => console.log(err))
    }, [])
    // TO SHOW AND HIDE COMMENTS 
    const toggleComment = (posts) => {
        if (show) {
            setShow(false)

            // console.log("hide")
        }
        else {
            setShow(true)
            setItem(posts)
            // console.log(item)
            // console.log("Show")
        }
    }

    const likePost = (id) => {
        fetch(`like`, {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
            body: JSON.stringify({
                postId: id,
            }),

        }).then(res => res.json())
            .then((result) => {
                const newData = data.map((posts) => {
                    if (posts._id === result._id) {
                        return result
                    } else {
                        return posts
                    }
                })
                setData(newData)
                setRefreshData(true);
                console.log(result)
            });
    };
    const unlikePost = (id) => {
        fetch(`/unlike`, {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
            body: JSON.stringify({
                postId: id,
            }),

        }).then(res => res.json())
            .then((result) => {
                const newData = data.map((posts) => {
                    if (posts._id === result._id) {
                        return result
                    } else {
                        return posts
                    }
                })
                setData(newData)
                setRefreshData(true);
                console.log(result)
            });
    };

    // comment
    const makeComment = (text, id) => {
        fetch(`/comment`, {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
            body: JSON.stringify({
                text: text,
                postId: id,

            }),

        }).then(res => res.json())
            .then((result) => {
                const newData = data.map((posts) => {
                    if (posts._id === result._id) {
                        return result

                    } else {
                        return posts
                    }
                })

                console.log(result)
                setComment("")
                setData(newData)
                setRefreshData(true);
                notifyB("Commented Succesfully")
            });
    }

    return (
        <div className="home">
            {/* card */}
            {data.length > 0 && data.map((posts) => {
                return (
                    <div className="card">
                        {/* cardheader */}
                        <div className="card-header">
                            {/* cardpic */}
                            <div className="card-pic">
                            <img src={posts.postedBy.Photo ? posts.postedBy.Photo : picLink} alt="" />
                        </div>
                            <h5>
                                <Link to={`/profile/${posts.postedBy._id}`}style={{color:"black",textDecoration:"none"}}>
                                    {posts.postedBy.name}
                                </Link>
                            </h5>
                        </div>

                        {/* CARD IMAGE  */}
                        <div className="card-media">
                            <img src={posts.photo} alt="" />
                        </div>
                        {/* CARD CONTENT */}
                        <div className="card-content">
                            {
                                posts.likes.includes(JSON.parse(localStorage.getItem("user"))._id) ?
                                    (<span className="material-symbols-outlined material-symbols-outlined-red" onClick={() => { unlikePost(posts._id) }} >favorite</span>) : (<span className="material-symbols-outlined" onClick={() => { likePost(posts._id) }}>favorite</span>)
                            }


                            <p>{posts.likes.length} likes</p>
                            <p>{posts.body}</p>
                            <p style={{ fontWeight: "bold", cursor: "pointer" }} onClick={() => { toggleComment(posts); }}>view all comments</p>
                        </div>
                        {/* Add comment  */}
                        <div className="add-comment">
                            <span className="material-symbols-outlined">sentiment_satisfied</span>
                            <input type="text" placeholder="Add a comment...." value={comment} onChange={(e) => { setComment(e.target.value) }} />
                            <button className="comment" onClick={() => { makeComment(comment, posts._id) }}>Post</button>
                        </div>
                    </div>
                )
            })}
            {/* show comments  */}
            {show && (<div className="showComment">
                <div className="container">
                    <div className="postPic">
                        <img src={item.photo} alt="" /></div>
                    <div className="details">
                        <div className="card-header" style={{ borderBottom: "1px solid grey" }}>
                            {/* cardpic */}
                            <div className="card-pic">
                                <img src="https://images.unsplash.com/photo-1605909145192-c8e361e3eda7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDIwfFM0TUtMQXNCQjc0fHxlbnwwfHx8fHw%3D" alt="" />
                            </div>
                            <h5>{item.postedBy.name}</h5>
                        </div>
                        {/* comment section  */}
                        <div className="comment-section" style={{ borderBottom: "1px solid grey" }}>
                            {
                                item.comments.map((comment) => {
                                    return (<p className="comm">
                                        <span className="commenter">{comment.postedBy.name} : </span>
                                        <span className="commentText"> {comment.comment}</span>
                                    </p>)

                                })
                            }

                        </div>

                        {/* card content  */}
                        <div className="card-content">



                            <p>{item.likes.length} likes</p>
                            <p>{item.body}</p>
                        </div>
                        <div className="add-comment" >
                            <span className="material-symbols-outlined">sentiment_satisfied</span>
                            <input type="text" placeholder="Add a comment...." value={comment} onChange={(e) => { setComment(e.target.value) }}
                            />
                            <button className="comment"
                                onClick={() => { makeComment(comment, item._id); toggleComment() }}>
                                Post</button>
                        </div>
                    </div>

                </div>
                <div className="close-Comment" onClick={() => { toggleComment(); }}>
                    <span className="material-symbols-outlined">close</span>
                </div>
            </div>)

            }
        </div>
    )

}
