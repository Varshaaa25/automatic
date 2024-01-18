const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));

mongoose.connect('mongodb+srv://automatic:profile@cluster0.locdubq.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    profilePic: { type: String },
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

app.post('/register', async (req, res) => {
    const { username, email } = req.body;
    const profilePic = req.files ? req.files.profilePic : null;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            return res.status(400).send('Username or email is already taken. Please choose different ones.');
        }

        const newUser = new User({ username, email });

        if (profilePic) {
            const profilePicPath = `/public/uploads/${username}_profilePic.jpg`;
            await profilePic.mv(path.join(__dirname, 'public/uploads', `${username}_profilePic.jpg`));
            newUser.profilePic = profilePicPath;
        }

        await newUser.save();

        res.redirect(`/welcome?username=${username}`);
    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(400).send('Username or email is already taken. Please choose different ones.');
        }

        res.status(500).send('Internal Server Error');
    }
});

app.get('/welcome', (req, res) => {
    const username = req.query.username;
    res.sendFile(__dirname + '/public/welcome.html');
});

app.get('/profile', async (req, res) => {
    const username = req.query.username;

    try {
        const user = await User.findOne({ username });

        if (user) {
            console.log('User found:', user);
            res.send(`
                <h2>User Profile</h2>
                <div style="width:450px;height:300px;border-radius:10px;border:3px solid black">
                    <img src="${user.profilePic}" alt="Profile Picture" style="width: 200px; height: 200px; border-radius: 50%;">
                    <h3 style="text-align:center;font-size:30px">${user.username}</h3>
                </div>
            `);
        } else {
            console.log('User not found for username:', username);
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
