(function(){

 //total number of files to be uploaded
 var totalFiles = 0;
 var uploadedFiles = 0;   
// getElementById
function $id (id) {
    return document.getElementById(id);
}

// output information
function Output (msg) {
    var m = $id("messages");
    m.innerHTML = msg + m.innerHTML;
}

// file drag hover
function FileDragHover (e) {
    e.stopPropagation();
    e.preventDefault();
    e.target.className = (e.type == "dragover" ? "hover" : "");
}

// file selection
function FileSelectHandler (e) {
    //cancel event and hover styling
    FileDragHover(e);
    //fetch FileList object
    var files = e.target.files || e.dataTransfer.files;
    totalFiles = files.length;
   
    //process all file objects
    for (var i = 0,f; f = files[i]; i++) {
       // ParseFile(f);
        UploadFile(f);
    }
    
}
//total progress bar
function progressBar (i) {
    var progress = $id("total_progress").children[0];
    if(i=="0"){
        progress.style.backgroundPosition = "100% 0";
    }
    var pc = parseInt(100-(i / totalFiles*100));
    progress.style.backgroundPosition = pc + "% 0";
    if(i==totalFiles){
        i=0;
        totalFiles = 0;
        uploadedFiles = 0;
    }
    console.log(uploadedFiles);
    
}
// parse files to diplay
function ParseFile (file) {
    var type, ext = file.name.split('.').pop();
    if(ext == 'epr'){
        type = "Spectra data";
    }
    if(ext == "param"){
        type = "Parameter data";
    }
    Output(
            "<p>File information: <strong>" + file.name +
            "</strong> type: <strong>" + type +
            "</strong> size: <strong>" + file.size +
            "</strong> bytes</p>"
        );
}

//upload file asynchronously
function UploadFile (file) {
    var xhr;
    var ext = file.name.split('.').pop();
     if(window.XMLHttpRequest)
     {
        //under IE7+, chrome, FF, opera, safari
        xhr = new XMLHttpRequest();
     }
     else{
        //IE6/5
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
     }

     if(xhr.upload){
        //create progress bar
        var o = $id("progress");
        var progress = o.appendChild(document.createElement("p"));
        progress.id=file.name;
        progress.appendChild(document.createTextNode("upload" + file.name));
        //progress bar
        xhr.upload.addEventListener("progress",function(e){
            var pc = parseInt(100 - (e.loaded / e.total*100));
            progress.style.backgroundPosition = pc + "% 0";
        },false);
        //file received/failed
        xhr.onreadystatechange = function(e){
            if(xhr.readyState == 4 && xhr.status == 200){
                if(xhr.responseText == "exists"){
                    progress.className = "failure";
                    progress.appendChild(document.createTextNode("file already in database"));
                }
                else{
                    progress.className = "success";
                    var bar = document.getElementById(file.name);
                    var temp = o.removeChild(bar);
                    uploadedFiles++;
                    progressBar(uploadedFiles);
                   
                }
                
            }
            else{
                progress.className = "failure";
            }
        };
        //start upload
        var data = new FormData();
        data.append('file',file);
        xhr.open("POST", "server/upload_file.php", true);
        xhr.setRequestHeader("X_FILENAME",file.name);
        xhr.send(data);
     }
    
}

//initialize
function Init () {
    
    var fileselect = $id("fileselect"),
        filedrag = $id("filedrag"),
        submitbutton = $id("submitbutton");
    //process the file if the user uses the choose files button rather than drag drop
    fileselect.addEventListener("change", FileSelectHandler, false);
    //is XHR2 available?
    
    filedrag.style.display = "block";
    var xhr = new XMLHttpRequest();
    if(xhr.upload){
        //file drop
        filedrag.addEventListener("dragover", FileDragHover, false);
        filedrag.addEventListener("dragleave", FileDragHover, false);
        filedrag.addEventListener("drop", FileSelectHandler, false);
        //submitbutton.addEventListener("click", UploadFile, false);
        //remove submit button
        submitbutton.style.display="none";
        var q = $id("total_progress");
        var progress = q.appendChild(document.createElement("p"));
        
    }
}

 //call init for file upload file
if(window.File && window.FileList && window.FileReader){
   Init();
   
}
})();