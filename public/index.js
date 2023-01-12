
let position = [];
let data = [];
let view = {};
fetch("data").then(res => res.json()).then(res => {
    console.log(res);
    data = res;
    refreshView();
});
function refreshView(){
    view = data;
    document.getElementById("statusBar").innerHTML = "";
    let virtualPosition = [];
    
    let a = document.createElement("button");
    a.setAttribute("onclick", `jump([])`);
    a.innerText = "root";
    document.getElementById("statusBar").appendChild(a);
    for(i in position){
        view = view.children[position[i]];
        virtualPosition.push(position[i]);
        let a = document.createElement("button");
        a.setAttribute("onclick", `jump(${JSON.stringify(virtualPosition)})`);
        a.innerText = view.visibleName;
        document.getElementById("statusBar").appendChild(a);
    }
    document.getElementById("tree").innerHTML = "";
    for(i in view.children){
        let e = document.createElement("div");
        e.classList.add("listItem");
        if(view.children[i].type === "CollectionType"){
            e.setAttribute("onclick", `navigate('${i}')`)
            e.innerText = "📂 "+view.children[i].visibleName;
            e.classList.add("folder");
        }
        else if(view.children[i].type === "DocumentType"){
            e.innerText = "🗒 "+view.children[i].visibleName;
            e.setAttribute("onclick", `openFile('${i}')`)
        }
        document.getElementById("tree").appendChild(e);
    }
}
function openFile(uuid){
    window.location.pathname = `/pdf/${uuid}`;
}
function navigate(uuid){
    position.push(uuid);
    refreshView();
}
function jump(uuidList){
    position = uuidList;
    refreshView();
}