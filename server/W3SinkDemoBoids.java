import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.ConnectException;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.graphstream.boids.BoidGenerator;
import org.graphstream.graph.Edge;
import org.graphstream.graph.Graph;
import org.graphstream.graph.Node;
import org.graphstream.graph.implementations.AdjacencyListGraph;
import org.graphstream.graph.implementations.DefaultGraph;
import org.graphstream.stream.GraphReplay;
import org.graphstream.stream.SinkAdapter;
import org.graphstream.stream.netstream.NetStreamReceiver;
import org.graphstream.stream.netstream.NetStreamSender;
import org.graphstream.stream.netstream.packing.Base64Packer;
import org.graphstream.stream.netstream.packing.Base64Unpacker;
import org.graphstream.stream.thread.ThreadProxyPipe;
import org.graphstream.ui.layout.springbox.SpringBox;
import org.graphstream.util.VerboseSink;

/**
 *
 * Copyright (c) 2012 University of Le Havre
 *
 * @file W3SinkDemo.java
 * @date May 21, 2012
 *
 * @author Yoann Pigné
 * @author Guilhelm Savin
 *
 */
public class W3SinkDemoBoids {
	public static final String NS_RECEIVER_HOST = "localhost";
	
    boolean alive;
    ServerSocket serverSocket;
    Graph g;
    ConcurrentLinkedQueue<Connection> pending;
    LinkedList<Connection> active;
    LinkManager linkManager;
    SpringBox layout;
    HeartBeat heartbeat;
	
	public W3SinkDemoBoids() throws IOException {
		this.serverSocket = new ServerSocket(2001); 
		this.alive = true;
		this.pending = new ConcurrentLinkedQueue<Connection>();
		this.g = new AdjacencyListGraph("w3sink-demo");
		this.active = new LinkedList<Connection>();
		
		this.g.setStrict(false);
		
        Runnable r = new Runnable() {
        	public void run() {
        		W3SinkDemoBoids.this.listen();
        	}
        };
        
        Thread t = new Thread(r);
        t.setDaemon(true);
        t.start();
        
        r = new Runnable() {
        	public void run() {
        		try {
					W3SinkDemoBoids.this.handleGraph();
				} catch (UnknownHostException e) {
					e.printStackTrace();
				} catch (IOException e) {
					e.printStackTrace();
				}
        	}
        };
        
        t = new Thread(r);
        t.start();
	}
	
	private void handleGraph() throws UnknownHostException, IOException {
		restore();
		
		BoidGenerator gen = new BoidGenerator("boidsConfig.dgs");
		gen.addSink(g);
		
		gen.begin();
		
		NetStreamReceiver receiver = new NetStreamReceiver(NS_RECEIVER_HOST, 2002, false);
		receiver.setUnpacker(new Base64Unpacker());
		
		ThreadProxyPipe pipe = receiver.getDefaultStream();
		pipe.addSink(g);
		
		// send events to clients through node.js
		NetStreamSender sender = null;
		boolean fail = true;
		
		do {
			try {
				sender = new NetStreamSender(2000);
				System.err.printf(" * Connected to ns-sender\n");
				fail = false;
			} catch (ConnectException e) {
				try {
					System.err.printf("failed to connect to node.js, try again in few seconds ");
					Thread.sleep(1000);					
					System.err.printf(".");
					Thread.sleep(1000);
					System.err.printf(".");
					Thread.sleep(1000);
					System.err.printf(".\n");
				} catch (InterruptedException ie) {
				}
			}
		} while (fail);
		 
		sender.setPacker(new Base64Packer());
		g.addSink(sender);
		
		System.out.printf(" * Graph is running\n");
		
		//g.display(false);
		
		while (alive) {
			
			// get events from clients
			pipe.pump();
			
			// get new clients and send replay
			while (pending.size() > 0)
				register(pending.poll());
			
			gen.nextEvents();
			
			//heartbeat.check();
			//save();
			
			try {
				Thread.sleep(50);
			} catch (InterruptedException e) {
			}
		}
	}
	
	private void register(Connection conn) {
		GraphReplay replay = new GraphReplay("replay-" + g.getId());
		
		replay.addSink(conn.nss);
		replay.replay(g);
		replay.removeSink(conn.nss);
		
		g.addSink(conn.nss);
		active.add(conn);
		
		System.out.printf("[generator] new connection registered'\n");
	}
	
