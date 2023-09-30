import nodemailer from 'nodemailer';
import UserDto from '../../../adapter/dto/UserDto';
import VerificationCode from '../../../framework/sequelize/repositories/VerificationCode.model';
import fs from 'fs';

export default class EmailNotification {
   private transporter: nodemailer.Transporter;
   private readonly AppName = { NAME:"GrandLine" } as const
  
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
  
    public async sendVerificationCode(verificationCode: VerificationCode,lastName: string){

      try {
        const notification = this.transporter.sendMail({
         from: process.env.GMAIL_EMAIL,
         to: verificationCode.email,
         subject: "Welcome to the GrandLine",
         html: `<h1> Please active you account with code<h1><br/><strong>${verificationCode.code}</strong> is valid for 10 minutes`,
       });
       return notification;
     } catch (error) {
       this.handleError(error)
     }

    }
    /**
     * Sends an email notification about new movies.
     *
     * @param pNewMovies The list of new movies.
     */
    public async sendForgotPassword(userDto: UserDto,password: string){

      try {
         const notification = this.transporter.sendMail({
          from: process.env.GMAIL_EMAIL,
          to: userDto.grandLineId,
          subject: "GrandLine forgot password",
          html: password,
        });
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
      private setEmailTemplate(context: string): string {
        try {
            let htmlTemplate :string ="";


            if(context === "signup"){
              const valueToReplace: Record<string, string> = {"%user_name%": "John","%app_name%": this.AppName.NAME};
              this.replaceKeyWord(valueToReplace)
              htmlTemplate = fs.readFileSync(`${__dirname}/template/welcome.html`, "utf-8");

            }
            
      
            return htmlTemplate;
          } catch (error) {
            throw new Error(`Error reading email template: ${error}`);
          }
      } 
      private replaceKeyWord(keyWords:  Record<string, string>) : string {

        for(const keyWords of valueToReplace){
          htmlTemplate = htmlTemplate.replace(keyWords,'')
        }
      }
        private handleError(error:any){
          return { message: error.message,status: error.status || 500};
        }
  }
  

  // let htmlTemplate :string ="";
          
  // if (context === 'signup') {
  //    htmlTemplate = fs.readFileSync(`${__dirname}/template/welcome.html`, "utf-8");
  //   for(const value of valueToReplace){
  //     htmlTemplate = htmlTemplate.replace(value, '%ça marche%');
  //    }   
  //   }