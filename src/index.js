import express from 'express';
import './utils/env.js';
import cors from 'cors';

// import cookieParser from 'cookie-parser';
import connectDB from '../src/config/db.js'; // Ensure to add the .js extension for local files
// import authRoutes from './routes/authRoutes.js'; // Same here
import authRoutes from '../src/routes/authRoutes.js'; // Same here




const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
// app.use(cookieParser());


app.use('/', authRoutes);


/*
    window.open(`http://localhost:3000/auth/google`, "_self");to open google login window
    const response= await axios.get("http://localhost:3000/auth/login/success",{withCredentials:"include"}) get user data after login
      const response= await axios.get("http://localhost:3000/auth/login/success",{withCredentials:"include"})
    const response= await axios.get("http://localhost:3000/auth/logout",{withCredentials:"include"}) for logout user (delete the cookies from backend)




*/ 
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
