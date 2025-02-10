import nodemailer from "nodemailer"


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: process.env.SENDEREMAIL,
      pass: process.env.SENDERPASS,
    },
  });
  export default transporter;