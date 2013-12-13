HashMap<String,HashSet<Node>> tag2nodes;

public void nodeAttributeChanged(String sourceId, long timeId, String nodeId,
	String attrId, Object oldValue, Object newValue) {
	if (attrId.equals("tags")) {
		Node n = graph.getNode(nodeId);
		
		if (n == null)
			return;
	
		HashSet<String> currentTags = (HashSet<String>) n.getAttribute("tags");
		HashSet<String> newTags = new HashSet<String>();
		
		String[] tags = ((String) newValue).split(";");
		for (int i = 0; i < tags.length; i++)
			newTags.add(tags[i]);
		
		for (String tag : currentTags)
			if (!newTags.contains(tag))
				disconnect(n, tag);
		
		for (String tag : newTags)
			if (!currentTags.contains(tag))
				connect(n, tag);
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
	Edge edge = graph.getEdge(edgeId);
	
	if (edge == null)
		return;
	
	HashSet<String> tags = edge.getAttribute("tags");
	
	if (!tags.contains(tag))
		return;
	
	tags.remove(tag);
	
	if (tags.size() == 0)
		graph.removeEdge(edgeId);
	else
		edge.setAttribute("value", tags.size());
}

protected void connect(Node n, String tag) {
	if (!tag2nodes.containsKey(tag))
		tag2nodes.put(key, new HashSet<Node>());
	
	HashSet<Node> nodes = tag2nodes.get(tag);
	
	if (!nodes.contains(n)) {
		for (Node n2 : nodes)
			connect(n, n2, tag);
		
		nodes.add(n);
	}
}

protected void connect(Node n1, Node n2, String tag) {
	String edgeId = getEdgeId(n1, n2);
	Edge edge = graph.getEdge(edgeId);
	
	if (edge == null)
		edge = graph.addEdge(edgeId, n1.getId(), n2.getId(), false);
	
	if (!edge.hasAttribute("tags"))
		edge.addAttribute("tags", new HashSet<String>());
	
	HashSet<String> tags = edge.getAttribute("tags");
	
	if (tags.contains(tag))
		return;
	
	tags.add(tag);
	edge.setAttribute("value", tags.size());
}

protected String getEdgeId(Node n1, Node n2) {
	if (n1.getId().compareTo(n2.getId()) < 0)
		return n1.getId() + "---" + n2.getId();
	
	return n2.getId() + "---" + n1.getId();
}
