import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  @WebSocketServer() wss: Server;

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch {
      client.disconnect();
      return;
    }

    // console.log({ payload });
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getUsersConnected(),
    );
  }

  handleDisconnect(client: Socket) {
    //console.log('Cliente desconectado:', client.id);
    this.messagesWsService.removeClient(client.id);
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getUsersConnected(),
    );
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {
    //! Emite unicamente al cliente.
    // client.emit('message-from-server', {
    //  fullName: 'Soy Yo!',
    //  message: payload.message || 'no-message!',
    //});
    //! Emite a todos MENOS, al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //  fullName: 'Soy Yo!',
    //  message: payload.message || 'no-message!',
    // });

    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserName(client.id),
      message: payload.message || 'no-message!',
    });
  }
}
