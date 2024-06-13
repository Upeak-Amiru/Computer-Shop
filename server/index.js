import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { userRouter } from "./Routes/userRoute.js";
import { ManagerRouter } from "./Routes/ManagerRoute.js";
import { CashierRouter } from "./Routes/CashierRoute.js";
import { StoreKeeperRouter } from "./Routes/StoreKeeperRoute.js";
import { TechnicianRouter} from "./Routes/TechnicianRoute.js";
const app = express() 
app.use(cors({ 
    origin: ["http://localhost:5173"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 

})); 
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use('/api', userRouter);
app.use('/manager', ManagerRouter);
app.use('/cashier', CashierRouter);
app.use('/storekeeper', StoreKeeperRouter);
app.use('/technician', TechnicianRouter);


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});