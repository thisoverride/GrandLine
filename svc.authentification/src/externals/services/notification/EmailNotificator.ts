import nodemailer from 'nodemailer';
import UserDto from '../../../adapter/dto/UserDto';
import VerificationCode from '../../../framework/sequelize/repositories/VerificationCode.model';
// import fs from 'fs';

export default class EmailNotification {
   private transporter: nodemailer.Transporter;
  
    public constructor() {
      this.transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GAMIL_PASSWORD,
        },
      });
    }
  
    public async sendVerificationCode(verificationCode: VerificationCode){
      try {
        const notification = this.transporter.sendMail({
         from: process.env.GMAIL_EMAIL,
         to: verificationCode.email,
         subject: "Welcome to the GrandLine",
         html: `<h1> Please active you account with code<h1><br/><strong>${verificationCode.code}</strong> is valid for 10 minutes`,
       });
       return notification;
     } catch (err) {
       console.error(err);
     }

    }
    /**
     * Sends an email notification about new movies.
     *
     * @param pNewMovies The list of new movies.
     */
    public async sendEmailNotification(userDto: UserDto,password: string){

      try {
         const notification = this.transporter.sendMail({
          from: process.env.GMAIL_EMAIL,
          to: userDto.grandLineId,
          subject: "GrandLine forgot password",
          html: password,
        });
        console.log(notification)
        return notification;
      } catch (err) {
        console.error(err);
      }
    }
      
      /**
       * set user info into email template .
       *
       * @param context content of called function.
       */
        // public setEmailTemplate(arg: Array<any>): string {

        //   const valueToReplace: Array<string> = ["%lastname%"];
        //   try {
        //     let htmlTemplate: string = fs.readFileSync(`${__dirname}/template/welcome.html`, "utf-8");
        
        //     if (context === 'signup') {
        //       for(const value of valueToReplace){
        //         htmlTemplate = htmlTemplate.replace(value, '%ça marche%');
        //        }   
        //     }
        //     return htmlTemplate;
        //   } catch (error) {
        //     throw new Error(`Error reading email template: ${error}`);
        //   }
        // } 
  }
  

  