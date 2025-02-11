import express from "express";
import {
    createLoan,
    getAllLoans,
    getLoanById,
    markEmiAsPaid,
    updateLoan,
    closeLoan
} from "../controllers/loanController.js";
import { upload } from "../middlewares/multer.js"; // You'll need to create this middleware for file uploads

const router = express.Router();

// Base route prefix: /api/v1/loans

// Create new loan with photo upload
router.post(
    "/",
  
    // upload.single("borrowerPhoto"), // Middleware for handling file upload
    createLoan
);

// Get all loans
router.get(
    "/",
  
    getAllLoans
);

// Get specific loan
router.get(
    "/:loanId",
  
    getLoanById
);

// Mark EMI as paid
router.patch(
    "/:loanId/emis/:emiId/pay",
    
  
    markEmiAsPaid
);

// Update loan details
router.patch(
    "/:loanId",
  
    updateLoan
);

// Close loan
router.patch(
    "/:loanId/close",
  
    closeLoan
);

export default router;