import { PostInfo } from './../../models/posts/post-info';
import { UserAccountRegister } from './../../models/user-account/user-account-register/user-account-register';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OptionsInfoService } from '../options-info/options-info.service';
import { map } from 'rxjs/operators';
import { UserAccount } from '../../models/user-account/user-account';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { UserRole } from '../../models/user-account/user-role';
import { EditUserAccount } from '../../models/edit-user-account/edit-user-account';
import { NotificationFriendInfo } from '../../models/notification/notification-add-to-friend/notification-friend-info';
import * as signalR from '@aspnet/signalr';
import { HubInfoService } from '../hub-info/hub-info.service';
import { Friend } from '../../models/friend/friend';
import { MessageInfo } from '../../models/message/message-info';
import { MessageGet } from '../../models/message/message-get';
import { NotificationMessages } from 'src/app/models/notification-messages/notification-messages';
import { Form } from '@angular/forms';
@Injectable({
  providedIn: 'root'
})
export class ConnectService {
  private hubConnection!: signalR.HubConnection;
  public userAccountData = new BehaviorSubject<UserAccount>(new UserAccount());
  public userAccountData$ = this.userAccountData.asObservable();
  public userAccountCurrentValue = new BehaviorSubject<UserAccount>(new UserAccount());
  public userAccountCurrentValue$ = this.userAccountCurrentValue.asObservable();
  public userGetData = new BehaviorSubject<UserAccount>(new UserAccount());
  public userGetData$ = this.userGetData.asObservable();
  public fileToUpload!: FormData; 
  public imageDownload!: any;
  public userAccountArray = new BehaviorSubject<UserAccount[]>([]);
  public userAccountArray$ = this.userAccountArray.asObservable();
  public notificationAddToFriends = new BehaviorSubject<NotificationFriendInfo[]>([]);
  public notificationAddToFriends$ = this.notificationAddToFriends.asObservable();
  public usersInFriends = new BehaviorSubject<Friend[]>([]);
  public usersInFriends$ = this.usersInFriends.asObservable();
  public messageAll = new BehaviorSubject<MessageGet[]>([]);
  public messageAll$ = this.messageAll.asObservable();
  public userAll = new BehaviorSubject<UserAccount[]>([]);
  public userAll$ = this.userAll.asObservable();
  private posts = new BehaviorSubject<PostInfo[]>([]);
  public posts$ = this.posts.asObservable();

