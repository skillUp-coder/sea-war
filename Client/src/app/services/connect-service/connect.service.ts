import { Injectable } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { InfoOptionsService } from '../info-options/infooptions.service';
import { UrlService } from '../url/url.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { Player } from '../../models/player/player';
import { map } from 'rxjs/operators';
import { ChatMessage } from '../../models/chat-message/chat-message';
import { Coordinate } from '../../models/coordinate/coordinate';

@Injectable({
  providedIn: 'root'
})
export class ConnectService {
  private hubConnection!: signalR.HubConnection;
  public playerData = new BehaviorSubject<Player[]>([]);
  public PlayerData$ = this.playerData.asObservable();
  public nameClient: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public messages: ChatMessage[] = [];
  public coordinates: Coordinate[] = [];

  constructor(private info: InfoOptionsService,
              private url: UrlService,
              private http: HttpClient) { }

  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
                                    .withUrl(this.url.signalRService)
                                    .build();
    this.hubConnection.start()
                      .then(() => console.log('signal r connection start'))
                      .catch(err => console.log('Error while starting connection: ' + err));
  }

  public addTransferDataListener = () => {
    this.hubConnection?.on(this.info.msgConnectionPlayer, (data: Player[]) => {
      console.log(data);
      this.playerData.next(data);
    });
  }

  public addTransferChatListener = () => {
    this.hubConnection.on(this.info.clientsJoined, (data: ChatMessage) => {
      console.log('chat ', data);
      this.messages.push(data);
    });
  }

  public addTransferCoordinateListener = () => {
    this.hubConnection.on(this.info.coordinateSend, (data: Coordinate) => {
      console.log('coordinate ', data);
      this.coordinates.push(data);
    });
  }

  public createPlayerService(playerDetail: Player): void{
    this.nameClient.next(playerDetail.Name);
    this.hubConnection.invoke(this.info.createClient, playerDetail);
  }

  public addHitPointInvoke(playerDetail: Player): void{
    this.hubConnection.invoke(this.info.hitPointsInvoke, playerDetail);
  }

  public sendCountToHub = (playerDetail: Player) => {
    const promise = this.hubConnection.invoke(this.info.countInvoke, playerDetail);
    return from(promise);
  }

  public sendMessageToHub = (message: ChatMessage) => {
    const promise = this.hubConnection.invoke(this.info.clientsJoinedAsync, message);
    return from(promise);
  }

  public sendCoordinate = (coordinate: Coordinate) => {
    const promise = this.hubConnection.invoke(this.info.coordinateSendAsync, coordinate);
    return from(promise);
  }
}
