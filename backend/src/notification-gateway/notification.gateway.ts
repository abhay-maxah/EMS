import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  notifyLeaveApplied(leave: any) {
    this.server.emit('leave_applied', leave);
  }

  notifyLeaveStatusUpdate(leave: any) {
    this.server.emit('leave_status_update', leave);
  }
}