  constructor(private http: HttpClient, 
              private optionsInfo: OptionsInfoService, 
              private router: Router, 
              private hubInfo: HubInfoService) {       
  }

  

  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
                                    .withUrl(this.optionsInfo.hubToConnect)
                                    .build();
    this.hubConnection.start()
                      .then(() => console.log('signal r connection start'))
                      .catch(err => console.log('Error while starting connection: ' + err));
  }

  public handlerGetNotificationAddToFriend = () => {
    this.hubConnection.on(this.hubInfo.eventAddToFriendHub, (value: NotificationFriendInfo[]) => {
        this.notificationAddToFriends.next(value);
    });
    this.startConnection();
  }

  public handlerGetUserAll = () => {
    this.hubConnection.on(this.hubInfo.userAll, (value: UserAccount[]) => {
      this.userAll.next(value);
  });
  this.startConnection();
  }

  public handlerGetUsersInFriendship = () => {
    this.hubConnection.on(this.hubInfo.usersInFriendship, (value: Friend[]) => {
      this.usersInFriends.next(value);
    });
    this.startConnection();
  }

  public handlerGetMessageAll = () => {
    this.hubConnection.on(this.hubInfo.messageAll, (value: MessageGet[]) => {
      this.messageAll.next(value);
    });
    debugger;
    this.startConnection();
  }

  public userDataConnect = () => {
    return this.http.get(this.optionsInfo.getUserData).pipe(map(result => result));
  }

  public adminDataConnect = () => {
    return this.http.get(this.optionsInfo.getAdminData).pipe(map(result => result));
  }

  public loginPost = (userDetailsInfo: UserAccount) => {
    return this.http
               .post<any>(this.optionsInfo.loginPost, userDetailsInfo)
               .pipe(map(response => {
                 localStorage.setItem(this.optionsInfo.authToken, response.token);
                 this.setUserAccountDetail();
                 return response;
               }));
  }

  public setUserAccountDetail = () => {
    if (localStorage.getItem(this.optionsInfo.authToken)) {
      const userAccountDetails = new UserAccount();
      const decodeUserAccountDetails = JSON.parse(window.atob(localStorage.getItem(this.optionsInfo.authToken)!.split('.')[1]));
      userAccountDetails.email = decodeUserAccountDetails.sub;
      userAccountDetails.name = decodeUserAccountDetails.firstName;
      userAccountDetails.isLoggedIn = true;
      userAccountDetails.role = decodeUserAccountDetails.role;
      this.userAccountData.next(userAccountDetails);
    }
  }

  public registerPost = (userRegisterDetails: UserAccountRegister) : Observable<UserAccountRegister> => {

    const httpOptions = { headers: new HttpHeaders({ 
      'Content-Type': 'application/json, application/x-www-form-urlencoded',
      'Accept': 'application/json, text/plain, */*', 
                               'Access-Control-Allow-Headers': 'Authorization',
                               'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      })};
    userRegisterDetails.userType = UserRole.User;
    return this.http.post<any>(this.optionsInfo.registerPost, userRegisterDetails);
  }

  public userEditPost = (editUserAccount: EditUserAccount, userInfo: UserAccount) => {
    editUserAccount.changedName = userInfo.name;
    return this.http.post<any>(this.optionsInfo.editPost, editUserAccount);

  }

  public postContentCreate = (postForm: FormData) => {
    return this.http.post(this.optionsInfo.postContentCreate, postForm);
  }

  public messagePost = (messageInfo: MessageInfo) => {
    return this.http.post<MessageInfo>(this.optionsInfo.messagePost, messageInfo);
  }

  public messageAllGet = (messageInfo: MessageInfo) => {
    return this.http.post<MessageGet[]>(this.optionsInfo.messageAllGet, messageInfo);
  }

  public addToFriendPost = (friendInfo: Friend) => {
    return this.http.post(this.optionsInfo.addToFriendPost, friendInfo);
  }

  public imagePost = (files: any, name: string) => {
    debugger;
    if (files.length === 0) {
      return;
    }
    let fileToUpload = <File>files[0];
    const formData = new FormData();
    formData.append(fileToUpload.type ,fileToUpload, name);

    return this.http.post(this.optionsInfo.imagePost, formData, { reportProgress: true, observe: 'events' });
  }

  public imageDownloadGet = (name: string) => {
    return this.http.get(this.optionsInfo.imageGet + '/' + name)
               .pipe(map(result => result));

  }

  public postsGet = (name: string) => {
    return this.http.get<PostInfo[]>(this.optionsInfo.postsGet + '/' + name)
                    .pipe(map(result => result));
  }

  public userAllGet = (name: string) => {
    return this.http.get<UserAccount[]>(this.optionsInfo.userAllGet + '/' + name).subscribe(value => {
      if (value !== undefined){
        this.userAccountArray.next(value);
      }
    });
  }

  public usersInFriendsGet = () => {
    return this.http.get<Friend[]>(this.optionsInfo.getUsersInFriends).subscribe(value => {
      if(value !== undefined){
        this.usersInFriends.next(value);
      }
    })
  }

  public eventAddToFriend = (notificationInfo: NotificationFriendInfo) => {
    return this.http.post(this.optionsInfo.eventAddToFriend, notificationInfo)
               .pipe(map(res => res));
  }

  public eventMessagePost = (notificationInfo: NotificationMessages) => {
    return this.http.post(this.optionsInfo.eventMessagePost, notificationInfo);
  }

  public getEventAddToFriend = (notificationInfo: NotificationFriendInfo) => {
    return this.http.post(this.optionsInfo.getEventAddToFriend, notificationInfo).subscribe();
  }

  public removeEvent = (notificationInfo: NotificationFriendInfo) => {
    return this.http.post(this.optionsInfo.removeEvent, notificationInfo);
  }

  public eventMessagesRemove = (notificationInfo: NotificationMessages) => {
    return this.http.post(this.optionsInfo.eventMessageRemove, notificationInfo);
  }

  public userGet = (name: string) => {
    return this.http.get<UserAccount>(this.optionsInfo.userGet + '/' + name).subscribe(value => {
      this.userAccountCurrentValue.next(value);
    });
  }

  public usersGet = (name: string) => {
    return this.http.get<UserAccount>(this.optionsInfo.userGet + '/' + name).subscribe(value => {
      this.userGetData.next(value);
    });
  }

  public logout = () => {
    localStorage.removeItem(this.optionsInfo.authToken);
    this.router.navigate([this.optionsInfo.loginPath]);
    this.userAccountData.next(new UserAccount());
  }
}
