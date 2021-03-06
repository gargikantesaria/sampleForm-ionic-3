import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera } from '@ionic-native/camera';
import { ImageProvider } from '../../providers/image/image';
import { WebServiceProvider } from '../../providers/web-service/web-service';
import { AlertControlProvider } from '../../providers/alert-control/alert-control';
import PhoneNumber from 'awesome-phonenumber';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public registationForm: FormGroup; imgPreview; showDetails: boolean = false; userDetail; imageSet: boolean = false; phoneError:boolean = false;

  constructor(public navCtrl: NavController, private formBuilder: FormBuilder, private alertCtrl: AlertController, private camera: Camera, private imageProvider: ImageProvider, private webService: WebServiceProvider, private alert: AlertControlProvider) {
    this.registationForm = this.formBuilder.group({
      'userName': ['', Validators.required],
      'userMobile': ['', Validators.required],
      'userEmail': ['', Validators.required],
      'userPassword': ['', Validators.required],
      'userpicture': [''],
      'userGender': ['female', Validators.required],
      'seasons': ['summer', Validators.required],
    })
    this.imgPreview = "/assets/imgs/logo.png";
  }

  getPhoto() {
    this.alertCtrl.create({
      title: 'Profile Picture',
      message: 'From where do you want to choose your profile pic?',
      buttons: [
        {
          text: 'Cancel',
          handler: data => { }
        },
        {
          text: 'Choose from gallery',
          handler: () => {
            // Call imageProvider to process, upload, and update user photo.
            this.imageProvider.setProfilePhoto('', this.camera.PictureSourceType.PHOTOLIBRARY).then(data => {
              this.imgPreview = data;
              this.imageSet = true;
            });
          }
        },
        {
          text: 'Take my photo',
          handler: () => {
            // Call imageProvider to process, upload, and update user photo.
            this.imageProvider.setProfilePhoto('', this.camera.PictureSourceType.CAMERA).then(data => {
              this.imgPreview = data;
              this.imageSet = true;
            });
          }
        }
      ]
    }).present();
  }

  onSubmit() {
    let data: any = {};
    if (this.registationForm.valid) {
      data.userEmail = this.registationForm.value.userEmail;
      data.userPassword = this.registationForm.value.userPassword;
      data.userName = this.registationForm.value.userName;
      data.userGender = this.registationForm.value.userGender;
      data.seasons = this.registationForm.value.seasons;
      data.userMobile = this.registationForm.value.userMobile;
      (this.imageSet) ? data.userpicture = this.imgPreview : null;

      this.webService.callPost('addDetails', data).then((res: any) => {
        this.registationForm.reset();
        this.alert.showAlert(res.body);
        this.navCtrl.setRoot('LoginPage');
      }).catch((err) => {
        this.alert.showErrorAlert(err);
      })
    }
    else {
      this.alert.showAlert("Please fill the required details.")
    }
  }

  goToLogin() {
    localStorage.removeItem('userId');
    this.navCtrl.setRoot("LoginPage");
  }
  checkEmailExist(event) {
    if (event) {
      let data = {
        email: this.registationForm.controls['userEmail'].value
      }
      this.webService.callPost('checkUserExist', data).then((res: any) => {
        if (res.isexist) {
          this.alert.showAlert("The user with this emailId is already exists. Please try with other email.");
          this.registationForm.controls['userEmail'].reset();
        }
      }).catch(err => { this.alert.showErrorAlert(err); })
    }
  }
  checkMobile(userMobile){
    const pn = new PhoneNumber(userMobile.value);
    if ((pn.isValid() && pn.isMobile()) && userMobile.value.length > 0) {
      this.phoneError = false; 
    } else {
      this.phoneError = true;
    }
  }
}
