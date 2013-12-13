import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ConnectException;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.net.UnknownHostException;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.graphstream.graph.Graph;
import org.graphstream.graph.implementations.AdjacencyListGraph;

import org.graphstream.stream.GraphReplay;
import org.graphstream.stream.Pipe;
import org.graphstream.stream.PipeBase;
import org.graphstream.stream.netstream.NetStreamSender;
import org.graphstream.stream.netstream.packing.Base64Packer;

import org.graphstream.boids.BoidGenerator;

/**
 *
 * Copyright (c) 2012 University of Le Havre
 *
 * @file W3SinkTest.java
 * @date May 16, 2012
 *
 * @author Yoann Pigné
 *
 */
public class W3SinkDemo {
    boolean alive;
    ServerSocket serverSocket;
    Graph g;
    ConcurrentLinkedQueue<Connection> pending;
    LinkedList<Connection> active;
    Pipe proxy;
	
	public W3SinkDemo() throws IOException {
		this.serverSocket = new ServerSocket(2001); 
		this.alive = true;
		this.pending = new ConcurrentLinkedQueue<Connection>();
		this.g = new AdjacencyListGraph("w3sink-demo");
		this.active = new LinkedList<Connection>();
		this.proxy = new TemporizeXYOutput();

		g.addSink(proxy);

        Runnable r = new Runnable() {
        	public void run() {
        		W3SinkDemo.this.listen();
        	}
        };
        
        Thread t = new Thread(r);
        t.setDaemon(true);
        t.start();
        
        r = new Runnable() {
        	public void run() {
			//W3SinkDemo.this.g.display(false);
        		W3SinkDemo.this.generate();
        	}
        };
        
        t = new Thread(r);
        t.start();
	}
	
	private void generate() {
		System.out.printf(" * Generation is running ...\n");
				
		BoidGenerator gen = new BoidGenerator("boidsConfig.dgs");
		gen.addSink(g);
		gen.begin();
		
		while (alive) {
			while (pending.size() > 0)
				register(pending.poll());
			
			gen.nextEvents();
			
			for (int i = 0; i < active.size(); i++) {
				if (!active.get(i).isAlive()) {
					Connection c = active.remove(i--);
					proxy.removeSink(c);
					
					try {
						System.err.printf("close broken connection\n");
						c.close();
					} catch (Exception e2) {
					}
				}
			}
			
			try {
				Thread.sleep(100);
			} catch (InterruptedException e) {
			}
		}
		
		gen.end();
		
		System.out.printf(" * Generation ends ...\n");
	}
	
	private void register(Connection conn) {
		GraphReplay replay = new GraphReplay("replay-" + g.getId());
		
		replay.addSink(conn);
		replay.replay(g);
		replay.removeSink(conn);
		
		proxy.addSink(conn);
		active.add(conn);
		
		System.out.printf("[generator] new connection registered\n");
	}
	
	private void listen() {
		System.out.printf(" * Server is listening ...\n");
		
		while (alive) {
			Socket s = null;
			Connection c = null;
			
			try {
				s = serverSocket.accept();
				c = createConnection(s);
				pending.add(c);
				
				System.out.printf("[server] new connection from '%s'\n", s.getInetAddress().getHostName());
			} catch (IOException e) {
				e.printStackTrace();
				
				try {
					s.close();
				} catch (IOException e2) {
				}
			}
		}
		
		try {
			serverSocket.close();
		} catch (Exception e) {
		}
		
		System.out.printf(" * Server is closed ...\n");
	}
	
	private Connection createConnection(Socket socket) throws IOException {
			int port;
			BufferedReader in;
			
			in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
			port = Integer.parseInt(in.readLine());
			
			try {
				socket.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
			
			return new Connection(port);
	}
	
	private class Connection extends NetStreamSender {
		Connection(int port) throws IOException {
			super (port);
			setPacker(new Base64Packer());
		}
		
		public boolean isAlive() {
			return socket.isConnected() && ! socket.isClosed();
		}
	}
   
	private static class TemporizeXYOutput extends PipeBase {
		HashMap<String, Long> dates;
		
		TemporizeXYOutput() {
			dates = new HashMap<String, Long>();
		}
		
		public void nodeAttributeChanged(String sourceId, long timeId, String nodeId,
			String attrId, Object oldValue, Object newValue) {
			if (false &&attrId.matches("^xyz?$")) {			
				long currentDate = System.currentTimeMillis();
			
				if (!dates.containsKey(nodeId) || currentDate - dates.get(nodeId) > 25) {
					super.nodeAttributeChanged(sourceId, timeId, nodeId, attrId, oldValue, newValue);
					dates.put(nodeId, currentDate);
				}
			} else
				super.nodeAttributeChanged(sourceId, timeId, nodeId, attrId, oldValue, newValue);
		}
	}
   
	/**
	 * @param args
	 * @throws IOException 
	 */
	public static void main(String[] args) throws IOException {
		new W3SinkDemo();
	}
}
