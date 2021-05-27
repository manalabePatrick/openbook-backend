const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth:{
    user: "alphaQOpenBook@outlook.com", 
    pass: "sinigangniInangbayan23$343"
  }
});

const options = {
  from: "alphaQOpenBook@outlook.com",
  to: "Allenchristiancustodio@gmail.com",
  subject: "Sending Email with node JS",
  text: "Sapnu puas"
}

transporter.sendMail(options, function(err, info){
  if(err){
    console.log(err)
    return
  }
  console.log("SEnt: "+ info.response);
})