	private void listen() {
		System.out.printf(" * Server is listening\n");
		
		while (alive) {
			Socket s = null;
			Connection c = null;
			
			try {
				s = serverSocket.accept();
				c = new Connection(s);
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
	
	public static final String SAVE_PATH = W3SinkDemoBoids.class.getName() + "-save.dgs";
	protected long lastSave = System.currentTimeMillis();
	
	private void save() {
		if (System.currentTimeMillis() - lastSave > 20000) {
			try {
				g.write(SAVE_PATH);
				lastSave = System.currentTimeMillis();
			} catch (Throwable cause) {
				System.err.printf("failed to save\n");
			}
		}
	}
	
	private void restore() {
		File f = new File(SAVE_PATH);
		
		if (f.exists()) {
			try {
				g.read(SAVE_PATH);
				System.out.printf(" * Restored graph from %s\n", SAVE_PATH);
			} catch (Throwable cause) {
				System.err.printf(" * Failed to restore\n");
			}
		}
	}
	
	private class Connection {
		BufferedReader in;
		NetStreamSender nss;
		
		Connection(Socket socket) throws IOException {
			int port;
			
			in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
			port = Integer.parseInt(in.readLine());
			
			try {
				socket.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
			
			nss = new NetStreamSender(port);
			nss.setPacker(new Base64Packer());
		}
	}
	
	private class LinkManager extends SinkAdapter {
		HashMap<String,HashSet<Node>> tag2nodes;
		HashMap<String,HashSet<String>> tags2tags;
		HashMap<String,HashSet<String>> tags2tagsEdges;
		
		LinkManager() {
			tag2nodes = new HashMap<String,HashSet<Node>>();
			tags2tags = new HashMap<String,HashSet<String>>();
			tags2tagsEdges = new HashMap<String,HashSet<String>>();
		}
		
		public void nodeRemoved(String sourceId, long timeId, String nodeId) {
			Node n = g.getNode(nodeId);
			HashSet<String> tags = tags2tags.remove(nodeId);
			
			if (n!=null&&tags!=null) {
				for (String tag : tags) {
					try {
						tag2nodes.get(tag).remove(n);
					} catch (Throwable t) {
						System.err.printf("[error] can not remove node %s from set %s (%s)\n", nodeId, tag, t.getMessage());
					}
				}
			}
		}
		
		public void nodeAttributeAdded(String sourceId, long timeId, String nodeId, String attrId, Object value) {
			nodeAttributeChanged(sourceId, timeId, nodeId, attrId, null, value);
		}
		
		public void nodeAttributeChanged(String sourceId, long timeId, String nodeId, String attrId, Object oldValue, Object newValue) {
			if (attrId.equals("tags"))
				setTags(nodeId, (String) newValue);
		}
		
		public void setTags(String nodeId, String tagsString) {
			Node n = g.getNode(nodeId);
		
			if (n == null)
				return;
			
			if (!tags2tags.containsKey(nodeId))
				tags2tags.put(nodeId, new HashSet<String>());
			
			//
			// Nothing have to happen here :)
			//
			try {
				HashSet<String> currentTags = tags2tags.get(nodeId);
				HashSet<String> newTags = new HashSet<String>();
			
				String[] tags = tagsString == null ? new String[0] : tagsString.split(";");
				for (int i = 0; i < tags.length; i++) {
					if(tags[i].matches("^(\\s*|none)$"))
						continue;
					newTags.add(tags[i]);
				}
				
				for (String tag : currentTags)
					if (!newTags.contains(tag))
						disconnect(n, tag);
		
				for (String tag : newTags)
					if (!currentTags.contains(tag))
						connect(n, tag);
						
				tags2tags.put(nodeId, newTags);
			} catch (Throwable cause) {
				System.err.printf("[error] %s\n", cause.getMessage());
				cause.printStackTrace();
			}
		}

		protected void disconnect(Node n, String tag) {
			HashSet<Node> nodes = tag2nodes.get(tag);
			
			if (nodes == null || !nodes.contains(n))
				return;
			
			nodes.remove(n);
			
			for (Node n2 : nodes)
				disconnect(n, n2, tag);
		}

		protected void disconnect(Node n1, Node n2, String tag) {
			String edgeId = getEdgeId(n1, n2);
			Edge edge = g.getEdge(edgeId);
			
			if (edge == null) {
				System.err.printf("edge '%s' not found\n", edgeId);
				return;
			}
			
			if (!tags2tagsEdges.containsKey(edgeId))
				tags2tagsEdges.put(edgeId, new HashSet<String>());
			
			HashSet<String> tags = tags2tagsEdges.get(edgeId);
		
			if (!tags.contains(tag)) {
				System.err.printf("tag '%s' not used here\n", tag);
				return;
			}
			
			tags.remove(tag);
	
			System.err.printf("disconnect %s and %s of %s\n", n1.getId(), n2.getId(), tag);
	
			if (tags.size() == 0) {
				g.removeEdge(edgeId);
				tags2tagsEdges.remove(edgeId);
			}
			else {
				edge.setAttribute("tags", stringify(tags));
				edge.setAttribute("size", tags.size());
			}
		}
	
		protected void connect(Node n, String tag) {
			if (!tag2nodes.containsKey(tag))
				tag2nodes.put(tag, new HashSet<Node>());
			
			HashSet<Node> nodes = tag2nodes.get(tag);
			
			if (!nodes.contains(n)) {
				for (Node n2 : nodes) {
					try {
						connect(n, n2, tag);
					} catch (Throwable t) {
						System.err.printf("[error] while connecting %s and %s with %s\n", n.getId(), n2.getId(), tag);
					}
				}
				
				nodes.add(n);
			}
		}
		
		protected void connect(Node n1, Node n2, String tag) {
			String edgeId = getEdgeId(n1, n2);
			Edge edge = g.getEdge(edgeId);
			
			if (edge == null)
				edge = g.addEdge(edgeId, n1.getId(), n2.getId(), false);
			
			if (edge == null) {
				System.err.printf("[error] can not create edge '%s'\n", edgeId);
				return;
			}
			
			if (!tags2tagsEdges.containsKey(edgeId))
				tags2tagsEdges.put(edgeId, new HashSet<String>());
			
			HashSet<String> tags = tags2tagsEdges.get(edgeId);
			
			if (tags.contains(tag))
				return;
			
			tags.add(tag);
			
			edge.setAttribute("tags", stringify(tags));
			edge.setAttribute("size", tags.size());
		}
		
		protected String stringify(HashSet<String> tags) {
			StringBuilder buffer = new StringBuilder();
			
			for (String tag : tags)
				buffer.append(tag).append(";");
				
			return buffer.toString();
		}
		
		protected String getEdgeId(Node n1, Node n2) {
			if (n1.getId().compareTo(n2.getId()) < 0)
				return n1.getId() + "---" + n2.getId();
			
			return n2.getId() + "---" + n1.getId();
		}
	}
	
	private class HeartBeat extends SinkAdapter {
		HashMap<String, Long> dates;
		long delay;
		
		HeartBeat(long delay) {
			this.dates = new HashMap<String, Long>();
			this.delay = delay;
		}
		
		public void nodeAdded(String sourceId, long timeId, String nodeId) {
			beat(nodeId);
		}
		
		public void nodeRemoved(String sourceId, long timeId, String nodeId) {
			dates.remove(nodeId);
		}
		
		public void nodeAttributeAdded(String sourceId, long timeId, String nodeId, String attrId, Object value) {
			nodeAttributeChanged(sourceId, timeId, nodeId, attrId, null, value);
		}
		
		public void nodeAttributeChanged(String sourceId, long timeId, String nodeId, String attrId, Object oldValue, Object newValue) {
			if (attrId.equals("heartbeat"))
				beat(nodeId);
		}
		
		private void beat(String nodeId) {
			if (g.getNode(nodeId) == null)
				g.addNode(nodeId);
				
			dates.put(nodeId, System.currentTimeMillis());
		}
		
		private long getDelay(String nodeId) {
			if (!dates.containsKey(nodeId))
				return 0;
			
			return System.currentTimeMillis() - dates.get(nodeId);
		}
		
		public void check() {
			LinkedList<Node> toRemove = null;
			
			for (Node n : g.getEachNode()) {
				if (getDelay(n.getId()) > this.delay) {
					if (toRemove == null)
						toRemove = new LinkedList<Node>();
						
					toRemove.add(n);
				}
			}
			
			if (toRemove == null)
				return;
				
			while (toRemove.size() > 0) {
				Node n = toRemove.poll();
				System.err.printf("remove '%s' because there is no more heartbeat from him.\n", n.getId());
				g.removeNode(n);
			}
		}
	}
	
	/**
	 * @param args
	 * @throws IOException 
	 */
	public static void main(String[] args) throws IOException {
		new W3SinkDemoBoids();
	}
	
		
}
