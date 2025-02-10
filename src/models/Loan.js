import mongoose from "mongoose";

const emiScheduleSchema = new mongoose.Schema({
    dueDate: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "PAID", "CANCELLED"],
        default: "PENDING"
    },
    paidAmount: {
        type: Number
    },
    paidDate: {
        type: Date
    }
}, { timestamps: true });

const loanSchema = new mongoose.Schema({
    borrowerName: {
        type: String,
        required: true,
        trim: true
    },
    borrowerPhone: {
        type: String,
        required: true,
        trim: true
    },
    borrowerPhoto: {
        type: String,  // URL to stored photo
    },
    loanAmount: {
        type: Number,
        required: true
    },
    interestRate: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    remainingAmount: {
        type: Number,
        required: true
    },
    emisSchedule: [emiScheduleSchema],
    status: {
        type: String,
        enum: ["ACTIVE", "CLOSED"],
        default: "ACTIVE"
    }
}, { timestamps: true });

export const Loan = mongoose.model("Loan", loanSchema);