const config = require("../config");

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config.SENDGRID_API_KEY);

class Mail{
    // msg;

    constructor({subject, recipients=[], sender=config.APP_EMAIL}, content){
        const personalizations = recipients.map((email) => ({to: email}))
        this.msg = {
          personalizations,
          from: sender,
          subject: content.subject || subject,
          text: content.text || "",
          html: content.html || "",
        };
    }
    
    async send(){
        try{
            return sgMail.send(this.msg);
        }catch(e){
            throw e;
        }
    }
}

class TemplatedMail{
    // msg;

    constructor({recipients=[], sender=config.APP_EMAIL, template_data={}, template_id}){

        const personalizations = [{to: recipients.map((email) => ({email})), dynamic_template_data: template_data}];

        this.msg = {
          personalizations,
          from: {email: sender},
          template_id,
        };
    }
    
    async send(){
        try{
            return sgMail.send(this.msg);
        }catch(e){
            throw e;
        }
    }
}

module.exports.Mail = Mail;
module.exports.TemplatedMail = TemplatedMail;