const authRouter = require('./routes/AuthRoute');
const tokenRouter = require('./routes/tokenRoute');
const express = require('express');
const cors = require('cors');
const app = express();


app.use(express.json());
app.use(cors({
    origin : '*'
}));
app.use('/auth', authRouter);
app.use('/token', tokenRouter);


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});