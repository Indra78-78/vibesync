const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const USER = mongoose.model("USER");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const requireLogin = require('../middelwares/requireLogin');
const { Jwt_secret } = require('../keys');

// Route for user signup
router.post("/signup", (req, res) => {
    const { name, userName, email, password } = req.body;
    if (!name || !userName || !email || !password) {
        return res.status(422).json({ error: "Please fill all the fields" });
    }

    USER.findOne({ $or: [{ userName: userName }, { email: email }] }).then((savedUser) => {
        if (savedUser) {
            return res.status(422).json({ error: "User already exists with email or userName" });
        } else {
            bcrypt.hash(password, 12).then((hashedPassword) => {
                const user = new USER({
                    name,
                    userName,
                    email,
                    password: hashedPassword
                });
                user.save()
                    .then(user => {
                        res.json({ message: "Registered successfully" });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ message: "Failed to save user" });
                    });
            });
        }
    });
});

// Route for user signin
router.post("/signin", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ error: "Please fill all the fields" });
    }

    USER.findOne({ email: email }).then((savedUser) => {
        if (!savedUser) {
            return res.status(422).json({ error: "Invalid Email" });
        }

        bcrypt.compare(password, savedUser.password).then((match) => {
            if (match) {
                const token = jwt.sign({ _id: savedUser.id }, Jwt_secret);
                const { _id, name, userName, email } = savedUser;
                res.json({ token, user: savedUser });
            } else {
                res.status(422).json({ error: "Invalid password" });
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({ message: "Failed to compare passwords" });
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({ message: "Failed to find user" });
    });
});

module.exports = router;