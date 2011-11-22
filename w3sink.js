var w3sink = {};

function nid(id) {
    return "node_" + id;
}

function eid(id) {
    return "edge_" + id;
}

function set_node_attribute(ns,id,k,v) {
    var e = document.getElementById(id);
    
    if(e == null) {
	// Failed here
    }
    
    e.setAttributeNS(ns,k,v);
};

w3sink.nid = nid;
w3sink.eid = eid;
w3sink.set_node_attribute = set_node_attribute;
