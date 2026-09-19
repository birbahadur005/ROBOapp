import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';

interface ClientConnection {
  ws: WebSocket;
  role?: string;
  userId?: string;
  authorityId?: string;
  subscribedReferenceNo?: string;
}

class RealTimeService {
  private wss: WebSocketServer | null = null;
  private clients: Set<ClientConnection> = new Set();

  public init(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      const client: ClientConnection = { ws };
      this.clients.add(client);

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === 'SUBSCRIBE_APPOINTMENT') {
            client.subscribedReferenceNo = data.referenceNo;
          } else if (data.type === 'IDENTIFY_USER') {
            client.userId = data.userId;
            client.role = data.role;
            client.authorityId = data.authorityId;
          }
        } catch (e) {
          // ignore invalid JSON
        }
      });

      ws.on('close', () => {
        this.clients.delete(client);
      });

      ws.on('error', () => {
        this.clients.delete(client);
      });

      // Send initial welcome/ping
      ws.send(JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() }));
    });
  }

  // Notify visitor about their appointment status change
  public notifyAppointmentUpdate(referenceNo: string, appointmentData: any) {
    const payload = JSON.stringify({
      type: 'APPOINTMENT_UPDATED',
      referenceNo,
      data: appointmentData,
      timestamp: new Date().toISOString()
    });

    for (const client of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        if (
          client.subscribedReferenceNo === referenceNo ||
          client.role === 'SUPER_ADMIN' ||
          client.role === 'COLLEGE_ADMIN' ||
          client.role === 'RECEPTION' ||
          (client.authorityId && client.authorityId === appointmentData.authorityId)
        ) {
          client.ws.send(payload);
        }
      }
    }
  }

  // Notify authority and reception about a new appointment request
  public notifyNewAppointment(appointmentData: any) {
    const payload = JSON.stringify({
      type: 'NEW_APPOINTMENT_REQUEST',
      data: appointmentData,
      timestamp: new Date().toISOString()
    });

    for (const client of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        if (
          client.role === 'SUPER_ADMIN' ||
          client.role === 'COLLEGE_ADMIN' ||
          client.role === 'RECEPTION' ||
          (client.authorityId && client.authorityId === appointmentData.authorityId)
        ) {
          client.ws.send(payload);
        }
      }
    }
  }

  // Broadcast general update (e.g. new announcement or settings change)
  public broadcast(type: string, data: any) {
    const payload = JSON.stringify({
      type,
      data,
      timestamp: new Date().toISOString()
    });

    for (const client of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    }
  }
}

export const realTimeService = new RealTimeService();
