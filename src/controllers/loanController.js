import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Loan } from "../models/Loan.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a new loan
const createLoan = AsyncHandler(async (req, res) => {
    upload.single('avatar')(req, res, async (err) => {
        if (err) {
            return res.status(400).json(new ApiResponse(400, "File upload error"));
        }

        const {
            borrowerName,
            borrowerPhone,
            loanAmount,
            interestRate,
            startDate,
            emiAmount,
            emiDueDate,
            numberOfEmis
        } = req.body;
        console.log(req.file);
        console.log(req.body);

        // Validate input
        if (!borrowerName?.trim() || !borrowerPhone?.trim()) {
            return res.status(400).json(
                new ApiResponse(400, "Borrower name and phone are required")
            );
        }

        if (!loanAmount || loanAmount <= 0) {
            return res.status(400).json(
                new ApiResponse(400, "Valid loan amount is required")
            );
        }

        if (!interestRate || interestRate < 0) {
            return res.status(400).json(
                new ApiResponse(400, "Valid interest rate is required")
            );
        }

        if (!startDate || !emiAmount || !emiDueDate || !numberOfEmis) {
            return res.status(400).json(
                new ApiResponse(400, "Loan schedule details are required")
            );
        }
        const parsedStartDate = new Date(startDate);
        const parsedEmiDueDate = new Date(emiDueDate);

        if (!req.file) {
            return res.status(400).json(
                new ApiResponse(400, "Avatar file is required")
            );
        }

        // Upload file to Cloudinary
        const avatar = await uploadOnCloudinary(req.file.buffer, req.file.originalname);
        if (!avatar) {
            return res.status(400).json(
                new ApiResponse(400, "Server error while uploading avatar")
            );
        }
        console.log(avatar.url);

        // Generate EMI schedule
        const emisSchedule = [];
        let currentDate = new Date(parsedStartDate);
        const dueDay = new Date(parsedEmiDueDate).getDate();
        const start = new Date(startDate);
        const end = new Date(emiDueDate);
        const Time = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        const totalAmount = loanAmount * interestRate * Time / 100 + +loanAmount;
        console.log(totalAmount);
        const emiAmount2 = totalAmount / numberOfEmis;
        for (let i = 0; i < numberOfEmis; i++) {
            currentDate.setDate(dueDay);

            emisSchedule.push({
                dueDate: new Date(currentDate),
                amount: emiAmount2,
                status: "PENDING"
            });

            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        // Calculate total amount to be repaid
        // const totalAmount = emiAmount * numberOfEmis;

        const loan = await Loan.create({
            borrowerName,
            borrowerPhone,
            loanAmount,
            interestRate,
            startDate: new Date(startDate),
            totalAmount,
            borrowerPhoto: avatar.url || "",
            remainingAmount: totalAmount,
            emisSchedule,
            status: "ACTIVE"
        });

        return res.status(201).json(
            new ApiResponse(201, loan, "Loan created successfully")
        );
    });
});

// Get all loans
const getAllLoans = AsyncHandler(async (req, res) => {
    const loans = await Loan.find().sort({ createdAt: -1 });
    return res.status(200).json(
        new ApiResponse(200, loans, "Loans fetched successfully")
    );
});

// Get loan by ID
const getLoanById = AsyncHandler(async (req, res) => {
    const { loanId } = req.params;
    
    const loan = await Loan.findById(loanId);
    if (!loan) {
        return res.status(404).json(
            new ApiResponse(404, null, "Loan not found")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, loan, "Loan fetched successfully")
    );
});

// Mark EMI as paid
const markEmiAsPaid = AsyncHandler(async (req, res) => {
    const { loanId, emiId } = req.params;
    // const { paidAmount } = req.body;
    console.log(loanId, emiId, );

    const loan = await Loan.findById(loanId);
    if (!loan) {
        return res.status(404).json(
            new ApiResponse(404, null, "Loan not found")
        );
    }

    const emi = loan.emisSchedule.id(emiId);
    if (!emi) {
        return res.status(404).json(
            new ApiResponse(404, null, "EMI not found")
        );
    }

    if (emi.status === "PAID") {
        return res.status(400).json(
            new ApiResponse(400, null, "EMI already paid")
        );
    }

    // Update EMI status
    emi.status = "PAID";
    emi.paidAmount = emi.amount;
    emi.paidDate = new Date();

    // Update remaining amount
    loan.remainingAmount -= emi.paidAmount;

    // Check if loan is fully paid
    const isPaidFully = loan.emisSchedule.every(emi => emi.status === "PAID");
    if (isPaidFully) {
        loan.status = "CLOSED";
    }

    await loan.save();

    return res.status(200).json(
        new ApiResponse(200, loan, "EMI marked as paid successfully")
    );
});

// Update loan details
const updateLoan = AsyncHandler(async (req, res) => {
    const { loanId } = req.params;
    const {
        borrowerName,
        borrowerPhone,
        loanAmount,
        interestRate,
        remainingAmount
    } = req.body;

    const loan = await Loan.findById(loanId);
    if (!loan) {
        return res.status(404).json(
            new ApiResponse(404, null, "Loan not found")
        );
    }

    // Update fields if provided
    if (borrowerName) loan.borrowerName = borrowerName;
    if (borrowerPhone) loan.borrowerPhone = borrowerPhone;
    if (loanAmount) loan.loanAmount = loanAmount;
    if (interestRate) loan.interestRate = interestRate;
    if (remainingAmount !== undefined) loan.remainingAmount = remainingAmount;

    await loan.save();

    return res.status(200).json(
        new ApiResponse(200, loan, "Loan updated successfully")
    );
});

// Close loan
const closeLoan = AsyncHandler(async (req, res) => {
    const { loanId } = req.params;

    const loan = await Loan.findById(loanId);
    if (!loan) {
        return res.status(404).json(
            new ApiResponse(404, null, "Loan not found")
        );
    }

    loan.status = "CLOSED";
    loan.remainingAmount = 0;
    loan.emisSchedule.forEach(emi => {
        if (emi.status === "PENDING") {
            emi.status = "CANCELLED";
        }
    });

    await loan.save();

    return res.status(200).json(
        new ApiResponse(200, loan, "Loan closed successfully")
    );
});

export {
    createLoan,
    getAllLoans,
    getLoanById,
    markEmiAsPaid,
    updateLoan,
    closeLoan
};