var w3sink = {};

function nid(id) {
    return "node_" + id;
}

function eid(id) {
    return "edge_" + id;
}

function setNodeAttribute(ns,id,k,v) {
    var e;

    if (typeof(id) == 'string')
	e = document.getElementById(id);
    else e = id;
    
    if(e == null) {
	// Failed here
    }
    
    e.setAttributeNS(ns,k,v);
};

function convertCssKey(k) {

}

w3sink.nid = nid;
w3sink.eid = eid;
w3sink.setNodeAttribute = setNodeAttribute;
